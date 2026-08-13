"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import he from "he";

/**
 * LuxuryGallery — Product Image Gallery
 *
 * Desktop: Large main image + horizontal thumbnail strip BELOW it (reef-style)
 * Mobile:  Full-width swipeable image + bottom dot/thumbnail strip
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

      {/* ═══ MAIN IMAGE — full width ═══════════════════════════ */}
      <div
        className="pdp-gallery__main"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="img"
        aria-label={`${he.decode(product?.product_name || "Product")} — image ${activeIndex + 1} of ${images.length}`}
      >
        <Image
          src={imgSrc}
          alt={he.decode(product?.product_name || "Product")}
          fill
          sizes="(max-width: 991px) 100vw, 48vw"
          priority={activeIndex === 0}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          style={{ objectFit: "contain" }}
        />
        <Badges product={product} />
      </div>

      {/* ═══ THUMBNAIL STRIP — below main image ════════════════ */}
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
    </div>
  );
};

export default LuxuryGallery;
