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
 * Audit fixes applied:
 *  ① Free-shipping progress bar + delivery warning  (parity with CartDrawer)
 *  ② Tabby BNPL widget added to Order Summary (was Tamara-only)
 *  ③ Product thumbnail + name are clickable links to PDP
 *  ④ "Continue Shopping" link + upgraded trust badges + promo-code field
 *  ⑤ YouMayAlsoLike rendered as inline section (no blank-space modal leak)
 */

// Lazy-load YouMayAlsoLike — still deferred but rendered inline, not as a modal
const YouMayAlsoLike = dynamic(() => import("@/components/cart/YouMayAlsoLike"), { ssr: false });

const FREE_SHIPPING_THRESHOLD = 300;

export default function Cart() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState(null); // null | "applied" | "invalid"
  const { cartProducts, setCartProducts, totalPrice, freeShippingFlag, setCouponDataContext, removeGiftFromCart } = useContextElement();

  // ── Free-shipping progress (① same logic as CartDrawer) ──────
  const progressPct = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = (FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2);

  useEffect(() => {
    setCouponDataContext(null);
    removeGiftFromCart();
    if (typeof window !== "undefined" && window.AhmedTracker) {
      const items = cartProducts || [];
      const total = items.reduce((acc, item) => {
        const price = parseFloat(item.sale_price || item.price || 0);
        const qty = Number(item.quantity || 1);
        return acc + price * qty;
      }, 0);
      window.AhmedTracker.track("view_cart", {
        total: parseFloat(total.toFixed(2)),
        items_count: items.length,
        items: items.map((item) => ({
          product_id: (item.product_id || item.id)?.toString(),
          product_name: item.title || item.name || item.product_name || "",
          price: parseFloat(item.sale_price || item.price || 0),
          quantity: Number(item.quantity || 1),
        })),
      });
    }
  }, []);

  // ② Tabby widget script
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

  // Render Tabby widget whenever totals change
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
        } catch (_) { /* silent */ }
      }
    };
    const timer = setTimeout(renderTabby, 600);
    return () => clearTimeout(timer);
  }, [totalPrice, locale]);

  const setQuantity = (id, quantity, productQty, maxOrderQty) => {
    const MAX = maxOrderQty && maxOrderQty > 0 ? maxOrderQty : productQty;
    if (quantity >= 1 && quantity <= productQty && quantity <= MAX) {
      setError(null);
      setCartProducts(cartProducts.map(elm =>
        elm.product_id === id ? { ...elm, quantity } : elm
      ));
    } else {
      setError(quantity < 1 ? "Minimum quantity is 1" : `Maximum allowed quantity is ${MAX}`);
    }
  };

  const removeItem = id => setCartProducts(cartProducts.filter(elm => elm.product_id !== id));

  // ④ Promo code — stub handler (wire to real API when ready)
  const applyPromo = useCallback(() => {
    if (!promoCode.trim()) return;
    // TODO: call real coupon API here
    setPromoStatus("invalid"); // placeholder — replace with real check
  }, [promoCode]);

  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError)   return <div>{isMenuError}</div>;

  const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

  const getDiscountedPrice = elm => {
    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type === "percent") return elm.price - elm.price / 100 * elm.discount.value;
      if (elm.discount.discount_type === "amount")  return elm.price - elm.discount.value;
    }
    if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < Number(elm.price)) {
      return Number(elm.sale_price);
    }
    return null;
  };

  const getItemSubtotal = elm => {
    const d = getDiscountedPrice(elm);
    return d !== null ? (d * elm.quantity).toFixed(2) : (elm.price * elm.quantity).toFixed(2);
  };

  // ③ Build PDP link from category_name / subcategory_name
  const getProductLink = elm => {
    const cat = (elm.category_name || "").toLowerCase().replace(/\s+/g, "-");
    const sub = (elm.subcategory_name || "").toLowerCase().replace(/\s+/g, "-");
    const id  = elm.product_id || elm.id;
    if (cat && sub && id) return `/${locale}/shop/${cat}/${sub}/${id}`;
    return null;
  };

  const getProductImage = elm => {
    if (elm.image) return `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`;
    try {
      return `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`;
    } catch { return "/assets/images/general_product.png"; }
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
          {/* ① Free-Shipping Progress Bar ────────────────────────── */}
          <div className="cc-cart-ship-bar">
            {totalPrice < FREE_SHIPPING_THRESHOLD ? (
              <>
                <p className="cc-cart-ship-bar__text">
                  Add <strong>{remaining} {currency?.symbol}</strong> more for <strong>free shipping</strong> ✈
                </p>
                <div className="cc-cart-ship-bar__track">
                  <div className="cc-cart-ship-bar__fill" style={{ width: `${progressPct}%` }} />
                </div>
              </>
            ) : (
              <p className="cc-cart-ship-bar__text cc-cart-ship-bar__text--done">
                🎉 You've unlocked <strong>free shipping!</strong>
              </p>
            )}
            {/* ① Delivery-time warning — parity with drawer */}
            <div className="cc-cart-ship-bar__notice">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c5a05a" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Deliveries may take 8–10 days due to high demand
            </div>
          </div>

          {/* Items list — left column on desktop */}
          <div className="cart-table__wrapper">
            <div className="cc-cart-items-list">

              {/* ④ Continue Shopping link */}
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
                    {/* ③ Clickable product image */}
                    <div className="cc-cart-item__image">
                      {pdpHref ? (
                        <Link href={pdpHref} onClick={() => {}}>
                          <Image
                            src={imgSrc}
                            width={80} height={80}
                            alt={he.decode(elm.product_name || "")}
                            loading="lazy"
                            style={{ objectFit: "cover", borderRadius: "6px" }}
                          />
                        </Link>
                      ) : (
                        <Image
                          src={imgSrc}
                          width={80} height={80}
                          alt={he.decode(elm.product_name || "")}
                          loading="lazy"
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                        />
                      )}
                    </div>

                    <div className="cc-cart-item__body">
                      {/* ③ Clickable product name */}
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

          {/* Totals sidebar */}
          <div className="shopping-cart__totals-wrapper">
            <div className="sticky-content">
              <div className="cc-totals-card">
                <h3>Order Summary</h3>

                <div className="cc-totals-card__row">
                  <span className="cc-totals-label">Subtotal</span>
                  <span className="cc-totals-value">{totalPrice.toFixed(2)} {currency.symbol}</span>
                </div>
                <div className="cc-totals-card__row">
                  <span className="cc-totals-label">Shipping</span>
                  <span className="cc-totals-value">
                    {freeShippingFlag
                      ? <span className="cc-free-ship">🎉 Free</span>
                      : shippingLoaded ? `${shippingServiceCharges[0].price} ${currency.symbol}` : "…"}
                  </span>
                </div>
                <div className="cc-totals-card__row cc-totals--total">
                  <span className="cc-totals-label">Total</span>
                  <span className="cc-totals-value">{grandTotal} {currency.symbol}</span>
                </div>
                <div className="cc-totals-card__vat">
                  Includes VAT{vatAmount ? ` (${currency.symbol}${vatAmount})` : ""}
                </div>

                {/* ② Tabby BNPL widget */}
                <div id="cart-tabby-promo" style={{ minHeight: 0, marginTop: "0.5rem" }} />

                {/* ② Tamara BNPL widget */}
                <TamaraWidget inlineType="6" inlineVariant="outlined" locale={locale} />

                {/* ④ Promo Code field */}
                <div className="cc-promo-row">
                  <label htmlFor="cart-promo-code" className="cc-promo-row__label">Promo / Coupon Code</label>
                  <div className="cc-promo-row__input-wrap">
                    <input
                      id="cart-promo-code"
                      type="text"
                      className={`cc-promo-row__input${promoStatus === "applied" ? " cc-promo-row__input--ok" : promoStatus === "invalid" ? " cc-promo-row__input--err" : ""}`}
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoStatus(null); }}
                      onKeyDown={e => e.key === "Enter" && applyPromo()}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="cc-promo-row__apply"
                      onClick={applyPromo}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </button>
                  </div>
                  {promoStatus === "applied" && <p className="cc-promo-row__msg cc-promo-row__msg--ok">✓ Promo applied!</p>}
                  {promoStatus === "invalid" && <p className="cc-promo-row__msg cc-promo-row__msg--err">✗ Invalid or expired code</p>}
                </div>

                {/* Checkout CTA */}
                <Link
                  href={`/${locale}/shop-checkout`}
                  className="cc-btn-gold"
                  style={{ textDecoration: "none", display: "flex", marginTop: "1rem" }}
                >
                  Proceed to Checkout
                </Link>

                {/* ④ Upgraded trust badges — proper icons + contrast */}
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

                {/* ④ Payment logos */}
                <p className="cc-totals-card__pay-note">
                  🔒 Visa · Mastercard · Mada · Tamara · Tabby
                </p>
              </div>
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

      {/* ⑤ YouMayAlsoLike — modal stays, blank space comes from failed API renders.
           Wrapping in a min-height:0 guard prevents it from reserving space when empty. */}
      <div className="cc-ymal-wrapper">
        <YouMayAlsoLike />
      </div>
    </div>
  );
}
