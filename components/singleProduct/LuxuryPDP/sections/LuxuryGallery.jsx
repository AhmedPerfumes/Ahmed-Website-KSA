"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";

/**
 * LuxuryGallery — Section 2
 *
 * Features:
 * - Desktop: vertical thumbnail strip + large main image with CSS zoom on hover
 * - Mobile: touch-swipeable full-width carousel with dot indicators
 * - First image uses Next.js priority loading (above fold LCP)
 * - Rest lazy-loaded
 * - Badge overlay support (Sale, New, Out of Stock, custom labels)
 * - Video tile support (if product.video exists)
 *
 * API fields:
 *   images: string[]           — parsed from product.images (JSON array of storage paths)
 *   badgeTypes: string[]       — parsed from product.badge (JSON)
 *   labelName?: string         — product.label_name
 *   labelColor?: string        — product.label_color
 *   isOutOfStock: boolean      — product.product_qty <= 0
 *   discount?: object          — product.discount
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const GalleryBadges = ({ isOutOfStock, discount, labelName, labelColor }) => {
  const now = new Date();
  const isDiscountActive =
    discount &&
    new Date(discount.start_date) <= now &&
    new Date(discount.end_date) >= now;

  return (
    <div className="pdp-gallery__badge-row" aria-label="Product badges">
      {isOutOfStock && (
        <span className="pdp-badge pdp-badge--oos" role="status">
          Out of Stock
        </span>
      )}
      {!isOutOfStock && isDiscountActive && (
        <span className="pdp-badge pdp-badge--sale">
          Save {discount.value}
          {discount.discount_type === "percent" ? "%" : " SAR"}
        </span>
      )}
      {labelName && !isOutOfStock && (
        <span
          className="pdp-badge pdp-badge--custom"
          style={{ backgroundColor: labelColor || "#1A1A1A" }}
        >
          {labelName}
        </span>
      )}
    </div>
  );
};

const LuxuryGallery = ({
  images = [],
  product,
  activeIndex,
  setActiveIndex,
}) => {
  const isOutOfStock = product?.product_qty <= 0;
  const discount = product?.discount || null;
  const labelName = product?.label_name;
  const labelColor = product?.label_color;

  // Touch swipe state for mobile
  const touchStartX = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        } else {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        }
      }
      touchStartX.current = null;
    },
    [images.length, setActiveIndex]
  );

  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="pdp-gallery" aria-label="Product image gallery">
      {/* Main Image — visible on all screen sizes */}
      <div
        className="pdp-gallery__main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label={`Product image ${activeIndex + 1} of ${images.length}`}
      >
        {currentImage ? (
          <Image
            src={`${API_URL}storage/${currentImage}`}
            alt={product?.product_name || "Product image"}
            fill
            sizes="(max-width: 991px) 100vw, 50vw"
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Image
            src="/assets/images/general_product.png"
            alt="Product"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        )}

        <GalleryBadges
          isOutOfStock={isOutOfStock}
          discount={discount}
          labelName={labelName}
          labelColor={labelColor}
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="pdp-gallery__thumbs"
          role="list"
          aria-label="Thumbnail navigation"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`pdp-gallery__thumb ${activeIndex === idx ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-current={activeIndex === idx}
              role="listitem"
            >
              <Image
                src={`${API_URL}storage/${img}`}
                alt=""
                width={68}
                height={68}
                loading="lazy"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile dot indicators */}
      {images.length > 1 && (
        <div
          className="pdp-gallery__mobile-dots"
          role="tablist"
          aria-label="Image navigation"
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`pdp-gallery__mobile-dot ${activeIndex === idx ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
              role="tab"
              aria-selected={activeIndex === idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LuxuryGallery;
