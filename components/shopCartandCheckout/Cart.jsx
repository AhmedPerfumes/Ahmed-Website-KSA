"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useMenu } from '../../context/MenuContext';
import Pagination1 from "../common/Pagination1";
import TamaraWidget from "../TamaraWidget";
import dynamic from "next/dynamic";
import he from "he";

/**
 * Cart.jsx — Full Cart Page
 *
 * UX changes (round 2):
 *  A  Shipping bar moved to INSIDE the Order Summary sidebar (below subtotal row)
 *  B  Order Summary sidebar is collapsible — same cc-osr pattern as Checkout
 *  C  Promo / Coupon Code uses cc-promo-mobile collapsible design (exactly like Checkout)
 */

const YouMayAlsoLike = dynamic(() => import("@/components/cart/YouMayAlsoLike"), { ssr: false });

const FREE_SHIPPING_THRESHOLD = 300;

export default function Cart() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);

  // (B) collapsible order summary — starts OPEN on cart page
  const [summaryOpen, setSummaryOpen] = useState(true);

  // (C) collapsible coupon panel — same as Checkout
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponData, setCouponData] = useState(null); // applied coupon object

  const { cartProducts, setCartProducts, totalPrice, freeShippingFlag, setCouponDataContext, removeGiftFromCart } = useContextElement();

  // (A) free-shipping progress
  const progressPct = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = (FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2);

  useEffect(() => {
    setCouponDataContext(null);
    removeGiftFromCart();
    if (typeof window !== "undefined" && window.AhmedTracker) {
      const items = cartProducts || [];
      const total = items.reduce((acc, item) => acc + parseFloat(item.sale_price || item.price || 0) * Number(item.quantity || 1), 0);
      window.AhmedTracker.track("view_cart", {
        total: parseFloat(total.toFixed(2)),
        items_count: items.length,
        items: items.map(item => ({
          product_id: (item.product_id || item.id)?.toString(),
          product_name: item.product_name || "",
          price: parseFloat(item.sale_price || item.price || 0),
          quantity: Number(item.quantity || 1),
        })),
      });
    }
  }, []);

  // Tabby script
  useEffect(() => {
    const scriptId = "tabby-promo-script-cart";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.src = "https://checkout.tabby.ai/tabby-promo.js";
      s.id = scriptId;
      s.async = true;
      document.body.appendChild(s);
    }
    setCouponDataContext(null);
    return () => {
      const el = document.getElementById(scriptId);
      if (el) document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const renderTabby = () => {
      if (window.TabbyPromo && typeof window.TabbyPromo === "function") {
        try {
          new window.TabbyPromo({
            selector: "#cart-tabby-promo",
            currency: "SAR",
            price: grandTotal,
            lang: locale,
            source: "cart",
            publicKey: "pk_test_019228fd-8e52-3ecd-f813-bf11dc8e2118",
            merchantCode: "assaaste",
          });
        } catch (_) {}
      }
    };
    const t = setTimeout(renderTabby, 600);
    return () => clearTimeout(t);
  }, [totalPrice, locale]);

  const setQuantity = (id, quantity, productQty, maxOrderQty) => {
    const MAX = maxOrderQty && maxOrderQty > 0 ? maxOrderQty : productQty;
    if (quantity >= 1 && quantity <= productQty && quantity <= MAX) {
      setError(null);
      setCartProducts(cartProducts.map(elm => elm.product_id === id ? { ...elm, quantity } : elm));
    } else {
      setError(quantity < 1 ? "Minimum quantity is 1" : `Maximum allowed quantity is ${MAX}`);
    }
  };

  const removeItem = id => setCartProducts(cartProducts.filter(elm => elm.product_id !== id));

  // (C) coupon handlers — wire to real API when ready
  const handleCouponChange = e => {
    setCouponCode(e.target.value);
    setCouponError(null);
    setCouponSuccess(null);
  };

  const applyCoupon = useCallback(() => {
    if (!couponCode.trim()) return;
    // TODO: replace with real coupon API call
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

  const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

  const getDiscountedPrice = elm => {
    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type === "percent") return elm.price - elm.price / 100 * elm.discount.value;
      if (elm.discount.discount_type === "amount")  return elm.price - elm.discount.value;
    }
    if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < Number(elm.price)) return Number(elm.sale_price);
    return null;
  };

  const getItemSubtotal = elm => {
    const d = getDiscountedPrice(elm);
    return d !== null ? (d * elm.quantity).toFixed(2) : (elm.price * elm.quantity).toFixed(2);
  };

  const getProductLink = elm => {
    const cat = (elm.category_name || "").toLowerCase().replace(/\s+/g, "-");
    const sub = (elm.subcategory_name || "").toLowerCase().replace(/\s+/g, "-");
    const id  = elm.product_id || elm.id;
    if (cat && sub && id) return `/${locale}/shop/${cat}/${sub}/${id}`;
    return null;
  };

  const getProductImage = elm => {
    if (elm.image) return `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`;
    try { return `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`; }
    catch { return "/assets/images/general_product.png"; }
  };

  const shippingLoaded = Array.isArray(shippingServiceCharges) && shippingServiceCharges.length >= 2;
  const grandTotal = shippingLoaded
    ? (!freeShippingFlag
        ? (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)
        : (totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2))
    : totalPrice.toFixed(2);
  const vatAmount = shippingLoaded && vatTax?.percentage
    ? (!freeShippingFlag
        ? ((parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + vatTax.percentage / 100)) + (totalPrice - totalPrice / (1 + vatTax.percentage / 100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage / 100))).toFixed(2)
        : ((totalPrice - totalPrice / (1 + vatTax.percentage / 100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage / 100))).toFixed(2))
    : null;

  return (
    <div className="shopping-cart" style={{ minHeight: "calc(100vh - 300px)", paddingBottom: "70px" }}>

      {error && <div className="cc-alert cc-alert--error mb-2">⚠️ {error}</div>}

      {cartProducts.length ? (
        <>
          {/* Items list — left column on desktop */}
          <div className="cart-table__wrapper">
            <div className="cc-cart-items-list">

              {/* Continue Shopping */}
              <div className="cc-cart-continue">
                <Link href={`/${locale}/shop`} className="cc-cart-continue__link">
                  ← Continue Shopping
                </Link>
              </div>

              {cartProducts.map((elm, i) => {
                const disc    = getDiscountedPrice(elm);
                const isGift  = !!elm.is_gift;
                const pdpHref = getProductLink(elm);
                const imgSrc  = getProductImage(elm);

                return (
                  <div key={i} className="cc-cart-item">
                    <div className="cc-cart-item__image">
                      {pdpHref ? (
                        <Link href={pdpHref}>
                          <Image src={imgSrc} width={80} height={80}
                            alt={he.decode(elm.product_name || "")} loading="lazy"
                            style={{ objectFit: "cover", borderRadius: "6px" }} />
                        </Link>
                      ) : (
                        <Image src={imgSrc} width={80} height={80}
                          alt={he.decode(elm.product_name || "")} loading="lazy"
                          style={{ objectFit: "cover", borderRadius: "6px" }} />
                      )}
                    </div>

                    <div className="cc-cart-item__body">
                      {pdpHref ? (
                        <Link href={pdpHref} className="cc-cart-item__name cc-cart-item__name--link">
                          {he.decode(elm.product_name || "")}
                        </Link>
                      ) : (
                        <p className="cc-cart-item__name">{he.decode(elm.product_name || "")}</p>
                      )}

                      {isGift && <span className="cc-gift-badge">🎁 Free Gift</span>}

                      <div className="cc-cart-item__price-row">
                        {disc !== null ? (
                          <>
                            <span className="cc-cart-item__price-old">{currency.symbol}{parseFloat(elm.price).toFixed(2)}</span>
                            <span className="cc-cart-item__price-sale">{currency.symbol}{disc.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="cc-cart-item__price-regular">{currency.symbol}{parseFloat(elm.price).toFixed(2)}</span>
                        )}
                      </div>

                      {!isGift ? (
                        <div className="cc-cart-item__qty-row">
                          <button type="button" className="cc-cart-item__qty-btn" aria-label="Decrease"
                            onClick={() => setQuantity(elm.product_id, elm.quantity - 1, elm.product_qty, elm?.maximum_order_quantity)}>−</button>
                          <span className="cc-cart-item__qty-num">{elm.quantity}</span>
                          <button type="button" className="cc-cart-item__qty-btn" aria-label="Increase"
                            onClick={() => setQuantity(elm.product_id, elm.quantity + 1, elm.product_qty, elm?.maximum_order_quantity)}>+</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "#888" }}>Qty: 1</span>
                      )}

                      <span className="cc-cart-item__subtotal">
                        Subtotal: <strong>{currency.symbol}{getItemSubtotal(elm)}</strong>
                      </span>
                    </div>

                    {!isGift && (
                      <button type="button" className="cc-cart-item__remove" aria-label="Remove item"
                        onClick={() => removeItem(elm.product_id)}>
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Order Summary sidebar ─────────────────────────────── */}
          <div className="shopping-cart__totals-wrapper">
            <div className="sticky-content">

              {/* (B) Collapsible Order Summary — cc-osr pattern from Checkout */}
              <div className="cc-order-summary-right">
                <div
                  className="cc-osr__header"
                  onClick={() => setSummaryOpen(v => !v)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setSummaryOpen(v => !v)}
                >
                  <span className="cc-osr__title">
                    {summaryOpen ? "Hide" : "Show"} Order Summary
                  </span>
                  <div className="cc-osr__header-right">
                    <span className="cc-osr__total-pill">{grandTotal} {currency.symbol}</span>
                    <svg className={`cc-osr__chevron${summaryOpen ? " cc-osr__chevron--open" : ""}`}
                      width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {summaryOpen && (
                  <div className="cc-osr__body">
                    {/* Column headers */}
                    <div className="cc-osr__col-heads">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>

                    {/* Line items */}
                    {cartProducts.map((elm, i) => {
                      const disc = getDiscountedPrice(elm);
                      return (
                        <div key={i} className="cc-osr__row">
                          <span className="cc-osr__product-name">
                            {he.decode(elm.product_name)} <strong>×{elm.quantity}</strong>
                          </span>
                          <span className="cc-osr__product-price">
                            {disc !== null ? (
                              <>
                                <span className="cc-price-old">{currency.symbol}{(elm.price * elm.quantity).toFixed(2)}</span>
                                <span className="cc-price-sale">{currency.symbol}{(disc * elm.quantity).toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="cc-price-regular">{currency.symbol}{(elm.price * elm.quantity).toFixed(2)}</span>
                            )}
                          </span>
                        </div>
                      );
                    })}

                    <div className="cc-osr__divider" />

                    {/* Subtotal / Shipping / Discount / Total rows */}
                    <div className="cc-osr__row cc-osr__row--sub">
                      <span>Subtotal</span>
                      <span>{totalPrice.toFixed(2)} {currency.symbol}</span>
                    </div>
                    <div className="cc-osr__row cc-osr__row--sub">
                      <span>Shipping</span>
                      <span>
                        {freeShippingFlag
                          ? <span className="cc-osr__free">🎉 Free</span>
                          : shippingLoaded ? `${shippingServiceCharges[0].price} ${currency.symbol}` : "…"}
                      </span>
                    </div>

                    {couponData && (
                      <div className="cc-osr__row cc-osr__row--sub cc-osr__row--discount">
                        <span>Discount ({couponData.code})</span>
                        <span>−{couponData.value}{couponData.coupon_type === "percent" ? "%" : currency.symbol}</span>
                      </div>
                    )}

                    <div className="cc-osr__divider" />

                    <div className="cc-osr__row cc-osr__row--total">
                      <span>Total</span>
                      <span>{grandTotal} {currency.symbol} <em>(Incl. {vatAmount ?? "—"} {currency.symbol} VAT)</em></span>
                    </div>

                    {/* (A) Free-shipping progress bar — lives inside Order Summary */}
                    <div className="cc-osr__ship-bar">
                      {totalPrice < FREE_SHIPPING_THRESHOLD ? (
                        <>
                          <p className="cc-osr__ship-bar__text">
                            Add <strong>{remaining} {currency?.symbol}</strong> more for free shipping ✈
                          </p>
                          <div className="cc-osr__ship-bar__track">
                            <div className="cc-osr__ship-bar__fill" style={{ width: `${progressPct}%` }} />
                          </div>
                        </>
                      ) : (
                        <p className="cc-osr__ship-bar__text cc-osr__ship-bar__text--done">
                          🎉 You've unlocked <strong>free shipping!</strong>
                        </p>
                      )}
                      <div className="cc-osr__ship-bar__notice">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c5a05a" strokeWidth="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Deliveries may take 8–10 days due to high demand
                      </div>
                    </div>

                    {/* Tabby widget */}
                    <div id="cart-tabby-promo" style={{ minHeight: 0, marginTop: "0.5rem" }} />

                    {/* Tamara widget */}
                    <TamaraWidget inlineType="6" inlineVariant="outlined" locale={locale} />
                  </div>
                )}
              </div>

              {/* (C) Promo code — cc-coupon-card pattern identical to Checkout */}
              <div className="cc-coupon-card">
                {couponData ? (
                  /* Applied state */
                  <div className="cc-coupon-applied">
                    <span className="cc-coupon-applied__icon">🏷️</span>
                    <div className="cc-coupon-applied__text">
                      <span className="cc-coupon-applied__code">{couponData.code}</span>
                      <span className="cc-coupon-applied__desc">{couponData.title}</span>
                    </div>
                    <button type="button" className="cc-coupon-applied__remove" onClick={removeCoupon} title="Remove coupon">&times;</button>
                  </div>
                ) : (
                  /* Collapsible input — cc-promo-mobile from Checkout */
                  <div className="cc-promo-mobile">
                    <button
                      type="button"
                      className="cc-promo-mobile__toggle"
                      onClick={() => setShowCouponPanel(v => !v)}
                      aria-expanded={showCouponPanel}
                    >
                      <span className="cc-promo-mobile__toggle-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }} aria-hidden="true">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        Have a Promo Code?
                      </span>
                      <svg
                        className={`cc-promo-mobile__chevron${showCouponPanel ? " open" : ""}`}
                        width="12" height="12" viewBox="0 0 10 6" fill="none" aria-hidden="true"
                      >
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>

                    {showCouponPanel && (
                      <div className="cc-promo-mobile__body">
                        <div className="cc-coupon-label-row" style={{ marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "#888" }}>Enter your code below</span>
                        </div>
                        <div className="cc-coupon-input-wrap">
                          <input
                            className="cc-coupon-input"
                            type="text"
                            placeholder="Promo / Coupon code"
                            value={couponCode}
                            onChange={handleCouponChange}
                            onKeyDown={e => e.key === "Enter" && applyCoupon()}
                            autoFocus
                          />
                          <button type="button" className="cc-coupon-apply-btn" onClick={applyCoupon}>
                            Apply
                          </button>
                        </div>
                        {couponError   && <div className="cc-coupon-msg cc-coupon-msg--err" style={{ marginTop: "0.4rem" }}>{couponError}</div>}
                        {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok"  style={{ marginTop: "0.4rem" }}>{couponSuccess}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <Link
                href={`/${locale}/shop-checkout`}
                className="cc-btn-gold"
                style={{ textDecoration: "none", display: "flex", marginTop: "1rem" }}
              >
                Proceed to Checkout
              </Link>

              {/* Trust badges */}
              <div className="cc-trust-bar cc-trust-bar--cart">
                <div className="cc-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Secure Payment
                </div>
                <div className="cc-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Free Ship 300+ SAR
                </div>
                <div className="cc-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  VAT Included
                </div>
                <div className="cc-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Authentic Guarantee
                </div>
              </div>

              <p className="cc-totals-card__pay-note">
                🔒 Visa · Mastercard · Mada · Tamara · Tabby
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="cc-cart-empty">
          <div className="cc-cart-empty__icon">🛍️</div>
          <h2 className="cc-cart-empty__title">Your bag is empty</h2>
          <p className="cc-cart-empty__sub">Add some fragrances to get started</p>
          <Link href={`/${locale}/shop`} className="cc-btn-gold"
            style={{ width: "auto", padding: "0 2rem", textDecoration: "none" }}>
            Explore Products
          </Link>
        </div>
      )}

      <div className="cc-ymal-wrapper">
        <YouMayAlsoLike />
      </div>
    </div>
  );
}
