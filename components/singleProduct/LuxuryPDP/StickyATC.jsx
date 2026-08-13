"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { renderPrice } from "@/utlis/priceRenderer";
import { ShoppingCart } from "@mui/icons-material";
import he from "he";

/** Fires the global cart toast — same event that CartToast listens to */
function fireCartToast(name, image, qty, category, subcategory) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("cart:added", { detail: { name, image, qty: qty || 1, category: category || "", subcategory: subcategory || "" } })
  );
}

/**
 * StickyATC — Enhanced Sticky Add-to-Cart Bar
 *
 * Appears at bottom of viewport when the main ATC button (#product-detail-top)
 * scrolls out of view. Uses IntersectionObserver for performance.
 *
 * Improvements over existing sticky.jsx:
 * - Shows product thumbnail for visual context
 * - Shows price below name
 * - Spring animation on appear/disappear (CSS only, no Framer Motion for perf)
 * - Uses safe-area-inset-bottom for notched iPhones
 *
 * API fields: product.images, product.product_name, product.product_name_ar,
 *             product.price, product.discount, product.product_qty, product.product_id
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const StickyATC = ({ product }) => {
  const [show, setShow] = useState(false);
  const { cartProducts, setCartProducts } = useContextElement();
  const locale = useLocale();
  const t = useTranslations("ProductDetails");
  const { currency } = useMenu();

  const productName =
    locale === "ar"
      ? he.decode(product?.product_name_ar?.trim() || product?.product_name || "")
      : he.decode(product?.product_name || "");

  const isOutOfStock = product?.product_qty <= 0;

  const images = product?.images
    ? typeof product.images === "string"
      ? JSON.parse(product.images)
      : product.images
    : [];

  const thumbSrc = images[0]
    ? `${API_URL}storage/${images[0]}`
    : "/assets/images/general_product.png";

  const isInCart = cartProducts.some(
    (elm) => elm.product_id == product?.product_id
  );

  const capitalizeEachWord = (str = "") =>
    str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const addToCart = () => {
    if (!isInCart && !isOutOfStock) {
      const item = {
        ...product,
        category_name: capitalizeEachWord(
          (product?.category || "").split("-").join(" ")
        ),
        subcategory_name: capitalizeEachWord(
          (product?.subcategory || "").split("-").join(" ")
        ),
        quantity: 1,
      };
      setCartProducts((prev) => [...prev, item]);
      // Fire premium cart toast
      fireCartToast(productName, thumbSrc, 1, product?.category_name, product?.subcategory?.subcategory_name || "");
    }
  };

  // Watch main ATC button
  useEffect(() => {
    const target = document.getElementById("product-detail-top");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!product) return null;

  return (
    <div
      className={`pdp-sticky-atc ${show ? "visible" : ""}`}
      role="region"
      aria-label="Quick add to cart"
      aria-hidden={!show}
    >
      {/* Product Thumbnail */}
      <Image
        src={thumbSrc}
        alt=""
        width={44}
        height={44}
        className="pdp-sticky-atc__thumb"
        aria-hidden="true"
      />

      {/* Product Info */}
      <div className="pdp-sticky-atc__info">
        <p className="pdp-sticky-atc__name">{productName}</p>
        <p className="pdp-sticky-atc__price">{renderPrice(product, currency)}</p>
      </div>

      {/* CTA Button */}
      <button
        id="product-detail-sticky-btn"
        className="pdp-sticky-atc__btn"
        onClick={addToCart}
        disabled={isInCart || isOutOfStock}
        aria-label={
          isOutOfStock
            ? t("outOfStock")
            : isInCart
            ? t("alreadyAdded")
            : t("addToCart")
        }
      >
        {isOutOfStock
          ? t("outOfStock")
          : isInCart
          ? t("alreadyAdded")
          : t("addToCart")}
      </button>
    </div>
  );
};

export default StickyATC;
