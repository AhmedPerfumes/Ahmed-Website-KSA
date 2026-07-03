"use client";

/**
 * CartToast — bottom-right add-to-cart notification
 *
 * Triggered via global CustomEvent "cart:added"
 * dispatched from PremiumProductCard after addProductToCart.
 *
 * Clicking "VIEW CART" opens the cart drawer (same mechanism
 * as other ATC buttons in the app — adds CSS classes to drawer).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import "./cart-toast.css";

function openCartDrawer() {
  document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
  document.getElementById("cartDrawer")?.classList.add("aside_visible");
}

export default function CartToast() {
  const [toast, setToast] = useState(null); // { name, image }
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setToast(null), 350);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { name, image } = e.detail || {};
      if (!name) return;
      clearTimeout(timerRef.current);
      setToast({ name, image });
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

  return (
    <div
      className={`cart-toast${visible ? " cart-toast--visible" : ""}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Product thumbnail */}
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

      {/* Info */}
      <div className="cart-toast__body">
        <p className="cart-toast__name">{toast.name}</p>
        <button
          className="cart-toast__view"
          type="button"
          onClick={() => {
            dismiss();
            openCartDrawer();
          }}
        >
          VIEW CART
        </button>
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
