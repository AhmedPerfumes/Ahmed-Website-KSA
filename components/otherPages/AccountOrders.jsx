"use client";
import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Card,
  Row,
  Col,
  Form,
  Spinner,
  Button,
  Modal,
  Nav,
  Badge,
} from "react-bootstrap";

const columnHelper = createColumnHelper();
const IMG_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AccountOrders() {
  // Table & fetch state
  const [data, setData] = useState([]);
  const [orderSummaries, setOrderSummaries] = useState({}); // { [orderId]: [products] }
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState(null);
  const [modalOrderOuter, setModalOrderOuter] = useState(null);

  // Filters
  const [codeFilter, setCodeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  // CUSTOMER_ID from localStorage
  const [CUSTOMER_ID, setCustomerId] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(atob(raw));
        setCustomerId(u.id);
      } catch {
        // ignore
      }
    }
  }, []);

  // Table columns
  const columns = [
    columnHelper.accessor("code", {
      header: "Order #",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("created_at", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      enableSorting: true,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.row.original.status?.value;
        const label = info.row.original.status?.label || "";
        return (
          <span>
            <Badge
              bg={
                val === "processing"
                  ? "info"
                  : val === "shipped"
                  ? "primary"
                  : val === "completed"
                  ? "success"
                  : val === "returned"
                  ? "warning"
                  : val === "cancelled"
                  ? "danger"
                  : "secondary"
              }
              className="rounded-pill px-3 py-1"
              style={{ fontSize: "0.90em" }}
            >
              {label}
            </Badge>
          </span>
        );
      },
      enableSorting: false,
    }),
    columnHelper.accessor("payment_channel", {
      header: "Payment Method",
      cell: (info) =>
        ({ cod: "Cash on Delivery", paytabs: "PayTabs" }[info.getValue()] ||
        info.getValue()),
      enableSorting: false,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          className="btn-rounded btn-link_lg text-uppercase fw-medium"
          size="sm"
          style={{ borderRadius: "30px" }}
          onClick={() => handleView(row.original)}
        >
          ORDER DETAILS
        </Button>
      ),
      enableSorting: false,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Fetch table data and order product summary data
  useEffect(() => {
    if (!CUSTOMER_ID) return;
    (async () => {
      setLoading(true);
      const BASE = process.env.NEXT_PUBLIC_API_URL;
      const { pageIndex, pageSize } = pagination;
      const sort = sorting[0] || { id: "code", desc: false };
      const params = new URLSearchParams({
        page: String(pageIndex + 1),
        pageSize: String(pageSize),
        orderBy: sort.id,
        orderDir: sort.desc ? "desc" : "asc",
        customer_id: String(CUSTOMER_ID),
      });
      if (codeFilter) params.set("code", codeFilter);
      if (dateFilter) params.set("created_at", dateFilter);

      try {
        const res = await fetch(`${BASE}api/customerOrders?${params}`);
        const json = await res.json();
        setData(json.data);
        setPageCount(Math.ceil(json.total / pageSize));
        // Fetch product summaries for each order (just 1 API per order, not full details, just products)
        const summaryResults = {};
        await Promise.all(
          json.data.map(async (order) => {
            try {
              const detailRes = await fetch(`${BASE}api/customerOrderDetails`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: order.id }),
              });
              const detailJson = await detailRes.json();
              summaryResults[order.id] = detailJson.order_products || [];
            } catch {}
          })
        );
        setOrderSummaries(summaryResults);
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [CUSTOMER_ID, sorting, pagination, codeFilter, dateFilter]);

  // Sections for filtering
  const sections = [
    {
      key: "processing-shipped",
      title: "Processing & Shipped",
      filter: (r) => ["processing", "shipped"].includes(r.original.status.value),
    },
    {
      key: "completed",
      title: "Completed",
      filter: (r) => r.original.status.value === "completed",
    },
    {
      key: "returned",
      title: "Returned",
      filter: (r) => r.original.status.value === "returned",
    },
    {
      key: "cancelled",
      title: "Cancelled",
      filter: (r) => r.original.status.value === "cancelled",
    },
  ];

  // --- Handle Modal Data Fetch ---
  const handleView = async (order) => {
    setShowModal(true);
    setModalLoading(true);
    setModalDetails(null);
    setModalOrderOuter(order);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL;
      const resp = await fetch(`${BASE}api/customerOrderDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      const json = await resp.json();
      setModalDetails(json);
    } catch {
      setModalDetails(null);
    }
    setModalLoading(false);
  };

  // --- Modern Table Render with Product Summary Row ---
  function ModernOrderTable({ rows }) {
    return (
      <div className="modern-table-responsive">
        <table className="modern-table w-100 mb-0">
          <thead>
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  className="text-secondary text-white small"
                  style={{
                    fontWeight: "600",
                    background: "#000000ff",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted()
                    ? header.column.getIsSorted() === "asc"
                      ? " ▲"
                      : " ▼"
                    : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  {/* PRODUCT SUMMARY ROW */}
                  <tr className="product-summary-row">
                    <td
                      colSpan={columns.length}
                      style={{ padding: 0, background: "#f8fbff" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          padding: "30px 10px 30px 0",
                          gap: 16,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                          borderBottom: "1px solid #535353ff",
                        }}
                      >
                        {(orderSummaries[row.original.id] || [])
                          .slice(0, 2)
                          .map((prod, i) => (
                            <div
                              key={prod.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginRight: 24,
                                minWidth: 0,
                              }}
                            >
                              <img
                                src={
                                  prod.product_image
                                    ? `${IMG_BASE}storage/${prod.product_image}`
                                    : "/no-img.png"
                                }
                                alt={prod.product_name}
                                style={{
                                  width: 42,
                                  height: 42,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  marginRight: 10,
                                  border: "1.5px solid #e6e6e6",
                                }}
                              />
                              {/* <img
                            src='http://localhost/ahmed-admin/public/storage/products/marj-2.jpg'
                            alt={prod.product_image}
                            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, marginRight: 16 }}
                          /> */}
                              <span
                                style={{
                                  fontWeight: 500,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: "1em",
                                }}
                              >
                                {prod.product_name}
                              </span>
                              <span
                                style={{
                                  color: "#4c4c4c",
                                  fontWeight: 400,
                                  marginLeft: 10,
                                  fontSize: ".97em",
                                }}
                              >
                                {prod.qty} × {Number(prod.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        {(orderSummaries[row.original.id] || []).length > 2 && (
                          <span
                            style={{
                              fontSize: ".95em",
                              fontWeight: 500,
                              color: "#555",
                            }}
                          >
                            +{(orderSummaries[row.original.id].length - 2)} more
                          </span>
                        )}
                        {(orderSummaries[row.original.id] || []).length === 0 && (
                          <span
                            className="text-muted"
                            style={{ fontSize: ".97em" }}
                          >
                            No products
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr className="modern-table-row">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-muted py-4"
                >
                  No orders in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <style jsx>{`
          .modern-table {
            border-radius: 18px;
            box-shadow: 0 3px 18px rgba(110, 120, 160, 0.07);
            overflow: hidden;
            background: #fff;
          }
          .modern-table thead th {
            border-bottom: 2px solid #eef0f4;
            padding: 16px 12px;
          }
          .modern-table-row {
            transition: background 0.18s;
            border-bottom: 3px solid #000000ff;
          }
          .modern-table-row:hover {
            background: #f8fbff;
          }
          .modern-table td {
            vertical-align: middle;
            padding: 16px 12px;
            font-size: 1.01em;
          }
          .product-summary-row td {
            border-top: none !important;
            padding-top: 0 !important;
          }
          @media (max-width: 991px) {
            .modern-table th,
            .modern-table td {
              padding: 14px 6px;
            }
          }
          @media (max-width: 600px) {
            .modern-table thead {
              display: none;
            }
            .modern-table tr,
            .modern-table td {
              display: block;
              width: 100%;
            }
            .modern-table-row {
              border-radius: 14px;
              margin-bottom: 12px;
              box-shadow: 0 1px 6px rgba(110, 120, 160, 0.09);
              border: none;
              background: #fff;
              display: block;
            }
            .modern-table td {
              padding: 10px 12px !important;
              font-size: 0.99em;
              border: none;
              border-bottom: 1px solid #f3f3f3;
            }
            .product-summary-row td {
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // -- Render for all/one section
  const allRows = table.getRowModel().rows;
  const renderTables = () =>
    sections.map((sec) => {
      const rows = allRows.filter(sec.filter);
      return (
        <div className="mb-5" key={sec.key}>
          <div className="d-flex align-items-center mb-2 mt-2">
            <h5 className="mb-0 text-dark">{sec.title}</h5>
          </div>
          <ModernOrderTable rows={rows} />
        </div>
      );
    });

  const renderSingle = () => {
    const section = sections.find((s) => s.key === activeStatus) || {};
    const rows = allRows.filter(section.filter);
    return (
      <div className="mb-5">
        <div className="d-flex align-items-center mb-2 mt-2">
          <h5 className="mb-0 text-dark">{section.title}</h5>
        </div>
        <ModernOrderTable rows={rows} />
      </div>
    );
  };

  return (
    <>
      {/* TAB STYLES FOR ACTIVE COLORS AND MOBILE SCROLL */}
      <style jsx global>{`
        .nav-tabs {
          overflow-x: auto;
          overflow-y: hidden;
          flex-wrap: nowrap;
          border-bottom: 2px solid #e7e7e7;
          scrollbar-width: thin;
        }
        .nav-tabs .nav-item {
          flex: 0 0 auto;
          min-width: 110px;
        }
        .nav-tabs .nav-link {
          color: #222 !important;
          background: transparent;
          border: none;
          border-bottom: 2.5px solid transparent;
          transition: all 0.18s;
          padding-bottom: 10px;
          border-radius: 30px !important;
          white-space: nowrap;
        }
        .nav-tabs .nav-link.active,
        .nav-tabs .nav-link:focus,
        .nav-tabs .nav-link.active:focus {
          color: #fff !important;
          background: #171717 !important;
          border-bottom: 2.5px solid #1a1a1a !important;
          box-shadow: 0 2px 12px 0 rgba(30, 34, 55, 0.1);
        }
        .nav-tabs .nav-link:hover:not(.active) {
          color: #000 !important;
          background: #f2f2f2 !important;
          border-bottom: 2.5px solid #c1c1c1 !important;
        }
        .nav-link.active::before {
          background: none;
        }
        @media (max-width: 600px) {
          .nav-tabs .nav-link {
            font-size: 0.97em;
            padding-left: 14px;
            padding-right: 14px;
          }
          .col-md-6 {
            width: 100% !important;
            flex: 0 0 100%;
            max-width: 100%;
          }
        }
      `}</style>
      <div
        className="col-lg-9"
        style={{
          fontFamily: "SofiaProRegular, sans‑serif",
          border: "1px solid #e9e9e9",
          borderRadius: ".75rem",
          padding: "50px",
        }}
      >
        {/* STATUS TABS */}
        <Nav
          variant="tabs"
          activeKey={activeStatus}
          onSelect={setActiveStatus}
          className="mb-4 border-bottom flex-nowrap"
        >
          <Nav.Item style={{ width: "auto", marginBottom: "2rem" }}>
            <Nav.Link eventKey="all" className="text-uppercase fw-semibold">
              All Status
            </Nav.Link>
          </Nav.Item>
          {sections.map((sec) => (
            <Nav.Item key={sec.key} style={{ width: "auto", height: "auto" }}>
              <Nav.Link eventKey={sec.key} className="text-uppercase fw-semibold">
                {sec.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : activeStatus === "all" ? (
          renderTables()
        ) : (
          renderSingle()
        )}

        {/* PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="text-secondary small">
            Page {pagination.pageIndex + 1} of {pageCount}
          </div>
          <div className="btn-group">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header className="bg-dark border-0">
          <Modal.Title className="text-white">Order Details</Modal.Title>
          <Button variant="close" onClick={() => setShowModal(false)} />
        </Modal.Header>
        {/* Responsive 2 columns: stack on small, side by side on md+ */}
        <Modal.Body className="p-4" style={{ minHeight: 350 }}>
          {modalLoading ? (
            <div className="py-4 text-center">
              <Spinner />
            </div>
          ) : modalDetails &&
            modalDetails.order_products &&
            modalDetails.order_address ? (
            <div
              className="row g-5 flex-md-row flex-column"
              style={{ fontFamily: "Inter, Arial, sans-serif" }}
            >
              <div className="col-md-6 mb-4 mb-md-0">
                <div className="mb-4">
                  <div className="mb-1 text-uppercase small fw-semibold text-muted">
                    Contact Information
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 18 }}>
                    {modalDetails.order_address[0]?.name}
                  </div>
                  <div>{modalDetails.order_address[0]?.phone}</div>
                  <div>{modalDetails.order_address[0]?.email}</div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-uppercase small fw-semibold text-muted">
                    Status
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 18 }}>
                    {modalOrderOuter?.status?.label && (
                      <Badge
                        bg={
                          modalOrderOuter.status.value === "processing"
                            ? "info"
                            : modalOrderOuter.status.value === "shipped"
                            ? "primary"
                            : modalOrderOuter.status.value === "completed"
                            ? "success"
                            : modalOrderOuter.status.value === "returned"
                            ? "warning"
                            : modalOrderOuter.status.value === "cancelled"
                            ? "danger"
                            : "secondary"
                        }
                        className="rounded-pill px-3 py-1"
                        style={{ fontSize: "0.98em" }}
                      >
                        {modalOrderOuter.status.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-uppercase small fw-semibold text-muted">
                    Payment Method
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 18 }}>
                    {modalOrderOuter?.payment_channel
                      ? ({ cod: "Cash on Delivery", paytabs: "PayTabs" }[
                          modalOrderOuter.payment_channel
                        ] || modalOrderOuter.payment_channel)
                      : "—"}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-uppercase small fw-semibold text-muted">
                    Shipping Address
                  </div>
                  <div>
                    {modalDetails.order_address[0]?.address},{" "}
                    {modalDetails.order_address[0]?.city},{" "}
                    {modalDetails.order_address[0]?.state}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-uppercase small fw-semibold text-muted">
                    Billing Address
                  </div>
                  <div>
                    {modalDetails.order_address[0]?.address},{" "}
                    {modalDetails.order_address[0]?.city},{" "}
                    {modalDetails.order_address[0]?.state}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h4 className="mb-4" style={{ fontWeight: 600 }}>
                  Items
                </h4>
                <div
                  style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    paddingRight: 2,
                    marginBottom: 8,
                  }}
                >
                  {modalDetails.order_products.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex align-items-center mb-4 pb-3 border-bottom"
                    >
                      <img
                        src={
                          item.product_image
                            ? `${IMG_BASE}storage/${item.product_image}`
                            : "/no-img.png"
                        }
                        alt={item.product_name}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 12,
                          marginRight: 18,
                        }}
                      />
                      <div className="flex-grow-1">
                        <div style={{ fontWeight: 500, fontSize: 16 }}>
                          {item.product_name}
                        </div>
                        {item.is_gift === 1 && (
                          <div
                            className="small text-dark"
                            style={{ fontWeight: 500 }}
                          >
                            (Free Gift)
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {item.qty} X{" "}
                        {Number(item.discount_amount) > 0 ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: 6,
                                fontWeight: 400,
                              }}
                            >
                              {Number(item.price * 1.05).toFixed(2)}د.إ
                            </span>
                            <span> {Number(item.gross_amount).toFixed(2)}د.إ</span>
                          </>
                        ) : (
                          <span>{Number(item.gross_amount).toFixed(2)}د.إ</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
  <div className="pb-1 d-flex justify-content-between">
    <span style={{ fontWeight: 500 }}>Subtotal</span>
    <span className="fw-semibold">
      {Number(modalOrderOuter?.sub_total || 0).toFixed(2)}د.إ
    </span>
  </div>

  <div className="pb-1 d-flex justify-content-between">
    <span style={{ fontWeight: 500 }}>Shipping Cost</span>
    <span className="fw-semibold">
      {modalOrderOuter?.shipping_cost
        ? `${Number(modalOrderOuter.shipping_cost).toFixed(2)}د.إ`
        : (Number(modalOrderOuter?.sub_total || 0) >= 400
            ? "Free Shipping"
            : `${(modalDetails.shipping_cost || 20).toFixed(2)}د.إ`)}
    </span>
  </div>

  {/* <div className="pb-1 d-flex justify-content-between">
    <span style={{ fontWeight: 500 }}>Service Fee</span>
    <span className="fw-semibold">
      {(modalDetails.service_fee || 3.0).toFixed(2)}د.إ
    </span>
  </div>

  {modalOrderOuter?.payment_channel === "cod" && (
    <div className="pb-1 d-flex justify-content-between">
      <span style={{ fontWeight: 500 }}>COD Charges</span>
      <span className="fw-semibold">
        {(modalDetails.cod_charges || 10.0).toFixed(2)}د.إ
      </span>
    </div>
  )} */}

  <div className="pb-1 d-flex justify-content-between">
    <span style={{ fontWeight: 500 }}>
      <p className="text-red">{modalOrderOuter?.coupon_code ? ` (Coupon Applied: ${modalOrderOuter.coupon_code})` : ""}</p>
    </span>
    {/* <span className="fw-semibold text-danger">
      -{modalDetails.order_products
        .reduce((sum, it) => sum + Number(it.discount_amount), 0)
        .toFixed(2)}د.إ
    </span> */}
  </div>


  {/* Total */}
  <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
    <div style={{ fontWeight: 600, fontSize: 22 }}>Total</div>
    <div style={{ fontWeight: 600, fontSize: 22 }}>
      {Number(modalOrderOuter?.amount || 0).toFixed(2)}د.إ
      <div className="small text-muted" style={{ fontWeight: 500 }}>
        (includes {Number(modalOrderOuter?.tax_amount || 0).toFixed(2)}د.إ VAT)
      </div>
    </div>
  </div>
</div>

              </div>
            </div>
          ) : (
            <div className="text-muted py-5 text-center">
              Order details not available.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}