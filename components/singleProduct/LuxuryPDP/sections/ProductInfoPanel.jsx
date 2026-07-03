"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { useLocale, useTranslations } from "next-intl";
import { renderPrice } from "@/utlis/priceRenderer";
import { motion, AnimatePresence } from "framer-motion";
import TamaraWidget from "@/components/TamaraWidget";
import { toast } from "react-toastify";
import Link from "next/link";
import he from "he";

/**
 * ProductInfoPanel — Sections 3 + 4
 *
 * Contains:
 *  - Breadcrumb (SEO-safe, server-renderable content)
 *  - Product H1 title + olfactory family subtitle
 *  - Star rating row (scrolls to reviews on click)
 *  - Price block with discount logic
 *  - Tabby/Tamara BNPL widgets
 *  - Size/volume tags display
 *  - Add-to-Cart block with animated quantity control
 *
 * API fields used:
 *   product_name, product_name_ar, price, discount, sale_price,
 *   product_qty, maximum_order_quantity, product_id, tags,
 *   olfactory_family, fragrance_category, average_rating, review_count
 *   category, subcategory
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/* ─── Star Rating Display ─── */
const StarDisplay = ({ rating = 0, count = 0 }) => {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round(rating);
  return (
    <div className="pdp-info__rating-row">
      <div className="pdp-stars" aria-label={`Rated ${rating} out of 5 stars`}>
        {stars.map((s) => (
          <span
            key={s}
            className={`pdp-star ${s <= rounded ? "" : "pdp-star--empty"}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
      {count > 0 && (
        <a
          href="#pdp-reviews"
          className="pdp-info__review-count"
          aria-label={`See all ${count} reviews`}
        >
          {count} {count === 1 ? "Review" : "Reviews"}
        </a>
      )}
    </div>
  );
};

/* ─── Price Block ─── */
const PriceBlock = ({ product, currency }) => {
  const now = new Date();
  const discount = product?.discount;
  const isDiscountActive =
    discount &&
    new Date(discount.start_date) <= now &&
    new Date(discount.end_date) >= now;

  let salePrice = null;
  let discountLabel = null;

  if (isDiscountActive) {
    if (discount.discount_type === "percent") {
      salePrice = (
        product.price -
        (product.price / 100) * discount.value
      ).toFixed(2);
      discountLabel = `${discount.value}% OFF`;
    } else if (discount.discount_type === "amount") {
      salePrice = parseFloat(discount.final_price || product.price - discount.value).toFixed(2);
      discountLabel = `${currency?.symbol}${discount.value} OFF`;
    }
  }

  const savings = salePrice
    ? (parseFloat(product.price) - parseFloat(salePrice)).toFixed(2)
    : null;

  return (
    <div>
      <div className="pdp-price-block">
        {salePrice ? (
          <>
            <span className="pdp-price pdp-price--sale">
              {currency?.symbol}{salePrice}
            </span>
            <span className="pdp-price--old">
              {currency?.symbol}{product.price}
            </span>
            <span className="pdp-discount-badge">{discountLabel}</span>
          </>
        ) : (
          <span className="pdp-price">
            {currency?.symbol}{product?.price}
          </span>
        )}
      </div>
      {savings && (
        <p className="pdp-price-savings">
          You save {currency?.symbol}{savings}
        </p>
      )}
    </div>
  );
};

/* ─── Tabby Price Helper ─── */
const getTabbyPrice = (product) => {
  const now = new Date();
  const discount = product?.discount;
  if (
    discount &&
    new Date(discount.start_date) <= now &&
    new Date(discount.end_date) >= now
  ) {
    if (discount.discount_type === "percent") {
      return (product.price - (product.price / 100) * discount.value).toFixed(2);
    }
    return parseFloat(discount.final_price || product.price - discount.value).toFixed(2);
  }
  return product?.price;
};

/* ─── Main Component ─── */
const ProductInfoPanel = ({ product, category, subcategory }) => {
  const locale = useLocale();
  const t = useTranslations();
  const { currency } = useMenu();
  const { cartProducts, setCartProducts, removeProduct } = useContextElement();

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  const productName = locale === "ar"
    ? he.decode(product?.product_name_ar || product?.product_name || "")
    : he.decode(product?.product_name || "");

  const displaySubtitle = product?.olfactory_family || product?.fragrance_category || "";

  /* ── Cart helpers ── */
  const isInCart = useMemo(
    () => cartProducts.some((elm) => elm.product_id == product?.product_id),
    [cartProducts, product?.product_id]
  );

  const cartItem = useMemo(
    () => cartProducts.find((elm) => elm.product_id == product?.product_id),
    [cartProducts, product?.product_id]
  );

  const currentQty = cartItem ? cartItem.quantity : quantity;

  const capitalizeEachWord = (str = "") =>
    str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  const setQuantityCartItem = (id, qty, maxOrderQty) => {
    const n = Number(qty);
    const stock = Number(product.product_qty);
    const maxOrder = Number(maxOrderQty);
    const limit = maxOrder > 0 ? maxOrder : stock;
    const isValid = n >= 1 && n <= stock && n <= limit;

    if (cartItem) {
      if (isValid) {
        setError(null);
        const items = cartProducts.map((elm) =>
          elm.product_id == id ? { ...elm, quantity: n } : elm
        );
        setCartProducts(items);
      } else {
        setError(
          n > stock
            ? t("Quantity is more than available quantity")
            : `Maximum allowed quantity is ${limit}`
        );
      }
    } else {
      if (isValid) {
        setQuantity(n);
        setError(null);
      } else {
        setError(
          n > stock
            ? t("Quantity is more than available quantity")
            : `Maximum allowed quantity is ${limit}`
        );
      }
    }
  };

  const addToCart = () => {
    if (!isInCart) {
      const item = {
        ...product,
        category_name: capitalizeEachWord(category.split("-").join(" ")),
        subcategory_name: capitalizeEachWord(subcategory.split("-").join(" ")),
        quantity,
      };
      setCartProducts((prev) => [...prev, item]);
      setError(null);
      toast.success(t("Added to Cart"), {
        position: "bottom-right",
        autoClose: 4000,
      });
    }
  };

  /* ── Tabby Widget ── */
  useEffect(() => {
    const price = getTabbyPrice(product);
    const total = (parseFloat(price) * currentQty).toFixed(2);

    const renderTabby = () => {
      if (window.TabbyPromo && typeof window.TabbyPromo === "function") {
        try {
          new window.TabbyPromo({
            selector: "#LuxuryPDP-TabbyPromo",
            currency: "SAR",
            price: total,
            lang: locale,
            source: "product",
            publicKey: "pk_test_019228fd-8e52-3ecd-f813-bf11dc8e2118",
            merchantCode: "assaaste",
          });
        } catch (e) { /* silent */ }
      }
    };

    const scriptId = "tabby-promo-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.src = "https://checkout.tabby.ai/tabby-promo.js";
      s.id = scriptId;
      s.async = true;
      s.onload = renderTabby;
      document.body.appendChild(s);
    } else {
      renderTabby();
    }
  }, [currentQty, locale, product]);

  const isOutOfStock = product?.product_qty <= 0;
  const tags = Array.isArray(product?.tags) ? product.tags : [];

  /* ── Average rating from product object or passed in ── */
  const avgRating = parseFloat(product?.average_rating || 0);
  const reviewCount = parseInt(product?.review_count || 0, 10);

  /* ── Breadcrumb labels ── */
  const catLabel = capitalizeEachWord(category?.split("-").join(" ") || "");
  const subcatLabel = capitalizeEachWord(subcategory?.split("-").join(" ") || "");

  return (
    <div className="pdp-info">
      {/* Breadcrumb — semantic nav for SEO */}
      <nav aria-label="Breadcrumb" className="pdp-info__breadcrumb">
        <Link href={`/${locale}`}>{t("Home")}</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/${locale}/shop/${category}`}>{t(catLabel)}</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/${locale}/shop/${category}/${subcategory}`}>{t(subcatLabel)}</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{productName}</span>
      </nav>

      {/* Product Title — H1 for SEO */}
      <h1 className="pdp-info__title">{productName}</h1>

      {/* Subtitle (olfactory family / fragrance category) */}
      {displaySubtitle && (
        <p className="pdp-info__subtitle">{displaySubtitle}</p>
      )}

      {/* Star Rating Row */}
      <StarDisplay rating={avgRating} count={reviewCount} />

      {/* Price Block */}
      <PriceBlock product={product} currency={currency} />

      {/* BNPL Row: Tabby + Tamara */}
      <div className="pdp-bnpl-row">
        <div id="LuxuryPDP-TabbyPromo" />
        <TamaraWidget inlineType="6" inlineVariant="outlined" locale={locale} />
      </div>

      {/* Size / Volume Tags */}
      {tags.length > 0 && (
        <div className="pdp-size-row">
          <span className="pdp-size-row__label">{t("Size")}</span>
          <div className="pdp-size-tags">
            {tags.map((tag, i) => (
              <div key={i} className="pdp-size-tag">
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pdp-error"
            role="alert"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add-to-Cart Block */}
      <div className="pdp-atc-block">
        {isOutOfStock ? (
          <div className="pdp-atc-row">
            <button
              id="product-detail-top"
              className="pdp-atc-btn pdp-atc-btn--oos"
              disabled
              aria-disabled="true"
            >
              {t("Out of Stock")}
            </button>
          </div>
        ) : (
          <div className="pdp-atc-row">
            {/* Add to Cart / Already Added */}
            <motion.button
              layout
              id="product-detail-top"
              type="button"
              className={`pdp-atc-btn ${isInCart ? "pdp-atc-btn--added" : ""}`}
              onClick={() => !isInCart && addToCart()}
              disabled={isInCart}
              animate={{ flex: isInCart ? "0 1 60%" : "1 1 100%" }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              {isInCart ? t("Already Added") : t("Add to Cart")}
            </motion.button>

            {/* Quantity Controller (slides in when in cart) */}
            <AnimatePresence>
              {isInCart && (
                <motion.div
                  key="qty"
                  className="pdp-qty-ctrl"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 120, opacity: 1, flex: "0 0 120px" }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "tween", duration: 0.15 }}
                >
                  <button
                    className="pdp-qty-btn"
                    aria-label="Decrease quantity"
                    onClick={() => {
                      const cur = cartItem?.quantity ?? 1;
                      if (cur > 1) {
                        setQuantityCartItem(
                          product.product_id,
                          cur - 1,
                          product?.maximum_order_quantity
                        );
                      } else {
                        removeProduct(product.product_id);
                      }
                    }}
                  >
                    −
                  </button>
                  <span className="pdp-qty-num">{cartItem?.quantity ?? 1}</span>
                  <button
                    className="pdp-qty-btn"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantityCartItem(
                        product.product_id,
                        (cartItem?.quantity ?? 1) + 1,
                        product?.maximum_order_quantity
                      )
                    }
                  >
                    +
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoPanel;
