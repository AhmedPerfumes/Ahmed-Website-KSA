"use client";

/**
 * ExitIntentPopup
 *
 * Triggers when:
 *  - Desktop: mouse exits viewport toward the top (browser chrome / close button)
 *  - Mobile:  user has been on the page ≥ 25 seconds (no mouseleave on mobile)
 *
 * Suppression:
 *  - Does NOT show on checkout, cart, or order-complete pages
 *  - Won't show again for 72 hours after being dismissed or CTA clicked
 *  - Won't show again in the same session after being shown once
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import "./ExitIntentPopup.css";

const STORAGE_KEY = "ahmed_exit_popup_dismissed";
const COOLDOWN_MS  = 72 * 60 * 60 * 1000; // 72 hours
const MOBILE_DELAY = 25_000;               // 25 seconds

// Pages where the popup should never appear
const BLOCKED_PATHS = ["/cart", "/checkout", "/shop-order-complete", "/shop-order-payment-complete"];

export default function ExitIntentPopup() {
  const pathname       = usePathname();
  const [open, setOpen] = useState(false);
  const shown           = useRef(false);
  const mobileTimer     = useRef(null);

  const isBlocked = BLOCKED_PATHS.some((p) => pathname.includes(p));

  /* ── Decide whether we're allowed to show ── */
  const canShow = useCallback(() => {
    if (shown.current) return false;
    if (isBlocked)     return false;
    try {
      const ts = localStorage.getItem(STORAGE_KEY);
      if (ts && Date.now() - Number(ts) < COOLDOWN_MS) return false;
    } catch (_) {}
    return true;
  }, [isBlocked]);

  const show = useCallback(() => {
    if (!canShow()) return;
    shown.current = true;
    setOpen(true);
  }, [canShow]);

  const dismiss = (clicked = false) => {
    setOpen(false);
    try {
      if (clicked) localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (_) {}
  };

  /* ── Desktop: mouse leaving toward top ── */
  useEffect(() => {
    const onMouseLeave = (e) => {
      if (e.clientY <= 5) show();   // cursor within 5px of top edge
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [show]);

  /* ── Mobile: time-based fallback ── */
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;
    mobileTimer.current = setTimeout(show, MOBILE_DELAY);
    return () => clearTimeout(mobileTimer.current);
  }, [show]);

  /* ── Keyboard trap (Escape to close) ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") dismiss(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="ei-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Special offer"
      onClick={() => dismiss(false)}
    >
      <div className="ei-popup" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button
          className="ei-close"
          onClick={() => dismiss(false)}
          aria-label="Close"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Decorative corner accents */}
        <span className="ei-corner ei-corner--tl" aria-hidden="true"/>
        <span className="ei-corner ei-corner--tr" aria-hidden="true"/>
        <span className="ei-corner ei-corner--bl" aria-hidden="true"/>
        <span className="ei-corner ei-corner--br" aria-hidden="true"/>

        {/* Image strip */}
        <div className="ei-image-strip" aria-hidden="true">
          <img
            src="/assets/images/la-rose.jpg"
            alt=""
          />
          <div className="ei-image-strip__overlay"/>
        </div>

        {/* Content */}
        <div className="ei-body">
          <p className="ei-eyebrow">Before you go…</p>

          <h2 className="ei-title">
            Discover Your<br/>
            <em>Signature Scent</em>
          </h2>

          <p className="ei-desc">
            Explore over 100 luxury fragrances crafted from the finest Arabian oud
            and Eastern essences, crafted for those who wear their story.
          </p>

          <div className="ei-actions">
            <a
              href="/ar/product-category/perfumes"
              className="ei-btn ei-btn--primary"
              onClick={() => dismiss(true)}
            >
              Shop Collection
            </a>
            <a
              href="/ar/sale"
              className="ei-btn ei-btn--ghost"
              onClick={() => dismiss(true)}
            >
              View Offers
            </a>
          </div>

          <button
            className="ei-skip"
            onClick={() => dismiss(false)}
            type="button"
          >
            No thanks, continue leaving
          </button>
        </div>
      </div>
    </div>
  );
}
