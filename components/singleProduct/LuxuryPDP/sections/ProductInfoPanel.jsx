"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { renderPrice } from "@/utlis/priceRenderer";
import { motion, AnimatePresence } from "framer-motion";
import TamaraWidget from "@/components/TamaraWidget";
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
 *  - Stock status indicator
 *  - Pre-cart quantity stepper (Fix #1)
 *  - Add-to-Cart block with Buy Now (Fix #2)
 *  - Unified in-cart stepper (Fix #6)
 *  - Share row (WhatsApp + Copy Link)
 *
 * Audit fixes:
 *  #1 — Quantity selector shown BEFORE first Add to Cart
 *  #2 — "Buy Now" button for direct-to-checkout path
 *  #3 — ATC button text changed to #fff for maximum contrast
 *  #6 — In-cart state shows single unified qty control (no ghost disabled button)
 *
 * API fields used:
 *   product_name, product_name_ar, price, discount, sale_price,
 *   product_qty, maximum_order_quantity, product_id, tags,
 *   olfactory_family, fragrance_category, average_rating, review_count
 *   category, subcategory
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/* ─── Star Rating Display ─── */
// Progressive star colors: lightest gold → deep amber (position 1 → 5)
const STAR_COLORS = ['#E5C07A', '#D4A84B', '#C9903A', '#B87730', '#8B5E10'];
const STAR_EMPTY  = '#D9D2CA';

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
            style={{ color: s <= rounded ? STAR_COLORS[s - 1] : STAR_EMPTY }}
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

/* ─── Stock Status Indicator ─── */
const StockStatus = ({ qty }) => {
  if (qty <= 0) {
    return (
      <div className="pdp-stock pdp-stock--out">
        <span className="pdp-stock__dot" />
        <span className="pdp-stock__label">Out of Stock</span>
      </div>
    );
  }
  if (qty <= 5) {
    return (
      <div className="pdp-stock pdp-stock--low">
        <span className="pdp-stock__dot" />
        <span className="pdp-stock__label">Only {qty} left — order soon</span>
      </div>
    );
  }
  return (
    <div className="pdp-stock pdp-stock--in">
      <span className="pdp-stock__dot" />
      <span className="pdp-stock__label">In Stock</span>
    </div>
  );
};

/* ─── Share Row ─── */
const ShareRow = ({ productName }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {});
  }, []);

  const waText =
    typeof window !== "undefined"
      ? encodeURIComponent((productName || "") + " — " + window.location.href)
      : "";

  return (
    <div className="pdp-share-row" aria-label="Share this product">
      <span className="pdp-share-label">Share:</span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pdp-share-btn pdp-share-btn--wa"
        aria-label="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>

      {/* Copy Link */}
      <button
        className="pdp-share-btn"
        onClick={copyLink}
        aria-label={copied ? "Link copied!" : "Copy link"}
      >
        {copied ? (
          <span className="pdp-share-copied">✓ Copied!</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy Link
          </>
        )}
      </button>
    </div>
  );
};

/* ─── Pre-Cart Quantity Stepper (Fix #1) ─── */
const PreCartQtyStepper = ({ quantity, onDecrease, onIncrease, max }) => (
  <div className="pdp-pre-qty" role="group" aria-label="Select quantity">
    <span className="pdp-pre-qty__label">Qty</span>
    <div className="pdp-pre-qty__ctrl">
      <button
        className="pdp-pre-qty__btn"
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        type="button"
      >
        −
      </button>
      <span className="pdp-pre-qty__num" aria-live="polite">{quantity}</span>
      <button
        className="pdp-pre-qty__btn"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        type="button"
      >
        +
      </button>
    </div>
  </div>
);

