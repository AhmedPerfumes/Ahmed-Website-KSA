"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import he from "he";

/**
 * LuxuryGallery — Product Image Gallery
 *
 * Desktop: Large main image + VERTICAL thumbnail sidebar on LEFT (always above-fold)
 * Mobile:  Full-width swipeable image + bottom thumbnail strip
 *
 * Audit fixes applied:
 *  - Fix #4: Thumbnails moved to left vertical sidebar on desktop (reef/farfetch-style)
 *  - Fix #5: Prev/Next arrow buttons overlaid on main image
 *  - Fix #5: Mobile swipe delta reduced from 40px → 30px for better sensitivity
 *
 * Props:
 *   images[]     — array of storage path strings
 *   product      — product object for badges / product_name
 *   activeIndex  — controlled by parent (LuxuryPDP)
 *   setActiveIndex — setter from parent
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/* ─── Badge overlay ─────────────────────────────────────────── */
const Badges = ({ product }) => {
  const isOutOfStock = (product?.product_qty ?? 0) <= 0;
  const now = new Date();
  const discount = product?.discount;
  const isDiscountActive =
    discount &&
    new Date(discount.start_date) <= now &&
    new Date(discount.end_date) >= now;

  return (
    <div className="pdp-gallery__badge-row" aria-hidden="true">
      {isOutOfStock && (
        <span className="pdp-badge pdp-badge--oos">Out of Stock</span>
      )}
      {!isOutOfStock && isDiscountActive && (
        <span className="pdp-badge pdp-badge--sale">
          Save {discount.value}
          {discount.discount_type === "percent" ? "%" : " SAR"}
        </span>
      )}
      {product?.label_name && !isOutOfStock && (
        <span
          className="pdp-badge pdp-badge--custom"
          style={{ backgroundColor: product.label_color || "#1A1A1A" }}
        >
          {product.label_name}
        </span>
      )}
    </div>
  );
};

/* ─── Arrow Button ──────────────────────────────────────────── */
const ArrowBtn = ({ direction, onClick, disabled }) => (
  <button
    className={`pdp-gallery__arrow pdp-gallery__arrow--${direction}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "prev" ? "Previous image" : "Next image"}
    type="button"
  >
    {direction === "prev" ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )}
  </button>
);

/* ─── Main Component ────────────────────────────────────────── */
const LuxuryGallery = ({ images = [], product, activeIndex, setActiveIndex }) => {
  const touchStartX = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const openLightbox = useCallback((idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = () => setLightboxOpen(false);
  const lbPrev = () => setLightboxIndex((i) => Math.max(i - 1, 0));
  const lbNext = () => setLightboxIndex((i) => Math.min(i + 1, images.length - 1));

  /* Navigation helpers */
  const goPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, [setActiveIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(prev + 1, images.length - 1));
  }, [images.length, setActiveIndex]);

  /* Swipe handlers (mobile) — threshold reduced 40→30px for better sensitivity */
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 30) {
        setActiveIndex((prev) =>
          delta > 0
            ? Math.min(prev + 1, images.length - 1)
            : Math.max(prev - 1, 0)
        );
      }
      touchStartX.current = null;
    },
    [images.length, setActiveIndex]
  );

  const currentImage = images[activeIndex] ?? images[0];
  const imgSrc = currentImage
    ? `${API_URL}storage/${currentImage}`
    : "/assets/images/general_product.png";

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  return (
    <div className="pdp-gallery" role="region" aria-label="Product images">

      {/* ═══ DESKTOP LAYOUT: Vertical Thumb Sidebar + Main Image ═══ */}
      <div className="pdp-gallery__desktop-layout">

        {/* Vertical thumbnail sidebar — always visible, above fold */}
        {images.length > 1 && (
          <div
            className="pdp-gallery__thumb-sidebar"
            role="tablist"
            aria-label="Select image"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`pdp-gallery__thumb${activeIndex === idx ? " active" : ""}`}
                onClick={() => setActiveIndex(idx)}
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Image ${idx + 1}`}
                type="button"
              >
                <Image
                  src={`${API_URL}storage/${img}`}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                  style={{ objectFit: "contain", width: "100%", height: "100%" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image area */}
        <div
          className="pdp-gallery__main"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="img"
          aria-label={`${he.decode(product?.product_name || "Product")} — image ${activeIndex + 1} of ${images.length}`}
          onClick={() => openLightbox(activeIndex)}
          title="Click to zoom"
        >
          <Image
            src={imgSrc}
            alt={he.decode(product?.product_name || "Product")}
            fill
            sizes="(max-width: 991px) 100vw, 42vw"
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            style={{ objectFit: "contain" }}
          />
          <Badges product={product} />

          {/* Prev / Next arrows — only shown when multiple images exist */}
          {images.length > 1 && (
            <>
              <ArrowBtn direction="prev" onClick={(e) => { e.stopPropagation(); goPrev(); }} disabled={!hasPrev} />
              <ArrowBtn direction="next" onClick={(e) => { e.stopPropagation(); goNext(); }} disabled={!hasNext} />
            </>
          )}

          {/* Image counter pill */}
          {images.length > 1 && (
            <div className="pdp-gallery__counter" aria-hidden="true">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MOBILE THUMBNAIL STRIP — below main image ═══════════ */}
      {images.length > 1 && (
        <div
          className="pdp-gallery__thumb-strip"
          role="tablist"
          aria-label="Select image"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`pdp-gallery__thumb${activeIndex === idx ? " active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Image ${idx + 1}`}
              type="button"
            >
              <Image
                src={`${API_URL}storage/${img}`}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ═══ LIGHTBOX PORTAL ═══════════════════════════════════ */}
      {lightboxOpen && typeof window !== "undefined" && createPortal(
        <div
          className="pdp-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
              onClick={(e) => { e.stopPropagation(); lbPrev(); }}
              disabled={lightboxIndex === 0}
              aria-label="Previous image"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          {/* Image */}
          <div
            className="pdp-lightbox__img-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="pdp-lightbox__close" onClick={closeLightbox} aria-label="Close" type="button">&times;</button>
            <Image
              src={images[lightboxIndex] ? `${API_URL}storage/${images[lightboxIndex]}` : "/assets/images/general_product.png"}
              alt={he.decode(product?.product_name || "Product")}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
            />
          </div>

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
              onClick={(e) => { e.stopPropagation(); lbNext(); }}
              disabled={lightboxIndex >= images.length - 1}
              aria-label="Next image"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default LuxuryGallery;
