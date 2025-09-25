"use client";
import React, { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer_id from localStorage
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    let customer_id = null;
    if (raw) {
      try {
        const user = JSON.parse(atob(raw));
        customer_id = user.id;
      } catch {}
    }
    if (!customer_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}api/customerCouponDetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id }),
    })
      .then(res => res.json())
      .then(json => {
        setCoupons(json.coupons || []);
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  // Copy logic
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  // Color logic: Gold for active, grey for expired
  const getColors = (status, idx) => {
    // For more variety, alternate colors
    const golds = ["#BB8502", "#D44F35", "#726060"];
    const bgs = ["#FFF7E7", "#FFF3F0", "#F6F6F6"];
    if (status === "expired") {
      return { color: "#9A9A9A", bg: "#F6F6F6" };
    }
    return { color: golds[idx % golds.length], bg: bgs[idx % bgs.length] };
  };

  // Expiry logic
  const isExpired = (end_date) => {
    return new Date(end_date) < new Date();
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 12 }}>
      <h2 style={{ textAlign: "center", fontWeight: 600, marginBottom: 30, fontSize: 23 }}>
        My Coupons
      </h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Loading…</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888", padding: 30 }}>
          You have no coupons yet.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {coupons.map((c, idx) => {
            const expired = isExpired(c.end_date);
            const { color, bg } = getColors(expired ? "expired" : "active", idx);
            return (
              <div
                key={c.id}
                className="coupon-card position-relative"
                style={{
                  background: bg,
                  borderRadius: 20,
                  minHeight: 98,
                  boxShadow: "0 1px 10px 0 #ededed",
                  display: "flex",
                  alignItems: "stretch",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                {/* Main info */}
                <div style={{
                  flex: 2.2,
                  padding: "18px 18px 18px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color, letterSpacing: 0.7 }}>
                    Special Coupon
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 17, marginTop: 2, color: "#222" }}>
                    {c.value}% OFF
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 1 }}>
                    {/* Add more logic here if you have a description */}
                  </div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>
                    {expired ? `Expired: ${c.end_date?.slice(0,10)}` : `Valid until: ${c.end_date?.slice(0,10)}`}
                  </div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>
                    {c.total_used > 0 && `Used ${c.total_used} times`}
                  </div>
                </div>
                {/* Coupon Code Box */}
                <div
                  style={{
                    flex: 1,
                    background: color,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 17,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 120,
                    position: "relative",
                    cursor: !expired ? "pointer" : "not-allowed",
                    userSelect: "none"
                  }}
                  className={`coupon-code-area${expired ? " disabled" : ""}${copiedId === c.id ? " copied" : ""}`}
                  onClick={() => !expired && handleCopy(c.code, c.id)}
                  onMouseLeave={() => setCopiedId(null)}
                >
                  <span className="coupon-code-text" style={{
                    fontSize: 15,
                    letterSpacing: 2,
                    fontFamily: "monospace",
                    background: copiedId === c.id ? "#fff" : "rgba(255,255,255,0.10)",
                    color: copiedId === c.id ? color : "#fff",
                    padding: "4px 14px",
                    borderRadius: 18,
                    border: `2px dashed ${copiedId === c.id ? color : "#fff"}`,
                    transition: ".13s"
                  }}>
                    {c.code}
                  </span>
                  <span className="coupon-value-text" style={{
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#fff",
                    marginTop: 3,
                    letterSpacing: ".5px"
                  }}>
                    {c.value}% OFF
                  </span>
                  {/* Hover/copy effect */}
                  {!expired && (
                    <span
                      className={`copy-hint${copiedId === c.id ? " copied" : ""}`}
                    >
                      {copiedId === c.id ? "Copied!" : "Click to Copy"}
                    </span>
                  )}
                </div>
                {expired && (
                  <div className="coupon-overlay">Expired Coupon</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style jsx>{`
        .coupon-card {
          transition: box-shadow 0.16s;
        }
        .coupon-card:hover {
          box-shadow: 0 3px 18px rgba(90,90,80,.10);
        }
        .coupon-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(110,110,110,0.33);
          color: #fff;
          font-size: 21px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          z-index: 2;
          letter-spacing: .5px;
        }
        .coupon-code-area {
          position: relative;
          transition: background 0.14s;
        }
        .coupon-code-area:hover .copy-hint {
          opacity: 1;
          pointer-events: all;
        }
        .coupon-code-area .copy-hint {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.69);
          color: #fff;
          padding: 2px 16px;
          border-radius: 14px;
          font-size: 14px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          font-weight: 500;
        }
        .coupon-code-area.copied .copy-hint {
          background: #fff;
          color: #BB8502;
          font-weight: 700;
        }
        .coupon-code-area.copied .coupon-code-text {
          background: #fff !important;
          color: #BB8502 !important;
          border-color: #BB8502 !important;
        }
        .coupon-code-area.disabled {
          opacity: 0.67;
          pointer-events: none;
        }
        @media (max-width: 600px) {
          .coupon-card { min-height: 84px; }
          h2 { font-size: 18px !important; }
          .coupon-code-area { font-size: 14px; min-width: 84px; }
        }
      `}</style>
    </div>
  );
}