/* ─── Main Component ─── */
const ProductInfoPanel = ({ product, category, subcategory, reviews = [], reviewsLoading = false }) => {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { currency } = useMenu();
  const { cartProducts, setCartProducts, removeProduct } = useContextElement();

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  const productName = locale === "ar"
    ? he.decode(product?.product_name_ar || product?.product_name || "")
    : he.decode(product?.product_name || "");

  const displaySubtitle = product?.olfactory_family || product?.fragrance_category || "";

  /* ── Limits ── */
  const stockQty = Number(product?.product_qty ?? 0);
  const maxOrderQty = Number(product?.maximum_order_quantity ?? 0);
  const qtyLimit = maxOrderQty > 0 ? Math.min(maxOrderQty, stockQty) : stockQty;

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

  /* ── Pre-cart qty stepper handlers ── */
  const handlePreDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
    setError(null);
  }, []);

  const handlePreIncrease = useCallback(() => {
    setQuantity((prev) => {
      const next = prev + 1;
      if (next > qtyLimit) {
        setError(qtyLimit === stockQty
          ? t("Quantity is more than available quantity")
          : `Maximum allowed quantity is ${qtyLimit}`
        );
        return prev;
      }
      setError(null);
      return next;
    });
  }, [qtyLimit, stockQty, t]);

  /* ── In-cart qty update ── */
  const setQuantityCartItem = (id, qty) => {
    const n = Number(qty);
    const isValid = n >= 1 && n <= stockQty && n <= qtyLimit;

    if (isValid) {
      setError(null);
      const items = cartProducts.map((elm) =>
        elm.product_id == id ? { ...elm, quantity: n } : elm
      );
      setCartProducts(items);
    } else {
      setError(
        n > stockQty
          ? t("Quantity is more than available quantity")
          : `Maximum allowed quantity is ${qtyLimit}`
      );
    }
  };

  /* ── Image helper for toast ── */
  const getProductImg = useCallback(() => {
    const imgs = product?.images
      ? typeof product.images === "string"
        ? JSON.parse(product.images)
        : product.images
      : [];
    return imgs[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${imgs[0]}` : "";
  }, [product]);

  /* ── Fire cart toast ── */
  const fireToast = useCallback((qty) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("cart:added", {
        detail: {
          name: productName,
          image: getProductImg(),
          qty,
          category: category || "",
          subcategory: subcategory || "",
        },
      })
    );
  }, [productName, getProductImg, category, subcategory]);

  /* ── Add to Cart ── */
  const addToCart = useCallback(() => {
    if (!isInCart) {
      const item = {
        ...product,
        category_name: capitalizeEachWord(category.split("-").join(" ")),
        subcategory_name: capitalizeEachWord(subcategory.split("-").join(" ")),
        quantity,
      };
      setCartProducts((prev) => [...prev, item]);
      setError(null);
      fireToast(quantity);
    }
  }, [isInCart, product, category, subcategory, quantity, setCartProducts, fireToast]);

  /* ── Buy Now (Fix #2) — add to cart then go to checkout ── */
  const buyNow = useCallback(() => {
    if (isInCart) {
      // Already in cart — just go to checkout
      router.push(`/${locale}/checkout`);
      return;
    }
    const item = {
      ...product,
      category_name: capitalizeEachWord(category.split("-").join(" ")),
      subcategory_name: capitalizeEachWord(subcategory.split("-").join(" ")),
      quantity,
    };
    setCartProducts((prev) => [...prev, item]);
    setError(null);
    fireToast(quantity);
    router.push(`/${locale}/checkout`);
  }, [isInCart, product, category, subcategory, quantity, setCartProducts, fireToast, router, locale]);

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

  /* ── Rating from live reviews (falls back to product API while loading) ── */
  const avgRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.star || 0), 0);
      return sum / reviews.length;
    }
    return parseFloat(product?.average_rating || 0);
  }, [reviews, product?.average_rating]);

  const reviewCount = reviews.length > 0
    ? reviews.length
    : parseInt(product?.review_count || 0, 10);

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

      {/* Stock Status */}
      <StockStatus qty={product?.product_qty ?? 0} />

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

      {/* ═══════════════════════════════════════════════════════════
          Add-to-Cart Block — All 4 audit states handled here:
          A) Out of Stock  — disabled OOS button
          B) Pre-cart      — qty stepper + [Add to Cart] + [Buy Now]
          C) In-cart       — unified qty pill + [Buy Now / Go to Checkout]
          ═══════════════════════════════════════════════════════════ */}
      <div className="pdp-atc-block">

        {isOutOfStock ? (
          /* ── A: Out of Stock ── */
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
        ) : !isInCart ? (
          /* ── B: Pre-cart — show qty stepper THEN ATC + Buy Now ── */
          <>
            {/* Fix #1 — Pre-cart quantity selector */}
            <PreCartQtyStepper
              quantity={quantity}
              onDecrease={handlePreDecrease}
              onIncrease={handlePreIncrease}
              max={qtyLimit}
            />

            {/* CTA row: Add to Cart + Buy Now */}
            <div className="pdp-atc-row pdp-atc-row--ctas">
              <button
                id="product-detail-top"
                type="button"
                className="pdp-atc-btn"
                onClick={addToCart}
              >
                {/* Cart icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {t("Add to Cart")}
              </button>

              {/* Fix #2 — Buy Now */}
              <button
                id="product-detail-buynow"
                type="button"
                className="pdp-atc-btn pdp-atc-btn--buynow"
                onClick={buyNow}
              >
                Buy Now
              </button>
            </div>
          </>
        ) : (
          /* ── C: In-cart — unified qty pill (Fix #6) ── */
          <motion.div
            key="incart-unified"
            className="pdp-incart-unified"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hidden anchor so IntersectionObserver in StickyATC still works */}
            <span id="product-detail-top" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }} />

            {/* In-bag label */}
            <div className="pdp-incart-unified__label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              In Your Bag
            </div>

            {/* Qty stepper + Buy Now */}
            <div className="pdp-incart-unified__row">
              <div className="pdp-incart-unified__stepper" role="group" aria-label="Update quantity">
                <button
                  className="pdp-incart-unified__btn"
                  aria-label="Decrease quantity"
                  type="button"
                  onClick={() => {
                    const cur = cartItem?.quantity ?? 1;
                    if (cur > 1) {
                      setQuantityCartItem(product.product_id, cur - 1);
                    } else {
                      removeProduct(product.product_id);
                    }
                  }}
                >
                  {cartItem?.quantity === 1 ? (
                    /* Trash icon when qty would drop to 0 */
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  ) : "−"}
                </button>

                <span className="pdp-incart-unified__num" aria-live="polite">
                  {cartItem?.quantity ?? 1}
                </span>

                <button
                  className="pdp-incart-unified__btn"
                  aria-label="Increase quantity"
                  type="button"
                  onClick={() => {
                    const newQty = (cartItem?.quantity ?? 1) + 1;
                    setQuantityCartItem(product.product_id, newQty);
                    fireToast(newQty);
                  }}
                >
                  +
                </button>
              </div>

              {/* Buy Now / Go to Checkout */}
              <button
                type="button"
                className="pdp-atc-btn pdp-atc-btn--buynow pdp-atc-btn--buynow-sm"
                onClick={() => router.push(`/${locale}/checkout`)}
              >
                Go to Checkout
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Row */}
      <ShareRow productName={productName} />
    </div>
  );
};

export default ProductInfoPanel;
