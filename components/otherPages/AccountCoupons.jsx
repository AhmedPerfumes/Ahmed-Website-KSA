"use client";
import React, { useState, useEffect } from "react";

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("user");
    let user = null;

    if (raw) {
      try {
        user = JSON.parse(atob(raw)); // decode base64 JSON
      } catch (e) {
        console.error("Failed to decode user:", e);
      }
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const email = encodeURIComponent(user.email || "");
    const mobileNo = encodeURIComponent(user.phone || user.mobile || "");

    const apiUrl = `${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/AllCoupons`;

    setLoading(true);
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salesType: "EComm",
        company: "KSA",
        mobileNo,
        email,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setCoupons(json.data || []);
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

  // Helpers
  const isExpired = (validTo) => new Date(validTo) < new Date();
  const isRedeemed = (status) => status?.toLowerCase() === "redeemed";

  const getColors = (status, idx) => {
    const golds = ["#BB8502", "#D44F35", "#726060"];
    const bgs = ["#FFF7E7", "#FFF3F0", "#F6F6F6"];

    if (status === "expired") {
      return { color: "#9A9A9A", bg: "#F6F6F6" };
    }
    if (status === "redeemed") {
      return { color: "#9A9A9A", bg: "#F0F0F3" };
    }
    return { color: golds[idx % golds.length], bg: bgs[idx % bgs.length] };
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 12 }}>
      <h2
        style={{
          textAlign: "center",
          fontWeight: 600,
          marginBottom: 30,
          fontSize: 23,
        }}
      >
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
            const expired = isExpired(c.validTo);
            const redeemed = isRedeemed(c.status);
            const { color, bg } = getColors(
              expired ? "expired" : redeemed ? "redeemed" : "active",
              idx
            );

            return (
              <div
                key={c.couponCode}
                className="coupon-card position-relative"
                style={{
                  background: bg,
                  borderRadius: 20,
                  minHeight: 98,
                  boxShadow: "0 1px 10px 0 #ededed",
                  display: "flex",
                  alignItems: "stretch",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Main info */}
                <div
                  style={{
                    flex: 2.2,
                    padding: "18px 18px 18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color,
                      letterSpacing: 0.7,
                    }}
                  >
                    {c.promotionName || "Special Coupon"}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 17,
                      marginTop: 2,
                      color: "#222",
                    }}
                  >
                    {c.baseOn === "Percent"
                      ? `${c.value}% OFF`
                      : `AED${c.value} OFF`}
                  </div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>
                    {expired
                      ? `Expired: ${c.validTo?.slice(0, 10)}`
                      : `Valid until: ${c.validTo?.slice(0, 10)}`}
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
                    cursor:
                      expired || redeemed ? "not-allowed" : "pointer",
                    userSelect: "none",
                  }}
                  className={`coupon-code-area${
                    expired || redeemed ? " disabled" : ""
                  }${copiedId === c.couponCode ? " copied" : ""}`}
                  onClick={() =>
                    !expired &&
                    !redeemed &&
                    handleCopy(c.couponCode, c.couponCode)
                  }
                  onMouseLeave={() => setCopiedId(null)}
                >
                  <span
                    className="coupon-code-text"
                    style={{
                      fontSize: 15,
                      letterSpacing: 2,
                      fontFamily: "monospace",
                      background:
                        copiedId === c.couponCode
                          ? "#fff"
                          : "rgba(255,255,255,0.10)",
                      color: copiedId === c.couponCode ? color : "#fff",
                      padding: "4px 14px",
                      borderRadius: 18,
                      border: `2px dashed ${
                        copiedId === c.couponCode ? color : "#fff"
                      }`,
                      transition: ".13s",
                    }}
                  >
                    {c.couponCode}
                  </span>
                  <span
                    className="coupon-value-text"
                    style={{
                      fontWeight: 400,
                      fontSize: 14,
                      color: "#fff",
                      marginTop: 3,
                      letterSpacing: ".5px",
                    }}
                  >
                    {c.baseOn === "Percent"
                      ? `${c.value}% OFF`
                      : `AED${c.value} OFF`}
                  </span>
                  {!expired && !redeemed && (
                    <span
                      className={`copy-hint${
                        copiedId === c.couponCode ? " copied" : ""
                      }`}
                    >
                      {copiedId === c.couponCode
                        ? "Copied!"
                        : "Click to Copy"}
                    </span>
                  )}
                </div>

                {/* Overlays */}
                {expired && <div className="coupon-overlay">Expired Coupon</div>}
                {!expired && redeemed && (
                  <div className="coupon-overlay">Redeemed Coupon</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .coupon-card {
          transition: box-shadow 0.16s;
        }
        .coupon-card:hover {
          box-shadow: 0 3px 18px rgba(90, 90, 80, 0.1);
        }
        .coupon-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(110, 110, 110, 0.33);
          color: #fff;
          font-size: 21px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          z-index: 2;
          letter-spacing: 0.5px;
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
          color: #bb8502;
          font-weight: 700;
        }
        .coupon-code-area.copied .coupon-code-text {
          background: #fff !important;
          color: #bb8502 !important;
          border-color: #bb8502 !important;
        }
        .coupon-code-area.disabled {
          opacity: 0.67;
          pointer-events: none;
        }
        @media (max-width: 600px) {
          .coupon-card {
            min-height: 84px;
          }
          h2 {
            font-size: 18px !important;
          }
          .coupon-code-area {
            font-size: 14px;
            min-width: 84px;
          }
        }
      `}</style>
    </div>
  );
}
