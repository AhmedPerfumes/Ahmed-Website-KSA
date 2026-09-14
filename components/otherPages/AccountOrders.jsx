"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useMenu } from "@/context/MenuContext";
import styles from "./AccountOrders.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Status badge styling helper
function getStatusBadge(statusObj) {
  const val = (statusObj?.value || statusObj || "").toLowerCase();
  const label = statusObj?.label || (val ? val.charAt(0).toUpperCase() + val.slice(1) : "Unknown");

  let badgeClass = styles.badgeCancelled;
  if (val === "processing") badgeClass = styles.badgeProcessing;
  else if (val === "pending") badgeClass = styles.badgePending;
  else if (val === "shipped") badgeClass = styles.badgeShipped;
  else if (val === "completed" || val === "delivered") badgeClass = styles.badgeCompleted;
  else if (val === "returned") badgeClass = styles.badgeReturned;
  else if (val === "cancelled") badgeClass = styles.badgeCancelled;

  return { label, badgeClass, isProcessing: val === "processing" };
}

// Payment method helper
function getPaymentMethodLabel(channel) {
  const map = {
    cod: "Cash on Delivery",
    paytabs: "PayTabs",
    tamara: "Tamara",
    tabby: "Tabby",
    card: "Credit / Debit Card",
    bank_transfer: "Bank Transfer",
  };
  return map[channel] || channel || "Online Payment";
}

