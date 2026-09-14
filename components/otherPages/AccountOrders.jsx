"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import he from "he";
import { useMenu } from "@/context/MenuContext";

const IMG_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const FILTER_TABS = [
  { key: "all", label: "All Orders", status: null },
  { key: "processing", label: "Processing", status: "processing" },
  { key: "shipped", label: "Shipped", status: "shipped" },
  { key: "delivered", label: "Delivered", status: "delivered,completed" },
  { key: "cancelled", label: "Cancelled", status: "cancelled,canceled" },
];

export default function AccountOrders() {
  const { currency } = useMenu();
  const [data, setData] = useState([]);
  const [orderSummaries, setOrderSummaries] = useState({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });
  const [pageCount, setPageCount] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [cancelDescription, setCancelDescription] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  // CUSTOMER_ID from localStorage
  const [CUSTOMER_ID, setCustomerId] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const u = JSON.parse(atob(raw));
          setCustomerId(u.id);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!CUSTOMER_ID) return;
    setLoading(true);

    const activeTab = FILTER_TABS.find((t) => t.key === activeStatus);
    const statusQuery = activeTab?.status;

    const params = new URLSearchParams({
      page: String(pagination.pageIndex + 1),
      pageSize: String(pagination.pageSize),
      orderBy: "created_at",
      orderDir: "desc",
      customer_id: String(CUSTOMER_ID),
      with_products: "1",
      ...(statusQuery ? { status: statusQuery } : {}),
    });

    try {
      const res = await fetch(`${IMG_BASE}api/customerOrders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const json = await res.json();
      const orders = json.data || [];
      setData(orders);

      const totalRecords = json.filtered ?? json.total ?? 0;
      setPageCount(Math.ceil(totalRecords / pagination.pageSize) || 1);

      // Map eagerly-loaded products
      const summaryResults = {};
      orders.forEach((order) => {
        if (order.products && order.products.length > 0) {
          summaryResults[order.id] = order.products;
        }
      });
      setOrderSummaries((prev) => ({ ...prev, ...summaryResults }));
    } catch {
      // ignore
    }
    setLoading(false);
  }, [CUSTOMER_ID, pagination.pageIndex, pagination.pageSize, activeStatus]);

  useEffect(() => {
    if (CUSTOMER_ID) {
      fetchOrders();
    }
  }, [CUSTOMER_ID, fetchOrders]);

  const openDetails = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setModalLoading(true);
    setModalDetails(null);

    try {
      const resp = await fetch(`${IMG_BASE}api/customerOrderDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      const json = await resp.json();
      setModalDetails(json);
      if (json.order) {
        setSelectedOrder(json.order);
      }
    } catch {
      setModalDetails(null);
    }
    setModalLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setModalDetails(null);
  };

  const openCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason("Changed my mind");
    setCancelDescription("");
    setCancelError(null);
    setCancelSuccess(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder || !CUSTOMER_ID) return;
    setIsCancelling(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const res = await fetch(`${IMG_BASE}api/customerCancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: cancellingOrder.id,
          customer_id: CUSTOMER_ID,
          reason: cancelReason,
          reason_description: cancelDescription,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCancelSuccess(json.message || "Order cancelled successfully");
        fetchOrders();
        setTimeout(() => {
          setShowCancelModal(false);
          setCancellingOrder(null);
          setCancelSuccess(null);
          if (showModal) {
            setShowModal(false);
          }
        }, 1500);
      } else {
        setCancelError(json.message || "Failed to cancel order");
      }
    } catch (err) {
      setCancelError(err?.message || "An error occurred while cancelling order");
    } finally {
      setIsCancelling(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const rawVal = status?.value || (typeof status === "string" ? status : "");
    const val = String(rawVal).toLowerCase().trim();
    const rawLabel = status?.label || (typeof status === "string" ? status : "") || "";
    const displayLabel = val === "completed" ? "Delivered" : rawLabel || val;

    let color = "#6B7280";
    let bg = "#F3F4F6";

    if (val === "processing" || val === "pending") {
      color = "#0284C7";
      bg = "#F0F9FF";
    } else if (val === "shipped") {
      color = "#4F46E5";
      bg = "#EEF2FF";
    } else if (val === "delivered" || val === "completed") {
      color = "#059669";
      bg = "#ECFDF5";
    } else if (val === "returned") {
      color = "#D97706";
      bg = "#FFFBEB";
    } else if (val === "cancelled" || val === "canceled") {
      color = "#DC2626";
      bg = "#FEF2F2";
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 12px",
          borderRadius: "9999px",
          fontSize: "11px",
          fontWeight: "600",
          color: color,
          backgroundColor: bg,
          textTransform: "capitalize",
          letterSpacing: "0.02em",
        }}
      >
        {displayLabel}
      </span>
    );
  };

  const isEligibleForCancel = (status) => {
    const val = (status?.value || (typeof status === "string" ? status : "")).toLowerCase().trim();
    return val === "processing" || val === "pending";
  };

  return (
    <div className={`account-orders-minimalist stagger-item ${mounted ? "is-visible" : ""}`}>
      {/* FILTER TABS */}
      <div className="section-header">
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${activeStatus === tab.key ? "active" : ""}`}
              onClick={() => {
                setActiveStatus(tab.key);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="order-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton skeleton-id"></div>
                <div className="skeleton skeleton-date"></div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton skeleton-thumb"></div>
                <div className="skeleton skeleton-thumb"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton skeleton-amount"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="order-list">
          {data.length > 0 ? (
            data.map((order) => {
              const canCancel = isEligibleForCancel(order.status);
              const products = orderSummaries[order.id] || order.products || [];

              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-id">Order {order.code}</span>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="order-card-content">
                    <div className="product-previews">
                      {products.slice(0, 4).map((prod, i) => (
                        <img
                          key={i}
                          className="product-thumb"
                          src={
                            prod.product_image
                              ? `${IMG_BASE}storage/${prod.product_image}`
                              : "/no-img.png"
                          }
                          alt={prod.product_name || ""}
                          title={prod.product_name || ""}
                        />
                      ))}
                    </div>
                    {products.length > 4 && (
                      <span className="product-count">+{products.length - 4} more</span>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label text-muted small me-1">Total: </span>
                      <span className="total-amount">
                        {Number(order.amount).toFixed(currency?.decimals ?? 2)}{" "}
                        {currency?.symbol || "SAR"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn-minimal" onClick={() => openDetails(order)}>
                        Order Details
                      </button>
                      {canCancel && (
                        <button
                          className="btn-minimal-danger"
                          onClick={() => openCancelModal(order)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-5 text-center text-muted">
              <p className="mb-0">No orders found in this section.</p>
            </div>
          )}
        </div>
      )}

      {/* PAGINATION */}
      {pageCount > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Page {pagination.pageIndex + 1} of {pageCount}
          </div>
          <div className="pagination-actions">
            <button
              className="pagination-btn"
              disabled={pagination.pageIndex === 0}
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            >
              <span>←</span> Previous
            </button>
            <button
              className="pagination-btn"
              disabled={pagination.pageIndex === pageCount - 1}
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            >
              Next <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      <Modal show={showModal} onHide={closeModal} centered className="order-modal" size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.01em" }}>
            Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {modalLoading ? (
            <div className="modal-body-content py-4">
              <div className="row mt-2">
                <div className="col-md-7">
                  <div className="skeleton mb-2" style={{ width: "150px", height: "20px" }}></div>
                  <div className="skeleton mb-4" style={{ width: "100px", height: "14px" }}></div>
                  <div className="item-list">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="skeleton"
                          style={{ width: "48px", height: "48px", borderRadius: "6px" }}
                        ></div>
                        <div className="flex-grow-1">
                          <div className="skeleton mb-2" style={{ width: "60%", height: "14px" }}></div>
                          <div className="skeleton" style={{ width: "30%", height: "12px" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-5">
                  <div
                    className="skeleton"
                    style={{ width: "100%", height: "200px", borderRadius: "12px" }}
                  ></div>
                </div>
              </div>
            </div>
          ) : modalDetails ? (
            <div className="modal-body-content">
              <div className="row mt-3">
                <div className="col-md-7">
                  <div className="order-meta mb-3">
                    <div className="d-flex align-items-center gap-3 justify-content-between mb-1">
                      <span className="order-date" style={{ margin: 0 }}>
                        Placed on{" "}
                        {new Date(selectedOrder?.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <StatusBadge status={selectedOrder?.status} />
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Order {selectedOrder?.code}
                    </div>
                  </div>

                  <div className="item-list">
                    {(modalDetails.order_products || []).map((item, idx) => (
                      <div key={idx} className="order-item-card">
                        <div className="order-item-main">
                          <img
                            className="item-img"
                            src={
                              item.product_image
                                ? `${IMG_BASE}storage/${item.product_image}`
                                : "/no-img.png"
                            }
                            alt=""
                          />
                          <div className="item-info">
                            <div className="item-name">{he.decode(item.product_name || "")}</div>
                            {item.is_gift === 1 && (
                              <span className="badge bg-light text-dark border me-2 small">
                                Free Gift
                              </span>
                            )}
                            <div className="item-price">
                              {item.qty} ×{" "}
                              {Number(
                                (item.gross_amount || item.price || 0) / (item.qty || 1)
                              ).toFixed(currency?.decimals ?? 2)}{" "}
                              {currency?.symbol || "SAR"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="summary-card">
                    <h6
                      className="mb-3"
                      style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "-0.01em" }}
                    >
                      Order Summary
                    </h6>

                    {(() => {
                      const currentOrder = modalDetails?.order || selectedOrder;
                      const subTotal = Number(currentOrder?.sub_total || 0);
                      const shippingCost =
                        Number(currentOrder?.shipping_amount || 0) +
                        Number(currentOrder?.shipping_amount_vat || 0);
                      const serviceFee =
                        Number(currentOrder?.service_amount || 0) +
                        Number(currentOrder?.service_amount_vat || 0);
                      const codCharge =
                        Number(currentOrder?.cod_charge || 0) +
                        Number(currentOrder?.cod_charge_vat || 0);
                      const discountAmount = Number(currentOrder?.discount_amount || 0);
                      const totalAmount = Number(currentOrder?.amount || 0);
                      const totalVat = Number(currentOrder?.tax_amount || 0);
                      const isCod =
                        currentOrder?.payment_channel === "cod" || codCharge > 0;

                      return (
                        <table className="checkout-totals w-100">
                          <tbody>
                            <tr>
                              <th>SUBTOTAL</th>
                              <td>
                                {subTotal.toFixed(currency?.decimals ?? 2)}{" "}
                                {currency?.symbol || "SAR"}
                              </td>
                            </tr>
                            <tr>
                              <th>SHIPPING</th>
                              <td>
                                {shippingCost <= 0
                                  ? "Free Shipping"
                                  : `${shippingCost.toFixed(currency?.decimals ?? 2)} ${
                                      currency?.symbol || "SAR"
                                    }`}
                              </td>
                            </tr>
                            {serviceFee > 0 && (
                              <tr>
                                <th>SERVICE FEE</th>
                                <td>
                                  {serviceFee.toFixed(currency?.decimals ?? 2)}{" "}
                                  {currency?.symbol || "SAR"}
                                </td>
                              </tr>
                            )}
                            {isCod && (
                              <tr>
                                <th>COD CHARGES</th>
                                <td>
                                  {codCharge.toFixed(currency?.decimals ?? 2)}{" "}
                                  {currency?.symbol || "SAR"}
                                </td>
                              </tr>
                            )}
                            {(discountAmount > 0 || currentOrder?.coupon_code) && (
                              <tr>
                                <th>DISCOUNT {currentOrder?.coupon_code ? `(${currentOrder.coupon_code})` : ""}</th>
                                <td className="text-danger">
                                  -{discountAmount.toFixed(currency?.decimals ?? 2)}{" "}
                                  {currency?.symbol || "SAR"}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th>TOTAL</th>
                              <td>
                                {totalAmount.toFixed(currency?.decimals ?? 2)}{" "}
                                {currency?.symbol || "SAR"}{" "}
                                <span className="small text-muted d-block fw-normal">
                                  (includes {totalVat.toFixed(currency?.decimals ?? 2)}{" "}
                                  {currency?.symbol || "SAR"} VAT)
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    })()}

                    <div className="address-section">
                      <div className="address-title">Payment Method</div>
                      <p className="address-text mb-0">
                        {(() => {
                          const currentOrder = modalDetails?.order || selectedOrder;
                          return currentOrder?.payment_channel
                            ? { cod: "Cash on Delivery", paytabs: "PayTabs", tamara: "Tamara" }[
                                currentOrder.payment_channel
                              ] || currentOrder.payment_channel
                            : "—";
                        })()}
                      </p>
                    </div>

                    {modalDetails?.order_address?.[0] && (
                      <>
                        <div className="address-section">
                          <div className="address-title">Contact Information</div>
                          <p className="address-text mb-0">
                            {modalDetails.order_address[0].name}
                            <br />
                            {modalDetails.order_address[0].phone}
                            <br />
                            {modalDetails.order_address[0].email}
                          </p>
                        </div>

                        <div className="address-section">
                          <div className="address-title">Shipping Address</div>
                          <p className="address-text mb-0">
                            {modalDetails.order_address[0].address}
                            <br />
                            {modalDetails.order_address[0].city}
                            {modalDetails.order_address[0].state
                              ? `, ${modalDetails.order_address[0].state}`
                              : ""}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted">Failed to load order details.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 d-flex justify-content-between">
          {isEligibleForCancel(selectedOrder?.status) ? (
            <button
              className="btn-minimal-danger"
              onClick={() => {
                setShowModal(false);
                openCancelModal(selectedOrder);
              }}
            >
              Cancel Order
            </button>
          ) : (
            <div></div>
          )}
          <button className="btn-minimal" onClick={closeModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── CANCELLATION CONFIRMATION MODAL ── */}
      <Modal
        show={showCancelModal}
        onHide={() => !isCancelling && setShowCancelModal(false)}
        centered
        className="order-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: "17px", fontWeight: "700" }}>
            Cancel Order #{cancellingOrder?.code || cancellingOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-2">
          {cancelSuccess ? (
            <div className="alert alert-success d-flex align-items-center mb-0">
              <span className="me-2">✅</span> {cancelSuccess}
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Are you sure you want to cancel this order? Once cancelled, the items will be
                returned to stock and this action cannot be undone.
              </p>

              {cancelError && (
                <div className="alert alert-danger py-2 mb-3 small">⚠️ {cancelError}</div>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: "11px" }}>
                  Reason for Cancellation
                </Form.Label>
                <Form.Select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isCancelling}
                  className="shadow-none border rounded-3"
                  style={{ fontSize: "13px" }}
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered wrong item / size">Ordered wrong item / size</option>
                  <option value="Need to change shipping address / phone">
                    Need to change shipping address / phone
                  </option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Other">Other reason</option>
                </Form.Select>
              </Form.Group>

              {cancelReason === "Other" && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: "11px" }}>
                    Please describe the reason
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter details..."
                    value={cancelDescription}
                    onChange={(e) => setCancelDescription(e.target.value)}
                    disabled={isCancelling}
                    className="shadow-none border rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        {!cancelSuccess && (
          <Modal.Footer className="border-0 pt-0">
            <button
              className="btn-minimal"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Order
            </button>
            <button
              className="btn-minimal-danger"
              style={{ padding: "8px 20px" }}
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Cancelling…
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}