"use client";
/**
 * OfferPopup.jsx
 * Listens to "cart:offer" CustomEvent fired whenever a product with an active
 * discount is added to cart.  Shows a pill-style popup below CartToast with
 * the discount details.  Auto-dismisses after 5 s.
 *
 * Event payload: { name, discountType, value, endDate }
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";

const css = `
/* ── OfferPopup ────────────────────────────────────────────────────── */
.offer-popup {
  position: fixed;
  bottom: 120px;
  right: 24px;
  z-index: 9910;
  width: 320px;
  max-width: calc(100vw - 32px);
  background: linear-gradient(135deg, #1a1208 0%, #2c1f0a 50%, #1a1208 100%);
  border: 1px solid rgba(197,166,100,0.35);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(197,166,100,0.1);
  overflow: hidden;
  transform: translateX(calc(100% + 32px));
  opacity: 0;
  transition: transform 0.44s cubic-bezier(0.22,1,0.36,1), opacity 0.32s ease;
  pointer-events: none;
}
.offer-popup.offer-popup--visible {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

/* Progress bar */
.offer-popup__bar {
  position: absolute;
  top: 0; left: 0;
  height: 3px;
  background: linear-gradient(90deg, #b8973e, #f0d080, #b8973e);
  width: 100%;
  transform-origin: left;
  animation: offerBarShrink 5s linear forwards;
}
@keyframes offerBarShrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }

/* Inner */
.offer-popup__inner {
  padding: 18px 16px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* Icon */
.offer-popup__icon {
  flex-shrink: 0;
  width: 42px; height: 42px;
  background: rgba(197,166,100,0.12);
  border: 1px solid rgba(197,166,100,0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
}

/* Text */
.offer-popup__body { flex: 1; min-width: 0; }
.offer-popup__badge {
  display: inline-block;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #d4b86a;
  background: rgba(197,166,100,0.12);
  border: 1px solid rgba(197,166,100,0.25);
  border-radius: 100px;
  padding: 2px 8px;
  margin-bottom: 6px;
}
.offer-popup__title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f5f0e8;
  margin: 0 0 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.offer-popup__sub {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.55);
  margin: 0 0 10px;
}
.offer-popup__discount {
  font-size: 1.15rem;
  font-weight: 800;
  color: #d4b86a;
  letter-spacing: 0.02em;
}
.offer-popup__end {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}
.offer-popup__footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.offer-popup__cta {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: linear-gradient(135deg, #b8973e, #d4b86a);
  color: #1a1208;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 6px;
  transition: filter 0.18s;
}
.offer-popup__cta:hover { filter: brightness(1.12); color: #1a1208; }
.offer-popup__dismiss {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  transition: background 0.18s, color 0.18s;
  flex-shrink: 0;
}
.offer-popup__dismiss:hover { background: rgba(255,255,255,0.12); color: #fff; }

@media (max-width: 480px) {
  .offer-popup { right: 12px; bottom: 100px; width: calc(100vw - 24px); }
}
`;

export default function OfferPopup() {
  const locale   = useLocale();
  const [toast, setToast]   = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setToast(null);
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { name, discountType, value, endDate } = e.detail || {};
      if (!value) return;
      clearTimeout(timerRef.current);
      setToast({ name, discountType, value, endDate, key: Date.now() });
      timerRef.current = setTimeout(dismiss, 5000);
    };
    window.addEventListener("cart:offer", handler);
    return () => { window.removeEventListener("cart:offer", handler); clearTimeout(timerRef.current); };
  }, [dismiss]);

  const formatDiscount = () => {
    if (!toast) return "";
    return toast.discountType === "percent"
      ? `${toast.value}% OFF`
      : `${toast.value} SAR OFF`;
  };

  const formatEnd = () => {
    if (!toast?.endDate) return "";
    try {
      const d = new Date(toast.endDate);
      return `Ends ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    } catch { return ""; }
  };

  return (
    <>
      <style>{css}</style>
      <div
        className={`offer-popup${toast ? " offer-popup--visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <div className="offer-popup__bar" key={toast.key} />
            <div className="offer-popup__inner">
              <div className="offer-popup__icon">🔥</div>
              <div className="offer-popup__body">
                <span className="offer-popup__badge">Active Offer</span>
                <p className="offer-popup__title">{toast.name || "This product"}</p>
                <p className="offer-popup__sub">has an active discount</p>
                <div className="offer-popup__discount">{formatDiscount()}</div>
                {formatEnd() && <p className="offer-popup__end">{formatEnd()}</p>}
                <div className="offer-popup__footer">
                  <Link href={`/${locale}/shop-cart`} className="offer-popup__cta" onClick={dismiss}>
                    View Cart
                  </Link>
                  <button className="offer-popup__dismiss" onClick={dismiss} type="button" aria-label="Dismiss">
                    &#x2715;
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}