// Date formatter
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AccountOrders() {
  const { currency } = useMenu() || {};
  const currencySymbol = currency?.symbol || " SAR";

  // Customer ID from localStorage
  const [customerId, setCustomerId] = useState(null);

  // Orders data
  const [orders, setOrders] = useState([]);
  const [orderSummaries, setOrderSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Filters & Sorting
  const [statusTab, setStatusTab] = useState("all");
  const [searchCode, setSearchCode] = useState("");
  const [sortOption, setSortOption] = useState("processing_first");

  // Details Modal
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [cancelDescription, setCancelDescription] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  // Load customer ID from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(atob(raw));
        if (u?.id) setCustomerId(u.id);
      } catch (e) {
        console.error("Failed to decode user data", e);
      }
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);

    const params = new URLSearchParams({
      customer_id: String(customerId),
      page: String(page),
      pageSize: String(pageSize),
      orderBy: "created_at",
      orderDir: "desc",
    });

    if (searchCode.trim()) {
      params.set("code", searchCode.trim());
    }

    if (statusTab !== "all") {
      params.set("status", statusTab);
    }

    try {
      const res = await fetch(`${API_BASE}api/customerOrders?${params}`);
      const json = await res.json();
      const orderList = json.data || [];
      setOrders(orderList);
      setTotalFiltered(json.filtered ?? json.total ?? orderList.length);

      // Populate summaries from eager-loaded products if available, or fetch fallback
      const summaries = {};
      const pendingFetchIds = [];

      orderList.forEach((ord) => {
        if (ord.products && Array.isArray(ord.products)) {
          summaries[ord.id] = ord.products;
        } else {
          pendingFetchIds.push(ord.id);
        }
      });

      if (pendingFetchIds.length > 0) {
        await Promise.all(
          pendingFetchIds.map(async (id) => {
            try {
              const detailRes = await fetch(`${API_BASE}api/customerOrderDetails`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: id }),
              });
              const detailJson = await detailRes.json();
              summaries[id] = detailJson.order_products || [];
            } catch {
              summaries[id] = [];
            }
          })
        );
      }

      setOrderSummaries(summaries);
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, page, pageSize, searchCode, statusTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle client-side sorting if user chooses other sort options
  const sortedOrders = useMemo(() => {
    const list = [...orders];

    if (sortOption === "processing_first") {
      return list.sort((a, b) => {
        const aStatus = (a.status?.value || a.status || "").toLowerCase();
        const bStatus = (b.status?.value || b.status || "").toLowerCase();
        const aProc = aStatus === "processing" ? 0 : aStatus === "pending" ? 1 : 2;
        const bProc = bStatus === "processing" ? 0 : bStatus === "pending" ? 1 : 2;
        if (aProc !== bProc) return aProc - bProc;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
    }

    if (sortOption === "date_desc") {
      return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    if (sortOption === "date_asc") {
      return list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }

    if (sortOption === "amount_desc") {
      return list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    }

    if (sortOption === "amount_asc") {
      return list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
    }

    return list;
  }, [orders, sortOption]);

  // View order details in modal
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setModalLoading(true);
    setModalDetails(null);

    try {
      const res = await fetch(`${API_BASE}api/customerOrderDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      const json = await res.json();
      setModalDetails(json);
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Open cancel order modal
  const openCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason("Changed my mind");
    setCancelDescription("");
    setCancelError(null);
    setCancelSuccess(null);
    setShowCancelModal(true);
  };

  // Confirm order cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingOrder || !customerId) return;
    setIsCancelling(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const res = await fetch(`${API_BASE}api/customerCancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: cancellingOrder.id,
          customer_id: customerId,
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
          if (showModal) setShowModal(false);
        }, 1400);
      } else {
        setCancelError(json.message || "Failed to cancel order");
      }
    } catch (err) {
      setCancelError(err.message || "An error occurred while cancelling order");
    } finally {
      setIsCancelling(false);
    }
  };

  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;

  return (
    <div className={`col-lg-9 ${styles.container}`}>
      {/* ── HEADER ── */}
      <div className={styles.headerSection}>
        <h3 className={styles.title}>My Purchases</h3>
        <p className={styles.subtitle}>
          Track your purchases, check delivery status, and review past orders.
        </p>
      </div>

      {/* ── CONTROLS: TABS, SEARCH & SORT ── */}
      <div className={styles.controlsRow}>
        {/* Status Filter Tabs */}
        <div className={styles.tabsContainer}>
          {[
            { key: "all", label: "All Orders" },
            { key: "processing", label: "Processing" },
            { key: "shipped", label: "Shipped" },
            { key: "completed", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabButton} ${
                statusTab === tab.key ? styles.tabButtonActive : ""
              }`}
              onClick={() => {
                setStatusTab(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className={styles.searchSortGroup}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by Order #..."
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="processing_first">Processing First</option>
            <option value="date_desc">Newest Date</option>
            <option value="date_asc">Oldest Date</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* ── ORDERS LIST ── */}
      {loading ? (
        <div className={styles.orderList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} style={{ width: "40%" }} />
              <div className={styles.skeletonLine} style={{ width: "80%", height: "20px" }} />
              <div className={styles.skeletonLine} style={{ width: "25%" }} />
            </div>
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 01-8 0"></path>
          </svg>
          <h4 className={styles.emptyTitle}>No Orders Found</h4>
          <p className={styles.emptyDesc}>
            {searchCode || statusTab !== "all"
              ? "No purchases match your current search or filter criteria."
              : "You haven't placed any purchases yet. Discover our exclusive perfume collection."}
          </p>
          <Link href="/shop-8" className={styles.btnShop}>
            Explore Perfumes
          </Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {sortedOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const prods = orderSummaries[order.id] || order.products || [];
            const canCancel = ["processing", "pending"].includes(
              (order.status?.value || order.status || "").toLowerCase()
            );

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderNumber}>
                      Order #{order.code || order.id}
                    </span>
                    <span className={styles.orderDate}>
                      Placed on {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className={styles.headerRight}>
                    <span className={`${styles.badge} ${statusInfo.badgeClass}`}>
                      <span className={styles.statusDot} />
                      {statusInfo.label}
                    </span>
                    <span className={styles.orderAmount}>
                      {Number(order.amount || 0).toFixed(2)}
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Card Body: Products Preview */}
                <div className={styles.cardBody}>
                  {prods.length > 0 ? (
                    <div className={styles.productsRow}>
                      {prods.slice(0, 3).map((item, idx) => (
                        <div key={item.id || idx} className={styles.productItem}>
                          <img
                            src={
                              item.product_image
                                ? `${API_BASE}storage/${item.product_image}`
                                : "/no-img.png"
                            }
                            alt={item.product_name || "Product"}
                            className={styles.productThumb}
                            onError={(e) => {
                              e.currentTarget.src = "/no-img.png";
                            }}
                          />
                          <div className={styles.productInfo}>
                            <div className={styles.productName} title={item.product_name}>
                              {item.product_name}
                            </div>
                            <div className={styles.productMeta}>
                              Qty: {item.qty || 1} × {Number(item.price || item.gross_amount || 0).toFixed(2)}
                              {currencySymbol}
                              {item.is_gift === 1 && (
                                <span className={styles.giftTag}>• Gift</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {prods.length > 3 && (
                        <div className={styles.moreProductsBadge}>
                          +{prods.length - 3} more items
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted small py-1">
                      {Number(order.amount || 0).toFixed(2)} {currencySymbol} order
                    </div>
                  )}
                </div>

                {/* Card Footer: Actions */}
                <div className={styles.cardFooter}>
                  <div className={styles.paymentTag}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>{getPaymentMethodLabel(order.payment_channel)}</span>
                  </div>

                  <div className={styles.cardActions}>
                    {canCancel && (
                      <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={() => openCancelModal(order)}
                      >
                        Cancel Order
                      </button>
                    )}

                    <button
                      type="button"
                      className={styles.btnDetails}
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className={styles.paginationRow}>
          <div className={styles.pageInfo}>
            Showing page {page} of {totalPages} ({totalFiltered} total purchases)
          </div>
          <div className={styles.pageButtons}>
            <button
              type="button"
              className={styles.btnPage}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.btnPage}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── ORDER DETAILS MODAL ── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: "16px" }}
      >
        <Modal.Header closeButton className={styles.modalHeaderCustom}>
          <div>
            <Modal.Title className={styles.modalTitleCustom}>
              Order #{selectedOrder?.code || selectedOrder?.id}
            </Modal.Title>
            <div className="small text-muted mt-1">
              Placed on {formatDate(selectedOrder?.created_at)}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-4">
          {modalLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="dark" />
            </div>
          ) : modalDetails ? (
            <div className="row g-4">
              {/* Left Column: Delivery & Payment Details */}
              <div className="col-md-5">
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Status</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {(() => {
                      const st = getStatusBadge(selectedOrder?.status);
                      return (
                        <span className={`${styles.badge} ${st.badgeClass}`}>
                          <span className={styles.statusDot} />
                          {st.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Shipping Address</div>
                  <div className={styles.detailValue}>
                    {modalDetails.order_address?.[0]?.name && (
                      <div className="fw-semibold mb-1">
                        {modalDetails.order_address[0].name}
                      </div>
                    )}
                    {modalDetails.order_address?.[0]?.phone && (
                      <div className="small text-muted mb-1">
                        📞 {modalDetails.order_address[0].phone}
                      </div>
                    )}
                    <div className="small text-secondary">
                      {[
                        modalDetails.order_address?.[0]?.address,
                        modalDetails.order_address?.[0]?.city,
                        modalDetails.order_address?.[0]?.state,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No address provided"}
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Payment Method</div>
                  <div className={styles.detailValue}>
                    {getPaymentMethodLabel(selectedOrder?.payment_channel)}
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered Items & Price Summary */}
              <div className="col-md-7">
                <div className={styles.detailLabel}>Ordered Items</div>
                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                    paddingRight: "4px",
                    marginBottom: "16px",
                  }}
                >
                  {(modalDetails.order_products || []).map((prod) => (
                    <div key={prod.id} className={styles.modalProductItem}>
                      <img
                        src={
                          prod.product_image
                            ? `${API_BASE}storage/${prod.product_image}`
                            : "/no-img.png"
                        }
                        alt={prod.product_name}
                        className={styles.productThumb}
                        onError={(e) => {
                          e.currentTarget.src = "/no-img.png";
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold small text-truncate" title={prod.product_name}>
                          {prod.product_name}
                        </div>
                        <div className="small text-muted">
                          Qty: {prod.qty}
                          {prod.is_gift === 1 && (
                            <span className={styles.giftTag}> • Free Gift</span>
                          )}
                        </div>
                      </div>
                      <div className="text-end fw-semibold small">
                        {Number(prod.gross_amount || prod.price * prod.qty || 0).toFixed(2)}
                        {currencySymbol}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-top">
                  <div className={styles.priceBreakdownRow}>
                    <span>Subtotal</span>
                    <span>
                      {Number(selectedOrder?.sub_total || 0).toFixed(2)}
                      {currencySymbol}
                    </span>
                  </div>

                  <div className={styles.priceBreakdownRow}>
                    <span>Shipping Cost</span>
                    <span>
                      {selectedOrder?.shipping_cost && Number(selectedOrder.shipping_cost) > 0
                        ? `${Number(selectedOrder.shipping_cost).toFixed(2)}${currencySymbol}`
                        : Number(selectedOrder?.sub_total || 0) >= 400
                        ? "Free Shipping"
                        : `${(modalDetails.shipping_cost || 0).toFixed(2)}${currencySymbol}`}
                    </span>
                  </div>

                  {selectedOrder?.coupon_code && (
                    <div className={styles.priceBreakdownRow}>
                      <span className="text-success">
                        Coupon ({selectedOrder.coupon_code})
                      </span>
                      <span className="text-success fw-semibold">Applied</span>
                    </div>
                  )}

                  <div className={styles.grandTotalRow}>
                    <div>
                      <div>Total</div>
                      <div className="small text-muted fw-normal" style={{ fontSize: "0.72rem" }}>
                        Includes {Number(selectedOrder?.tax_amount || 0).toFixed(2)}
                        {currencySymbol} VAT
                      </div>
                    </div>
                    <div>
                      {Number(selectedOrder?.amount || 0).toFixed(2)}
                      {currencySymbol}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              Unable to load order details.
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
          {["processing", "pending"].includes(
            (selectedOrder?.status?.value || selectedOrder?.status || "").toLowerCase()
          ) ? (
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-pill px-3"
              onClick={() => {
                setShowModal(false);
                openCancelModal(selectedOrder);
              }}
            >
              Cancel Order
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="dark"
            size="sm"
            className="rounded-pill px-4"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── CANCELLATION MODAL ── */}
      <Modal
        show={showCancelModal}
        onHide={() => !isCancelling && setShowCancelModal(false)}
        centered
        contentClassName="border-0 shadow"
        style={{ borderRadius: "16px" }}
      >
        <Modal.Header closeButton={!isCancelling} className={styles.modalHeaderCustom}>
          <Modal.Title className={styles.modalTitleCustom}>
            Cancel Order #{cancellingOrder?.code || cancellingOrder?.id}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {cancelSuccess ? (
            <div className="alert alert-success d-flex align-items-center mb-0">
              <span className="me-2">✓</span> {cancelSuccess}
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Are you sure you want to cancel this order? Once cancelled, this action cannot be undone.
              </p>

              {cancelError && (
                <div className="alert alert-danger py-2 mb-3 small">
                  {cancelError}
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted text-uppercase">
                  Reason for Cancellation
                </Form.Label>
                <Form.Select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isCancelling}
                  className="shadow-none border rounded-3"
                  style={{ fontSize: "0.88rem" }}
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
                  <Form.Label className="small fw-semibold text-muted text-uppercase">
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
                    style={{ fontSize: "0.88rem" }}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>

        {!cancelSuccess && (
          <Modal.Footer className="border-0 pt-0 px-4 pb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="rounded-pill px-4 fw-semibold"
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
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}