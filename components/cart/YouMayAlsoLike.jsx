"use client";
/**
 * YouMayAlsoLike.jsx  — Centered brand-themed modal for cart / checkout pages
 *
 * TRIGGER LOGIC (answers the "3 products" question):
 * --------------------------------------------------
 * The popup anchors on the MOST RECENTLY NEWLY ADDED product (not a qty increment).
 * Rationale: the last fresh add expresses the user's current shopping intent.
 *
 * Example: cart has Marj → Rose Noir → Kaaf (added in that order)
 *   → popup recommends products related to "Kaaf" (most recent intent)
 *
 * If the user re-visits cart later in the same session without adding anything new,
 * the popup does NOT re-fire (once per session per distinct product added).
 *
 * Section A: related_prods of that anchor product (hidden if API returns none)
 * Section B: top-5 best sellers from that product's category (always shown if available)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchBestSelling } from "@/utlis/productsCache";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useLocale } from "next-intl";
import he from "he";

/* ── Session / Storage keys ─────────────────────────────────── */
const SESSION_KEY   = "ymal_shown";          // sessionStorage — clears each tab/session
const STORAGE_KEY   = "ahmed_last_cart_item"; // localStorage  — anchor product info
const DISMISS_KEY   = "ymal_dismissed";       // sessionStorage — "don't remind me again" (full session block)
const COOLDOWN_KEY  = "ymal_cooldown_until"; // sessionStorage — X-button soft close (timestamp)

