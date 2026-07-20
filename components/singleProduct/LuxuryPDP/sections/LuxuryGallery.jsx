"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

/**
 * LuxuryGallery — Product Image Gallery
 *
 * Desktop: Vertical thumbnail column (left) + tall main image (right) — Noon/Amazon style
 * Mobile:  Full-width swipeable carousel with thumbnail strip + dot navigation
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

/* ─── Main Component ────────────────────────────────────────── */
const LuxuryGallery = ({ images = [], product, activeIndex, setActiveIndex }) => {
  const touchStartX = useRef(null);

  /* Swipe handlers (mobile) */
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
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

  return (
    <div className="pdp-gallery" role="region" aria-label="Product images">
      {/* ═══ DESKTOP: thumb sidebar + main image ══════════════ */}
      <div className="pdp-gallery__desktop-wrap">
        {/* Vertical thumbnail column */}
        {images.length > 1 && (
          <div
            className="pdp-gallery__thumb-col"
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
              >
                <Image
                  src={`${API_URL}storage/${img}`}
                  alt=""
                  width={76}
                  height={76}
                  loading="lazy"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          className="pdp-gallery__main"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="img"
          aria-label={`${product?.product_name || "Product"} — image ${activeIndex + 1} of ${images.length}`}
        >
          <Image
            src={imgSrc}
            alt={product?.product_name || "Product"}
            fill
            sizes="(max-width: 991px) 100vw, 48vw"
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            style={{ objectFit: "cover" }}
          />
          <Badges product={product} />
        </div>
      </div>

      {/* ═══ MOBILE: horizontal thumbnail strip ════════════════ */}
      {images.length > 1 && (
        <div
          className="pdp-gallery__mobile-strip"
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
            >
              <Image
                src={`${API_URL}storage/${img}`}
                alt=""
                width={60}
                height={60}
                loading="lazy"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile dot indicators */}
      {images.length > 1 && (
        <div className="pdp-gallery__mobile-dots" role="tablist" aria-label="Image navigation">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`pdp-gallery__mobile-dot${activeIndex === idx ? " active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LuxuryGallery;
