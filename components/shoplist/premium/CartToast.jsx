"use client";

/**
 * CartToast — bottom-right cart notification
 *
 * Handles three modes based on qty:
 *  - qty > 1 and previous qty was different → "Updated" (qty changed)
 *  - qty === 0 → "Removed from cart"
 *  - qty (first add or +1 at 1) → "Added to cart"
 *
 * Triggered via global CustomEvent "cart:added"
 * dispatched from PremiumProductCard, ProductInfoPanel, etc.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import "./cart-toast.css";

function openCartDrawer() {
  document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
  document.getElementById("cartDrawer")?.classList.add("aside_visible");
}

export default function CartToast() {
  const [toast, setToast] = useState(null); // { name, image, qty, mode }
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const prevQtyRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setToast(null);
      prevQtyRef.current = null;
    }, 350);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { name, image, qty } = e.detail || {};
      if (!name) return;
      clearTimeout(timerRef.current);

      // Determine mode
      let mode = "added";
      if (qty === 0) {
        mode = "removed";
      } else if (prevQtyRef.current !== null && qty !== prevQtyRef.current) {
        mode = qty > prevQtyRef.current ? "increased" : "decreased";
      }
      prevQtyRef.current = qty;

      setToast({ name, image, qty: qty ?? 1, mode });
      // force re-render then enable visible for CSS transition
      setTimeout(() => setVisible(true), 16);
      timerRef.current = setTimeout(dismiss, 4500);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("cart:added", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cart:added", handler);
      }
      clearTimeout(timerRef.current);
    };
  }, [dismiss]);

  if (!toast) return null;

  const isRemoved = toast.mode === "removed";
  const isUpdated = toast.mode === "increased" || toast.mode === "decreased";

  const statusLabel = isRemoved
    ? "✕ Removed from cart"
    : "✓ Added to cart";

  const qtyLabel = isRemoved ? null : `Qty: ${toast.qty}`;

  return (
    <div
      className={`cart-toast${visible ? " cart-toast--visible" : ""}${isRemoved ? " cart-toast--removed" : ""}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Product thumbnail */}
      {!isRemoved && (
        <div className="cart-toast__img-wrap">
          {toast.image ? (
            <Image
              src={toast.image}
              alt={toast.name}
              width={52}
              height={52}
              className="cart-toast__img"
              style={{ objectFit: "contain" }}
              unoptimized
            />
          ) : (
            <div className="cart-toast__img-placeholder" />
          )}
        </div>
      )}

      {/* Info */}
      <div className="cart-toast__body">
        <p className={`cart-toast__added-label${isRemoved ? " cart-toast__added-label--removed" : ""}`}>
          {statusLabel}
        </p>
        <p className="cart-toast__name">{toast.name}</p>
        {qtyLabel && <p className="cart-toast__qty">{qtyLabel}</p>}
        {!isRemoved && (
          <button
            className="cart-toast__view"
            type="button"
            onClick={() => {
              dismiss();
              openCartDrawer();
            }}
          >
            VIEW CART →
          </button>
        )}
      </div>

      {/* Close */}
      <button
        className="cart-toast__close"
        type="button"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
