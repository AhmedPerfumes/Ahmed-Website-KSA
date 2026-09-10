"use client";
/**
 * Cart.jsx — Full Cart Page
 *
 * Fixes (round 4):
 *  A  TabbyPromoWidget — stable self-contained component (mirrors TamaraWidget)
 *  B  "Continue Shopping" moved to a breadcrumb/nav row above the grid — not
 *     inside the items list where it competes with line items
 *  C  Responsive + SEO: semantic <nav>, <article> for cart items, <aside> for
 *     summary, proper aria-labels, no layout jank on mobile
 */

import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useMenu } from "../../context/MenuContext";
import Pagination1 from "../common/Pagination1";
import TamaraWidget from "../TamaraWidget";
import TabbyPromoWidget from "../TabbyPromoWidget";
import dynamic from "next/dynamic";
import he from "he";

const YouMayAlsoLike = dynamic(
  () => import("@/components/cart/YouMayAlsoLike"),
  { ssr: false }
);

const FREE_SHIPPING_THRESHOLD = 300;

export default function Cart() {
  const {
    shippingServiceCharges,
    vatTax,
    isLoading: isMenuLoading,
    error: isMenuError,
    currency,
  } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  // Start closed to avoid SSR/hydration mismatch — open after mount
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Coupon state — mirrors Checkout right sidebar
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponData, setCouponData] = useState(null);

  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    freeShippingFlag,
    setCouponDataContext,
    removeGiftFromCart,
  } = useContextElement();

  // Free-shipping progress
  const progressPct = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining   = (FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2);

  // Open summary after hydration so SSR and client agree
  useEffect(() => { setSummaryOpen(true); }, []);

  useEffect(() => {
    setCouponDataContext(null);
    removeGiftFromCart();
    if (typeof window !== "undefined" && window.AhmedTracker) {
      const items = cartProducts || [];
      const total = items.reduce(
        (acc, item) =>
          acc +
          parseFloat(item.sale_price || item.price || 0) *
            Number(item.quantity || 1),
        0
      );
      window.AhmedTracker.track("view_cart", {
        total: parseFloat(total.toFixed(2)),
        items_count: items.length,
        items: items.map((item) => ({
          product_id: (item.product_id || item.id)?.toString(),
          product_name: item.product_name || "",
          price: parseFloat(item.sale_price || item.price || 0),
          quantity: Number(item.quantity || 1),
        })),
      });
    }
  }, []);

  const setQuantity = (id, quantity, productQty, maxOrderQty) => {
    const MAX = maxOrderQty && maxOrderQty > 0 ? maxOrderQty : productQty;
    if (quantity >= 1 && quantity <= productQty && quantity <= MAX) {
      setError(null);
      setCartProducts(
        cartProducts.map((elm) =>
          elm.product_id === id ? { ...elm, quantity } : elm
        )
      );
    } else {
      setError(
        quantity < 1
          ? "Minimum quantity is 1"
          : `Maximum allowed quantity is ${MAX}`
      );
    }
  };

  const removeItem = (id) =>
    setCartProducts(cartProducts.filter((elm) => elm.product_id !== id));

  const isExpired = (d) => new Date(d) < new Date();

  // Fetch coupons when modal opens
  const openCouponModal = async () => {
    setShowCouponModal(true);
    if (coupons.length) return; // already loaded
    setCouponLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: "KSA", salesType: "EComm" }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCoupons(
          (data.data || []).map((c) => ({
            id: c.couponCode,
            code: c.couponCode,
            title: c.promotionName,
            description: c.value
              ? c.baseOn === "P" ? `${c.value}% OFF` : `SAR ${c.value} OFF`
              : "",
            coupon_type: c.baseOn === "P" ? "percent" : "amount",
            value: c.value,
            end_date: c.validTo,
            start_date: c.registrationDate,
          }))
        );
      }
    } catch {
      setCoupons([]);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectCoupon = (code, id) => {
    setCouponCode(code);
    setCopiedId(id);
    setShowCouponModal(false);
    setTimeout(() => setCopiedId(null), 1400);
  };

  // Coupon handlers
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponError(null);
    setCouponSuccess(null);
  };
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    // TODO: wire to full apply logic when checkout coupon API available on cart
    setCouponError("Invalid or expired code.");
    setCouponSuccess(null);
  }, [couponCode]);
  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setCouponError(null);
    setCouponSuccess(null);
  };

  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError)   return <div>{isMenuError}</div>;

  const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const getDiscountedPrice = (elm) => {
    if (
      elm?.discount &&
      new Date(now) >= new Date(elm.discount.start_date) &&
      new Date(now) <= new Date(elm.discount.end_date)
    ) {
      if (elm.discount.discount_type === "percent")
        return elm.price - (elm.price / 100) * elm.discount.value;
      if (elm.discount.discount_type === "amount")
        return elm.price - elm.discount.value;
    }
    if (
      !elm?.discount &&
      elm?.sale_price &&
      Number(elm.sale_price) > 0 &&
      Number(elm.sale_price) < Number(elm.price)
    )
      return Number(elm.sale_price);
    return null;
  };

  const getItemSubtotal = (elm) => {
    const d = getDiscountedPrice(elm);
    return d !== null
      ? (d * elm.quantity).toFixed(2)
      : (elm.price * elm.quantity).toFixed(2);
  };

  const getProductLink = (elm) => {
    const cat = (elm.category_name || "").toLowerCase().replace(/\s+/g, "-");
    const sub = (elm.subcategory_name || "").toLowerCase().replace(/\s+/g, "-");
    const id  = elm.product_id || elm.id;
    if (cat && sub && id) return `/${locale}/shop/${cat}/${sub}/${id}`;
    return null;
  };

  const getProductImage = (elm) => {
    if (elm.image)
      return `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`;
    try {
      return `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`;
    } catch {
      return "/assets/images/general_product.png";
    }
  };

  const shippingLoaded =
    Array.isArray(shippingServiceCharges) &&
    shippingServiceCharges.length >= 2;

  const grandTotal = shippingLoaded
    ? (
        !freeShippingFlag
          ? parseFloat(shippingServiceCharges[0].price) +
            totalPrice +
            parseFloat(shippingServiceCharges[1].price)
          : totalPrice + parseFloat(shippingServiceCharges[1].price)
      ).toFixed(2)
    : totalPrice.toFixed(2);

  const vatAmount =
    shippingLoaded && vatTax?.percentage
      ? (
          !freeShippingFlag
            ? (parseFloat(shippingServiceCharges[0].price) -
                parseFloat(shippingServiceCharges[0].price) /
                  (1 + vatTax.percentage / 100)) +
              (totalPrice - totalPrice / (1 + vatTax.percentage / 100)) +
              (parseFloat(shippingServiceCharges[1].price) -
                parseFloat(shippingServiceCharges[1].price) /
                  (1 + vatTax.percentage / 100))
            : (totalPrice - totalPrice / (1 + vatTax.percentage / 100)) +
              (parseFloat(shippingServiceCharges[1].price) -
                parseFloat(shippingServiceCharges[1].price) /
                  (1 + vatTax.percentage / 100))
        ).toFixed(2)
      : null;

  return (
    <>
      {/* ── SEO/Nav breadcrumb row — sits above the full grid ────── */}
      {/* (B) "Continue Shopping" here — clear nav context, not competing with items */}
      <nav className="cc-cart-topnav" aria-label="Cart navigation">
        <ol className="cc-cart-topnav__breadcrumb">
          <li>
            <Link href={`/${locale}`}>Home</Link>
            <span aria-hidden="true"> / </span>
          </li>
          <li>
            <Link href={`/${locale}/shop`}>Shop</Link>
            <span aria-hidden="true"> / </span>
          </li>
          <li aria-current="page">Shopping Cart</li>
        </ol>
        <Link href={`/${locale}/shop`} className="cc-cart-topnav__continue" aria-label="Continue shopping">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Continue Shopping
        </Link>
      </nav>

      <div
        className="shopping-cart"
        style={{ minHeight: "calc(100vh - 300px)", paddingBottom: "70px" }}
      >
        {error && (
          <div className="cc-alert cc-alert--error mb-2">⚠️ {error}</div>
        )}

        {cartProducts.length ? (
          <>
            {/* ── Items column ─────────────────────────────────────── */}
            <div className="cart-table__wrapper">
              {/* SEO: semantic article list for cart items */}
              <article
                className="cc-cart-items-list"
                aria-label={`Shopping cart — ${cartProducts.length} item${cartProducts.length !== 1 ? "s" : ""}`}
              >
                {cartProducts.map((elm, i) => {
                  const disc    = getDiscountedPrice(elm);
                  const isGift  = !!elm.is_gift;
                  const pdpHref = getProductLink(elm);
                  const imgSrc  = getProductImage(elm);

                  return (
                    <div key={i} className="cc-cart-item">
                      {/* Thumbnail */}
                      <div className="cc-cart-item__image">
                        {pdpHref ? (
                          <Link href={pdpHref} aria-label={`View ${he.decode(elm.product_name || "")}`}>
                            <Image
                              src={imgSrc}
                              width={80}
                              height={80}
                              alt={he.decode(elm.product_name || "")}
                              loading="lazy"
                              style={{ objectFit: "cover", borderRadius: "6px" }}
                            />
                          </Link>
                        ) : (
                          <Image
                            src={imgSrc}
                            width={80}
                            height={80}
                            alt={he.decode(elm.product_name || "")}
                            loading="lazy"
                            style={{ objectFit: "cover", borderRadius: "6px" }}
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="cc-cart-item__body">
                        {pdpHref ? (
                          <Link
                            href={pdpHref}
                            className="cc-cart-item__name cc-cart-item__name--link"
                          >
                            {he.decode(elm.product_name || "")}
                          </Link>
                        ) : (
                          <p className="cc-cart-item__name">
                            {he.decode(elm.product_name || "")}
                          </p>
                        )}

                        {isGift && (
                          <span className="cc-gift-badge">🎁 Free Gift</span>
                        )}

                        <div className="cc-cart-item__price-row">
                          {disc !== null ? (
                            <>
                              <span className="cc-cart-item__price-old">
                                {currency.symbol}
                                {parseFloat(elm.price).toFixed(2)}
                              </span>
                              <span className="cc-cart-item__price-sale">
                                {currency.symbol}
                                {disc.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="cc-cart-item__price-regular">
                              {currency.symbol}
                              {parseFloat(elm.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {!isGift ? (
                          <div
                            className="cc-cart-item__qty-row"
                            role="group"
                            aria-label="Quantity"
                          >
                            <button
                              type="button"
                              className="cc-cart-item__qty-btn"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                setQuantity(
                                  elm.product_id,
                                  elm.quantity - 1,
                                  elm.product_qty,
                                  elm?.maximum_order_quantity
                                )
                              }
                            >
                              −
                            </button>
                            <span
                              className="cc-cart-item__qty-num"
                              aria-live="polite"
                            >
                              {elm.quantity}
                            </span>
                            <button
                              type="button"
                              className="cc-cart-item__qty-btn"
                              aria-label="Increase quantity"
                              onClick={() =>
                                setQuantity(
                                  elm.product_id,
                                  elm.quantity + 1,
                                  elm.product_qty,
                                  elm?.maximum_order_quantity
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#888" }}>
                            Qty: 1
                          </span>
                        )}

                        <span className="cc-cart-item__subtotal">
                          Subtotal:{" "}
                          <strong>
                            {currency.symbol}
                            {getItemSubtotal(elm)}
                          </strong>
                        </span>
                      </div>

                      {!isGift && (
                        <button
                          type="button"
                          className="cc-cart-item__remove"
                          aria-label={`Remove ${he.decode(elm.product_name || "")} from cart`}
                          onClick={() => removeItem(elm.product_id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </article>
            </div>

            {/* ── Order Summary sidebar ─────────────────────────────── */}
            <aside
              className="shopping-cart__totals-wrapper"
              aria-label="Order summary"
            >
              <div className="sticky-content">

                {/* Free-shipping progress bar — always visible above Summary card */}
                <div className="cc-cart-ship-bar" role="status" aria-live="polite">
                  {totalPrice < FREE_SHIPPING_THRESHOLD ? (
                    <>
                      <p className="cc-cart-ship-bar__text">
                        Add{" "}
                        <strong>
                          {remaining} {currency?.symbol}
                        </strong>{" "}
                        more for free shipping ✈
                      </p>
                      <div
                        className="cc-cart-ship-bar__track"
                        role="progressbar"
                        aria-valuenow={Math.round(progressPct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Free shipping progress"
                      >
                        <div
                          className="cc-cart-ship-bar__fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="cc-cart-ship-bar__text cc-cart-ship-bar__text--done">
                      🎉 You&apos;ve unlocked <strong>free shipping!</strong>
                    </p>
                  )}
                  <div className="cc-cart-ship-bar__notice">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Deliveries may take 8–10 days due to high demand
                  </div>
                </div>

                {/* Collapsible Order Summary card */}
                <section className="cc-order-summary-right" aria-label="Order summary details">
                  <div
                    className="cc-osr__header"
                    onClick={() => setSummaryOpen((v) => !v)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={summaryOpen}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSummaryOpen((v) => !v)
                    }
                  >
                    <span className="cc-osr__title">
                      {summaryOpen ? "Hide" : "Show"} Order Summary
                    </span>
                    <div className="cc-osr__header-right">
                      <span className="cc-osr__total-pill">
                        {grandTotal} {currency.symbol}
                      </span>
                      <svg
                        className={`cc-osr__chevron${summaryOpen ? " cc-osr__chevron--open" : ""}`}
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1l5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {summaryOpen && (
                    <div className="cc-osr__body">
                      <div className="cc-osr__col-heads">
                        <span>Product</span>
                        <span>Subtotal</span>
                      </div>

                      {cartProducts.map((elm, i) => {
                        const disc = getDiscountedPrice(elm);
                        return (
                          <div key={i} className="cc-osr__row">
                            <span className="cc-osr__product-name">
                              {he.decode(elm.product_name)}{" "}
                              <strong>×{elm.quantity}</strong>
                            </span>
                            <span className="cc-osr__product-price">
                              {disc !== null ? (
                                <>
                                  <span className="cc-price-old">
                                    {currency.symbol}
                                    {(elm.price * elm.quantity).toFixed(2)}
                                  </span>
                                  <span className="cc-price-sale">
                                    {currency.symbol}
                                    {(disc * elm.quantity).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="cc-price-regular">
                                  {currency.symbol}
                                  {(elm.price * elm.quantity).toFixed(2)}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      <div className="cc-osr__divider" />

                      <div className="cc-osr__row cc-osr__row--sub">
                        <span>Subtotal</span>
                        <span>
                          {totalPrice.toFixed(2)} {currency.symbol}
                        </span>
                      </div>
                      <div className="cc-osr__row cc-osr__row--sub">
                        <span>Shipping</span>
                        <span>
                          {freeShippingFlag ? (
                            <span className="cc-osr__free">🎉 Free</span>
                          ) : shippingLoaded ? (
                            `${shippingServiceCharges[0].price} ${currency.symbol}`
                          ) : (
                            "…"
                          )}
                        </span>
                      </div>

                      {couponData && (
                        <div className="cc-osr__row cc-osr__row--sub cc-osr__row--discount">
                          <span>Discount ({couponData.code})</span>
                          <span>
                            −{couponData.value}
                            {couponData.coupon_type === "percent"
                              ? "%"
                              : currency.symbol}
                          </span>
                        </div>
                      )}

                      <div className="cc-osr__divider" />

                      <div className="cc-osr__row cc-osr__row--total">
                        <span>Total</span>
                        <span>
                          {grandTotal} {currency.symbol}{" "}
                          <em>
                            (Incl. {vatAmount ?? "—"} {currency.symbol} VAT)
                          </em>
                        </span>
                      </div>

                      {/* (A) Stable Tabby widget — same pattern as TamaraWidget */}
                      <TabbyPromoWidget
                        price={parseFloat(grandTotal)}
                        currency="SAR"
                        lang={locale}
                        source="cart"
                      />

                      {/* Tamara widget */}
                      <TamaraWidget
                        inlineType="6"
                        inlineVariant="outlined"
                        locale={locale}
                      />
                    </div>
                  )}
                </section>

                {/* Promo code — identical to Checkout right sidebar */}
                <div className="cc-coupon-card">
                  {couponData ? (
                    <div className="cc-coupon-applied">
                      <span className="cc-coupon-applied__icon">🏷️</span>
                      <div className="cc-coupon-applied__text">
                        <span className="cc-coupon-applied__code">
                          {couponData.code}
                        </span>
                        <span className="cc-coupon-applied__desc">
                          {couponData.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="cc-coupon-applied__remove"
                        onClick={removeCoupon}
                        title="Remove coupon"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="cc-coupon-label-row">
                        <span className="cc-coupon-label-text">
                          Have a Promo Code?
                        </span>
                        <button
                          type="button"
                          className="cc-coupon-view-offers"
                          onClick={openCouponModal}
                        >
                          View Offers
                        </button>
                      </div>
                      <div className="cc-coupon-input-wrap">
                        <input
                          className="cc-coupon-input"
                          type="text"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={handleCouponChange}
                          onKeyDown={(e) =>
                            e.key === "Enter" && applyCoupon()
                          }
                          aria-label="Promo or coupon code"
                        />
                        <button
                          type="button"
                          className="cc-coupon-apply-btn"
                          onClick={applyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <div className="cc-coupon-msg cc-coupon-msg--err">
                          {couponError}
                        </div>
                      )}
                      {couponSuccess && (
                        <div className="cc-coupon-msg cc-coupon-msg--ok">
                          {couponSuccess}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Checkout CTA */}
                <Link
                  href={`/${locale}/shop-checkout`}
                  className="cc-btn-gold"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    marginTop: "1rem",
                  }}
                >
                  Proceed to Checkout
                </Link>

                {/* Trust badges — 2×2 grid, high-contrast */}
                <div
                  className="cc-trust-bar cc-trust-bar--cart"
                  aria-label="Shopping assurances"
                >
                  <div className="cc-trust-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Secure Payment
                  </div>
                  <div className="cc-trust-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <rect x="1" y="3" width="15" height="13"/>
                      <path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Free Ship 300+ SAR
                  </div>
                  <div className="cc-trust-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    VAT Included
                  </div>
                  <div className="cc-trust-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Authentic Guarantee
                  </div>
                </div>

                <p className="cc-totals-card__pay-note">
                  🔒 Visa · Mastercard · Mada · Tamara · Tabby
                </p>
              </div>
            </aside>

            {/* Full coupon modal — identical to Checkout */}
            {showCouponModal && (
              <div
                className="coupon-modal-overlay"
                onClick={() => setShowCouponModal(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Available coupons"
              >
                <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="coupon-header">
                    <h3>Available Coupons</h3>
                    <button className="close-btn" onClick={() => setShowCouponModal(false)} aria-label="Close">&times;</button>
                  </div>
                  {couponLoading ? (
                    <div className="coupon-loading">Loading…</div>
                  ) : !coupons.length ? (
                    <div className="coupon-empty">No coupons available right now.</div>
                  ) : (
                    <div className="coupon-body">
                      {coupons.map((c, idx) => {
                        const expired = isExpired(c.end_date);
                        const cid = c.id || `c-${idx}`;
                        return (
                          <div key={cid} className={`coupon-ticket${expired ? " expired" : ""}`}>
                            <div className="coupon-left">
                              <div className="coupon-title">{c.title || "Special Offer"}</div>
                              <div className="coupon-desc">{c.description || (c.coupon_type === "percent" ? `${c.value}% OFF` : `SAR ${c.value} OFF`)}</div>
                              <div className="coupon-validity">{expired ? `Expired: ${c.end_date?.slice(0,10)}` : `Valid until: ${c.end_date?.slice(0,10)}`}</div>
                            </div>
                            <div className="coupon-right">
                              <div className="coupon-code-box"><span className="coupon-code">{c.code}</span></div>
                              {!expired && (
                                <button
                                  className={`apply-btn${copiedId === cid ? " applied" : ""}`}
                                  onClick={() => handleSelectCoupon(c.code, cid)}
                                >
                                  {copiedId === cid ? "Applied!" : "Apply"}
                                </button>
                              )}
                              {expired && <div className="coupon-expired-badge">Expired</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            <style>{`
              .coupon-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999}
              .coupon-modal{background:#fff;border-radius:12px;width:480px;max-width:92%;box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden}
              .coupon-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #f0f0f0}
              .coupon-header h3{margin:0;font-size:18px;font-weight:600}
              .close-btn{background:none;border:none;font-size:22px;color:#888;cursor:pointer}
              .coupon-body{display:flex;flex-direction:column;gap:10px;padding:14px;max-height:55vh;overflow-y:auto}
              .coupon-ticket{display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
              .coupon-left{display:flex;flex-direction:column;gap:3px}
              .coupon-title{font-size:13px;font-weight:600;color:#222}
              .coupon-desc{font-size:11px;color:#666}
              .coupon-validity{font-size:10px;color:#aaa}
              .coupon-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
              .coupon-code{background:#f0fdf4;color:#198754;font-size:12px;font-weight:700;padding:3px 8px;border-radius:5px}
              .apply-btn{background:none;border:none;color:#b9a16b;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
              .apply-btn.applied{color:#2e7d32}
              .coupon-ticket.expired{opacity:.55}
              .coupon-expired-badge{font-size:10px;color:#e53935;font-weight:600}
              .coupon-loading,.coupon-empty{text-align:center;padding:28px;color:#888;font-size:13px}
            `}</style>
          </>
        ) : (
          <div className="cc-cart-empty">
            <div className="cc-cart-empty__icon" aria-hidden="true">
              🛍️
            </div>
            <h1 className="cc-cart-empty__title">Your bag is empty</h1>
            <p className="cc-cart-empty__sub">
              Add some fragrances to get started
            </p>
            <Link
              href={`/${locale}/shop`}
              className="cc-btn-gold"
              style={{
                width: "auto",
                padding: "0 2rem",
                textDecoration: "none",
              }}
            >
              Explore Products
            </Link>
          </div>
        )}

        <div className="cc-ymal-wrapper">
          <YouMayAlsoLike />
        </div>
      </div>
    </>
  );
}