/* ── Helpers ────────────────────────────────────────────────── */
const slugify = (str) =>
  (str || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const getImg = (p) => {
  try {
    const arr = JSON.parse(p.images || "[]");
    return arr[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${arr[0]}` : null;
  } catch {
    return p.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${p.image}` : null;
  }
};

/* ── Inline styles (no extra CSS file needed) ───────────────── */
const STYLES = `
/* ─── Overlay ──────────────────────────────────────────────── */
.ymal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 12, 8, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  z-index: 9950;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0; pointer-events: none;
  transition: opacity 0.38s ease, background 0.38s ease,
              backdrop-filter 0.38s ease, -webkit-backdrop-filter 0.38s ease;
}
.ymal-overlay.ymal-open {
  opacity: 1; pointer-events: auto;
  background: rgba(15, 12, 8, 0.54);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ─── Keyframes ─────────────────────────────────────────────── */

/* Spring entrance: shoots up, slightly overshoots, settles */
@keyframes ymal-spring-in {
  0%   { opacity: 0; transform: scale(0.84) translateY(48px); }
  55%  { opacity: 1; transform: scale(1.03) translateY(-6px); }
  78%  { transform: scale(0.98) translateY(3px); }
  100% { transform: scale(1)   translateY(0); }
}

/* Subtle golden glow that pulses once on open */
@keyframes ymal-glow-pulse {
  0%   { box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08),
                     0 0 0 0   rgba(166,123,48,0); }
  40%  { box-shadow: 0 32px 90px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10),
                     0 0 0 8px rgba(166,123,48,0.20); }
  100% { box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08),
                     0 0 0 0   rgba(166,123,48,0); }
}

/* Smooth exit */
@keyframes ymal-spring-out {
  0%   { opacity: 1; transform: scale(1)    translateY(0); }
  100% { opacity: 0; transform: scale(0.92) translateY(20px); }
}

/* Generic fade-up for child elements */
@keyframes ymal-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header slides down */
@keyframes ymal-fade-down {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Modal card ─────────────────────────────────────────────── */
.ymal-modal {
  position: relative;
  width: 100%;
  max-width: 960px;
  max-height: 88svh;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
  /* Default (closed) state — hidden below */
  opacity: 0;
  transform: scale(0.84) translateY(48px);
  transition: none;
}
.ymal-overlay.ymal-open .ymal-modal {
  /* Spring entrance + one-shot glow pulse */
  animation:
    ymal-spring-in  0.62s cubic-bezier(0.16, 1, 0.3, 1) forwards,
    ymal-glow-pulse 1.5s 0.45s ease-out forwards;
}
/* Staggered child reveals once modal is open */
.ymal-overlay.ymal-open .ymal-header {
  animation: ymal-fade-down 0.42s 0.18s ease both;
}
.ymal-overlay.ymal-open .ymal-body {
  animation: ymal-fade-up 0.42s 0.26s ease both;
}
.ymal-overlay.ymal-open .ymal-section:nth-child(1) {
  animation: ymal-fade-up 0.4s 0.3s ease both;
}
.ymal-overlay.ymal-open .ymal-section:nth-child(2) {
  animation: ymal-fade-up 0.4s 0.4s ease both;
}
.ymal-overlay.ymal-open .ymal-footer {
  animation: ymal-fade-up 0.38s 0.48s ease both;
}
/* Product card stagger (first 6 visible slides) */
.ymal-overlay.ymal-open .swiper-slide:nth-child(1) .ymal-card { animation: ymal-fade-up 0.35s 0.32s ease both; }
.ymal-overlay.ymal-open .swiper-slide:nth-child(2) .ymal-card { animation: ymal-fade-up 0.35s 0.40s ease both; }
.ymal-overlay.ymal-open .swiper-slide:nth-child(3) .ymal-card { animation: ymal-fade-up 0.35s 0.48s ease both; }
.ymal-overlay.ymal-open .swiper-slide:nth-child(4) .ymal-card { animation: ymal-fade-up 0.35s 0.56s ease both; }
.ymal-overlay.ymal-open .swiper-slide:nth-child(5) .ymal-card { animation: ymal-fade-up 0.35s 0.62s ease both; }
.ymal-overlay.ymal-open .swiper-slide:nth-child(6) .ymal-card { animation: ymal-fade-up 0.35s 0.68s ease both; }

/* ─── Header ────────────────────────────────────────────────── */
.ymal-header {
  flex-shrink: 0;
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5rem 1.75rem 1.1rem;
  border-bottom: 1px solid #ede9e1;
  background: #fff;
}
.ymal-header-text { display: flex; flex-direction: column; gap: 0.25rem; }
.ymal-eyebrow {
  font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #a67b30; margin: 0;
}
.ymal-title {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(1.3rem, 2.5vw, 1.65rem);
  font-weight: 400; letter-spacing: 0.02em;
  color: #1a1a1a; margin: 0; line-height: 1.2;
}
.ymal-title em { font-style: italic; color: #a67b30; }

/* Anchor product context pill */
.ymal-anchor-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: #fdf6e8; border: 1px solid #e8d5a0;
  border-radius: 100px; padding: 0.2rem 0.65rem 0.2rem 0.45rem;
  font-size: 0.62rem; color: #7a5a1a; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
  margin-top: 0.5rem; width: fit-content;
}
.ymal-anchor-chip svg { width: 10px; height: 10px; flex-shrink: 0; }

/* Close button */
.ymal-close {
  width: 34px; height: 34px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid #e0dbd2; border-radius: 50%;
  cursor: pointer; color: #888;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.22s;
  margin-top: 0.15rem;
}
.ymal-close:hover {
  background: #fdf6e8; border-color: #c5a05a; color: #a67b30;
  transform: rotate(90deg);
}
.ymal-close svg { width: 14px; height: 14px; }

/* ─── Body / scroll area ─────────────────────────────────────── */
.ymal-body {
  flex: 1; overflow-y: auto;
  padding: 1.25rem 1.75rem 2rem;
  scrollbar-width: thin; scrollbar-color: #e0dbd2 transparent;
}
.ymal-body::-webkit-scrollbar { width: 4px; }
.ymal-body::-webkit-scrollbar-thumb { background: #e0dbd2; border-radius: 2px; }

/* ─── Section label ─────────────────────────────────────────── */
.ymal-section { margin-bottom: 2rem; }
.ymal-section:last-child { margin-bottom: 0; }
.ymal-section-head {
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
}
.ymal-section-label {
  font-size: 0.6rem; font-weight: 700; white-space: nowrap;
  letter-spacing: 0.22em; text-transform: uppercase; color: #a67b30;
}
.ymal-section-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, #e0d5c0, transparent);
}

/* ─── Product card ───────────────────────────────────────────── */
.ymal-card {
  background: #fafaf8;
  border: 1px solid #ede9e1;
  border-radius: 4px; overflow: hidden;
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
  display: flex; flex-direction: column; height: 100%;
  cursor: pointer;
}
.ymal-card:hover {
  border-color: #c5a05a;
  box-shadow: 0 8px 32px rgba(166, 123, 48, 0.12);
  transform: translateY(-2px);
}

/* Image */
.ymal-card__img-link {
  display: block; position: relative;
  aspect-ratio: 3/4; overflow: hidden; background: #f5f0e8;
}
.ymal-card__img-link img { object-fit: cover; transition: transform 0.5s ease; }
.ymal-card:hover .ymal-card__img-link img { transform: scale(1.05); }

/* Discount badge */
.ymal-card__badge {
  position: absolute; top: 8px; left: 8px;
  background: linear-gradient(135deg, #a67b30, #c5a05a);
  color: #fff; font-size: 0.58rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 100px; z-index: 2;
}

/* Info block */
.ymal-card__info {
  padding: 0.7rem 0.75rem 0.8rem;
  flex: 1; display: flex; flex-direction: column; gap: 0.35rem;
}
.ymal-card__sub {
  font-size: 0.58rem; color: #a67b30; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; margin: 0;
}
.ymal-card__name {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 1rem; font-weight: 600; color: #1a1a1a;
  letter-spacing: 0.02em; line-height: 1.3;
  text-decoration: none !important; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ymal-card__name:hover { color: #a67b30; }

/* Prices */
.ymal-card__prices {
  display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap;
}
.ymal-card__price-reg, .ymal-card__price-new {
  font-size: 0.88rem; font-weight: 700; color: #1a1a1a;
}
.ymal-card__price-old {
  font-size: 0.72rem; color: #bbb; text-decoration: line-through;
}

/* ATC button */
.ymal-card__atc {
  margin-top: auto; padding-top: 0.5rem;
  width: 100%;
  padding: 0.55rem 0.5rem;
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  border: 1px solid #a67b30; border-radius: 3px;
  background: transparent; color: #a67b30;
  cursor: pointer; transition: background 0.2s, color 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 0.35rem;
}
.ymal-card__atc:hover {
  background: linear-gradient(135deg, #b8913a, #a67b30);
  color: #fff; border-color: transparent;
}
.ymal-card__atc--added {
  background: #f0faf4; color: #2a7a4e;
  border-color: #a8d5b5;
}
.ymal-card__atc--added:hover {
  background: #e5f5ec; color: #2a7a4e; border-color: #a8d5b5;
}

/* ─── Swiper overrides ──────────────────────────────────────── */
.ymal-swiper { padding: 4px 2px 8px !important; overflow: visible !important; }
.ymal-swiper .swiper-button-prev,
.ymal-swiper .swiper-button-next {
  width: 32px; height: 32px;
  background: #fff; border: 1px solid #e0dbd2; border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #1a1a1a; top: 38%;
  transition: border-color 0.18s, color 0.18s;
}
.ymal-swiper .swiper-button-prev:hover,
.ymal-swiper .swiper-button-next:hover {
  border-color: #a67b30; color: #a67b30;
}
.ymal-swiper .swiper-button-prev::after,
.ymal-swiper .swiper-button-next::after {
  font-size: 0.65rem; font-weight: 800;
}
.ymal-swiper .swiper-button-disabled { opacity: 0.3; }

/* ─── Loading skeleton ──────────────────────────────────────── */
.ymal-skeleton-card {
  background: #f5f0e8; border-radius: 4px;
  overflow: hidden; height: 280px;
  animation: ymal-skel-pulse 1.5s ease-in-out infinite;
}
@keyframes ymal-skel-pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* ─── Footer (dismiss row) ──────────────────────────────────── */
.ymal-footer {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.7rem 1.75rem;
  border-top: 1px solid #ede9e1;
  background: #fafaf8;
  gap: 1rem;
}
.ymal-dismiss-label {
  display: flex; align-items: center; gap: 0.45rem;
  cursor: pointer; font-size: 0.68rem; color: #999;
  letter-spacing: 0.03em; user-select: none;
  transition: color 0.18s;
}
.ymal-dismiss-label:hover { color: #666; }
.ymal-dismiss-checkbox {
  width: 14px; height: 14px; cursor: pointer;
  accent-color: #a67b30; flex-shrink: 0;
}
.ymal-footer-close {
  font-size: 0.6rem; font-weight: 700; color: #a67b30;
  letter-spacing: 0.14em; text-transform: uppercase;
  background: transparent; border: 1px solid #a67b30;
  padding: 0.38rem 1.1rem; border-radius: 3px;
  cursor: pointer; white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.ymal-footer-close:hover {
  background: linear-gradient(135deg, #b8913a, #a67b30);
  color: #fff; border-color: transparent;
}

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ymal-overlay { display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .ymal-modal {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px;
  }
  .ymal-header { padding: 1rem 1.1rem 0.8rem; }
  .ymal-body  { padding: 0.9rem 1.1rem 1.5rem; }
  .ymal-title { font-size: 1.1rem; }
  .ymal-footer { padding: 0.6rem 1.1rem; flex-wrap: wrap; }
}
`;

export default function YouMayAlsoLike() {
  const { currency } = useMenu();
  const { cartProducts, addProductToCart, isAddedToCartProducts } = useContextElement();
  const locale = useLocale();

  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [related,  setRelated]  = useState([]);
  const [bestSell, setBestSell] = useState([]);
  const [dontShow, setDontShow] = useState(false);
  const [canShow,  setCanShow]  = useState(false);
  const overlayRef              = useRef(null);
  const fetchedRef              = useRef(false);
  const dragOriginOnOverlay     = useRef(false); // true only when pointerdown started ON the overlay backdrop

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Tier 3: permanent session dismiss
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    // Tier 2: X-button cooldown (30 min)
    const coolUntil = Number(sessionStorage.getItem(COOLDOWN_KEY) || 0);
    if (coolUntil && Date.now() < coolUntil) return;
    // SESSION_KEY is NOT checked here — outside-click clears it, so refresh re-triggers
    setCanShow(true);
  }, []);

  useEffect(() => {
    if (!canShow) return;
    if (cartProducts.length === 0) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    (async () => {
      setLoading(true);

      // All non-gift cart items
      const cartItems = cartProducts.filter(p => !p.is_gift);
      const cartIdSet = new Set(cartItems.map(p => p.product_id));

      // Up to 3 unique category-subcategory combos (most-recently-added first)
      const uniqueItems = [];
      const seenKeys = new Set();
      for (const p of [...cartItems].reverse()) {
        const sub = p.subcategory_name || p.subcategory?.subcategory_name || "";
        const key = `${p.category_name}|${sub}`;
        if (!seenKeys.has(key)) { seenKeys.add(key); uniqueItems.push(p); }
        if (uniqueItems.length >= 3) break;
      }

      /* ── Section A: related products — parallel fetch for each unique item ── */
      let relatedProds = [];
      try {
        const responses = await Promise.all(
          uniqueItems.map(item =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category:    (item.category_name || "").toUpperCase(),
                subCategory: (item.subcategory_name || item.subcategory?.subcategory_name || "").toUpperCase(),
                product:     (item.product_name || "").toUpperCase(),
              }),
            }).then(r => r.json()).catch(() => ({}))
          )
        );
        const seenRelated = new Set();
        for (const d of responses) {
          for (const p of (Array.isArray(d?.related_prods) ? d.related_prods : [])) {
            if (!seenRelated.has(p.product_id) && !cartIdSet.has(p.product_id)) {
              seenRelated.add(p.product_id);
              relatedProds.push(p);
            }
          }
        }
        relatedProds = relatedProds.slice(0, 12);
      } catch { /* ignore */ }

      /* ── Section B: best sellers from ALL cart categories ─────────────────── */
      let best = [];
      try {
        const all        = await fetchBestSelling();
        const uniqueCats = [...new Set(cartItems.map(p => p.category_name).filter(Boolean))];
        const seenBest   = new Set();
        for (const cat of uniqueCats) {
          const key = Object.keys(all).find(k => k.toUpperCase() === cat.toUpperCase());
          if (!key) continue;
          for (const p of (all[key] || []).slice(0, 4)) {
            if (!seenBest.has(p.product_id) && !cartIdSet.has(p.product_id)) {
              seenBest.add(p.product_id);
              best.push(p);
            }
          }
        }
        best = best.slice(0, 8);
      } catch { /* ignore */ }

      if (!cancelled) {
        setRelated(relatedProds);
        setBestSell(best);
        if (relatedProds.length > 0 || best.length > 0) {
          sessionStorage.setItem(SESSION_KEY, "1");
          // Batch setLoading + setOpen in the same render — no setTimeout gap
          // that would cause !open && !loading = true and unmount the component.
          setLoading(false);
          setOpen(true);
        } else {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [canShow, cartProducts.length]); // re-evaluates only when cart size changes

  /* ── Keyboard / body scroll lock ────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    // Escape = intentional soft close (same as X button → 30-min cooldown)
    const onKey = (e) => { if (e.key === "Escape") closeX(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * TIER 1 — Outside (overlay) click — ACCIDENTAL dismiss.
   * Clears SESSION_KEY so the popup re-fires on next page load / refresh.
   * Does NOT set any cooldown — zero penalty.
   */
  const closeAccidental = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setOpen(false);
  }, []);

  /**
   * TIER 2 — X button / Escape — INTENTIONAL soft close.
   * Sets a 30-minute cooldown in sessionStorage (session-scoped, auto-clears on tab close).
   * Popup will re-appear after 30 min or in a new tab.
   */
  const closeX = useCallback(() => {
    try {
      const thirtyMin = Date.now() + 30 * 60 * 1000;
      sessionStorage.setItem(COOLDOWN_KEY, String(thirtyMin));
    } catch { /* ignore */ }
    setOpen(false);
  }, []);

  /**
   * TIER 3 — Footer button.
   *
   * Checkbox NOT ticked → "Continue Shopping":
   *   Navigates to the shop page so the user can browse & add more.
   *   Clears SESSION_KEY so the popup re-fires when they return to cart.
   *   Zero cooldown written — popup does its job again on next cart visit.
   *
   * Checkbox ticked → "Got it, Close":
   *   Full session dismiss — the ONLY way to silence the popup for the session.
   *   Stays on the current page.
   */
  const router = useRouter();
  const closeDismissed = useCallback(() => {
    if (dontShow) {
      // Full session block
      try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
      setOpen(false);
    } else {
      // Navigate to shop — clear shown flag so popup returns when user comes back
      try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
      setOpen(false);
      router.push(`/${locale}/shop`);
    }
  }, [dontShow, router, locale]);

  /**
   * Track where the drag STARTED.
   * If pointerdown fires on the modal content (not the backdrop), we
   * must NOT close when the pointer is released outside — that's just
   * the user dragging a Swiper slider and accidentally leaving the modal.
   */
  const onOverlayPointerDown = useCallback((e) => {
    dragOriginOnOverlay.current = e.target === overlayRef.current;
  }, []);

  /** Overlay backdrop click → only close if drag also STARTED on the backdrop (Tier 1) */
  const onOverlay = useCallback((e) => {
    if (e.target === overlayRef.current && dragOriginOnOverlay.current) {
      closeAccidental();
    }
  }, [closeAccidental]);

  /* ── Price renderer ─────────────────────────────────────────── */
  const renderPrice = (elm) => {
    const now = Date.now();
    if (elm?.discount) {
      const s  = new Date(elm.discount.start_date).getTime();
      const e2 = new Date(elm.discount.end_date).getTime();
      if (now >= s && now <= e2) {
        const sale = elm.discount.discount_type === "percent"
          ? (elm.price - elm.price * elm.discount.value / 100).toFixed(2)
          : Number(elm.discount.final_price ?? elm.price - elm.discount.value).toFixed(2);
        return (
          <div className="ymal-card__prices">
            <span className="ymal-card__price-new">{sale} {currency?.symbol}</span>
            <span className="ymal-card__price-old">{elm.price} {currency?.symbol}</span>
          </div>
        );
      }
    }
    if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < Number(elm.price)) {
      return (
        <div className="ymal-card__prices">
          <span className="ymal-card__price-new">{Number(elm.sale_price).toFixed(2)} {currency?.symbol}</span>
          <span className="ymal-card__price-old">{elm.price} {currency?.symbol}</span>
        </div>
      );
    }
    return <div className="ymal-card__prices"><span className="ymal-card__price-reg">{elm?.price} {currency?.symbol}</span></div>;
  };

  const getDiscountBadge = (elm) => {
    const now = Date.now();
    if (!elm?.discount) return null;
    const s  = new Date(elm.discount.start_date).getTime();
    const e2 = new Date(elm.discount.end_date).getTime();
    if (now < s || now > e2) return null;
    return elm.discount.discount_type === "percent" ? `${Math.round(elm.discount.value)}% OFF` : `SALE`;
  };

  /* ── Product card ───────────────────────────────────────────── */
  const ProductCard = ({ elm }) => {
    const img    = getImg(elm);
    const name   = he.decode(elm.product_name || elm.name || "");
    const slug   = slugify(name);
    // Derive URL slugs from the product's own category/subcategory
    const catSlug    = slugify(elm.category_name || "");
    const subcatSlug = slugify(elm.subcategory?.subcategory_name || elm.subcategory_name || "");
    const href   = `/${locale}/shop/${catSlug || "perfumes"}/${subcatSlug || "all"}/${slug}`;
    const inCart = isAddedToCartProducts(elm.product_id);
    const badge  = getDiscountBadge(elm);
    const subcat = elm.subcategory?.subcategory_name || "";

    const handleATC = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addProductToCart({
        ...elm,
        _silent: true,
        category_name:    elm.category_name || "",
        subcategory_name: elm.subcategory?.subcategory_name || "",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:added", {
          detail: { name, image: img || "", qty: 1,
            category: elm.category_name || "", subcategory: elm.subcategory?.subcategory_name || "" },
        }));
      }
    };

    return (
      <article className="ymal-card">
        <Link href={href} className="ymal-card__img-link" onClick={close}>
          {badge && <span className="ymal-card__badge" aria-label={badge}>{badge}</span>}
          {img ? (
            <Image src={img} alt={name} fill sizes="(max-width:768px) 45vw, 200px" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ background: "#f0ebe0", width: "100%", height: "100%" }} aria-hidden="true" />
          )}
        </Link>
        <div className="ymal-card__info">
          {subcat && <p className="ymal-card__sub">{subcat}</p>}
          <Link href={href} className="ymal-card__name" title={name} onClick={close}>{name}</Link>
          {renderPrice(elm)}
          <button
            className={`ymal-card__atc${inCart ? " ymal-card__atc--added" : ""}`}
            type="button"
            onClick={handleATC}
            aria-label={inCart ? `${name} added to cart` : `Add ${name} to cart`}
          >
            {inCart ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Added
              </>
            ) : "Add to Cart"}
          </button>
        </div>
      </article>
    );
  };

  /* ── Swiper config ──────────────────────────────────────────── */
  const swiperOpts = {
    modules: [Navigation],
    spaceBetween: 12,
    navigation: true,
    className: "ymal-swiper",
    breakpoints: {
      0:   { slidesPerView: 2.2, spaceBetween: 10 },
      480: { slidesPerView: 3.2, spaceBetween: 12 },
      768: { slidesPerView: 4,   spaceBetween: 14 },
      960: { slidesPerView: 5,   spaceBetween: 14 },
    },
  };


  // Only skip rendering if the feature was never triggered (canShow=false).
  // Keep in DOM while loading so the open animation fires without unmount-gap.
  if (!canShow) return null;
  if (!open && !loading) return null;

  return (
    <>
      {/* Inline styles */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Modal overlay — role="dialog" for a11y */}
      <div
        ref={overlayRef}
        className={`ymal-overlay${open ? " ymal-open" : ""}`}
        onPointerDown={onOverlayPointerDown}
        onClick={onOverlay}
        role="dialog"
        aria-modal="true"
        aria-label="You may also like these products"
      >
        <div className="ymal-modal">

          {/* ── Header ───────────────────────────────────────────── */}
          <header className="ymal-header">
            <div className="ymal-header-text">
              <p className="ymal-eyebrow">Curated for you</p>
              <h2 className="ymal-title">You May Also <em>Like</em></h2>
              {cartProducts.length > 0 && (
                <div className="ymal-anchor-chip" aria-label="Based on your recent choices">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Based on Your Choices
                </div>
              )}
            </div>
            <button
              className="ymal-close"
              onClick={closeX}
              aria-label="Close recommendations"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6"  y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          {/* ── Body ─────────────────────────────────────────────── */}
          <div className="ymal-body">

            {loading ? (
              /* Loading skeletons */
              <div className="ymal-section">
                <div className="ymal-section-head">
                  <span className="ymal-section-label">Loading recommendations…</span>
                  <span className="ymal-section-line" aria-hidden="true" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="ymal-skeleton-card" aria-hidden="true" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* ── Section A: Related products ─────────────────── */}
                {related.length > 0 && (
                  <section className="ymal-section" aria-labelledby="ymal-related-heading">
                    <div className="ymal-section-head">
                      <h3 id="ymal-related-heading" className="ymal-section-label">
                        Pairs Well With Your Choices
                      </h3>
                      <span className="ymal-section-line" aria-hidden="true" />
                    </div>
                    <Swiper {...swiperOpts}>
                      {related.map((elm, i) => (
                        <SwiperSlide key={elm.product_id ?? i}>
                          <ProductCard elm={elm} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </section>
                )}

                {/* ── Section B: Best sellers ─────────────────────── */}
                {bestSell.length > 0 && (
                  <section className="ymal-section" aria-labelledby="ymal-bestsell-heading">
                    <div className="ymal-section-head">
                      <h3 id="ymal-bestsell-heading" className="ymal-section-label">
                        Best Sellers
                      </h3>
                      <span className="ymal-section-line" aria-hidden="true" />
                    </div>
                    <Swiper {...swiperOpts}>
                      {bestSell.map((elm, i) => (
                        <SwiperSlide key={elm.product_id ?? i}>
                          <ProductCard elm={elm} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </section>
                )}
              </>
            )}
          </div>
          {/* end body */}

          {/* ── Footer: dismiss row ──────────────────────────────── */}
          {!loading && (
            <footer className="ymal-footer">
              <label className="ymal-dismiss-label" htmlFor="ymal-dont-show">
                <input
                  id="ymal-dont-show"
                  type="checkbox"
                  className="ymal-dismiss-checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                />
                <span>Don’t remind me again</span>
              </label>
              <button
                type="button"
                className="ymal-footer-close"
                onClick={closeDismissed}
                aria-label={dontShow ? "Close and stop showing recommendations this session" : "Continue shopping — go to the shop page"}
              >
                {dontShow ? "Got it, Close" : "Continue Shopping"}
              </button>
            </footer>
          )}

        </div>
        {/* end modal */}
      </div>
    </>
  );
}