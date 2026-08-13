"use client";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import he from 'he';
import { useLocale } from "next-intl";
import { useMenu } from '../../context/MenuContext';

export default function CartDrawer() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  const { cartProducts, setCartProducts, totalPrice, couponDataContext } = useContextElement();
  const pathname = usePathname();

  const closeCart = () => {
    document.getElementById("cartDrawerOverlay")?.classList.remove("page-overlay_visible");
    document.getElementById("cartDrawer")?.classList.remove("aside_visible");
  };

  const setQuantity = (id, quantity, productQty, maxOrderQty) => {
    const MAX_LIMIT = maxOrderQty && maxOrderQty > 0 ? maxOrderQty : productQty;
    const withinStock = quantity >= 1 && quantity <= productQty;
    const withinLimit = quantity <= MAX_LIMIT;

    if (withinStock && withinLimit) {
      setError(null);
      const items = [...cartProducts];
      const paidItemIndex = items.findIndex((item) => item.product_id == id && !item.is_gift);
      if (paidItemIndex !== -1) items[paidItemIndex].quantity = quantity;
      const giftItemIndex = items.findIndex(
        (item) => item.product_id == id && item.is_gift && item.selection_rule != "least_expensive"
      );
      if (giftItemIndex !== -1) items[giftItemIndex].quantity = quantity;
      setCartProducts(items);
    } else {
      setError(!withinStock ? "Quantity exceeds available stock" : `Max allowed: ${MAX_LIMIT}`);
    }
  };

  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.product_id != id)]);
  };

  useEffect(() => { closeCart(); }, [pathname]);

  // Free shipping progress
  const freeShippingThreshold = 300;
  const progressPercentage = Math.min((totalPrice / freeShippingThreshold) * 100, 100);

  const getItemPrice = (elm) => {
    const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000));
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");

    if (elm?.discount) {
      if (new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        if (elm.discount.discount_type === "percent") {
          const salePrice = (elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2);
          return { unitPrice: salePrice, total: (salePrice * elm.quantity).toFixed(2), hasDiscount: true, originalPrice: elm.price };
        } else if (elm.discount.discount_type === "amount") {
          const salePrice = (elm.price - elm.discount.value).toFixed(2);
          return { unitPrice: salePrice, total: (salePrice * elm.quantity).toFixed(2), hasDiscount: true, originalPrice: elm.price };
        }
      }
    }
    if (elm?.coupon && !Array.isArray(elm.coupon) && couponDataContext?.code) {
      const couponKey = couponDataContext.code.toLowerCase();
      const coupon = elm.coupon[couponKey];
      if (coupon && new Date(current_date_time) >= new Date(coupon.start_date) && new Date(current_date_time) <= new Date(coupon.end_date) && coupon.code == couponKey) {
        const salePrice = ((elm.price - (elm.price / 100 * coupon.value)) * elm.quantity).toFixed(2);
        return { unitPrice: null, total: salePrice, hasDiscount: false, originalPrice: null };
      }
    }
    return { unitPrice: elm.price, total: (elm.price * elm.quantity).toFixed(2), hasDiscount: false, originalPrice: null };
  };

  const getProductImage = (elm) => {
    if (elm.image) return `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`;
    if (elm?.images) return `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`;
    return null;
  };

  return (
    <>
      <div className="aside aside_right overflow-hidden cart-drawer cd-new" id="cartDrawer">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="cd-header">
          <div className="cd-header__left">
            <svg className="cd-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <h3 className="cd-header__title">Your Bag</h3>
          </div>
          <div className="cd-header__right">
            <span className="cd-header__count">{cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'}</span>
            <button onClick={closeCart} className="cd-close-btn js-close-aside btn-close-aside" aria-label="Close cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Free Shipping Bar ───────────────────────────────────── */}
        <div className="cd-shipping-bar">
          {totalPrice < freeShippingThreshold ? (
            <>
              <p className="cd-shipping-bar__text">
                Add <strong>{(freeShippingThreshold - totalPrice).toFixed(2)} {currency?.symbol}</strong> more for free shipping ✈
              </p>
              <div className="cd-shipping-progress">
                <div className="cd-shipping-progress__fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </>
          ) : (
            <p className="cd-shipping-bar__text cd-shipping-bar__text--free">
              ✓ You qualify for <strong>free shipping!</strong>
            </p>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────────────── */}
        {error && <div className="cd-error">{error}</div>}

        {/* ── Items List ─────────────────────────────────────────── */}
        {cartProducts.length > 0 ? (
          <div className="cd-items">
            {cartProducts.map((elm, i) => {
              const priceInfo = getItemPrice(elm);
              const imgSrc = getProductImage(elm);
              return (
                <React.Fragment key={i}>
                  <div className="cd-item">
                    {/* Thumbnail */}
                    <div className="cd-item__img-wrap">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={he.decode(elm?.product_name || "product")}
                          width={80}
                          height={100}
                          className="cd-item__img"
                          style={{ objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="cd-item__img-placeholder" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="cd-item__info">
                      <p className="cd-item__name">{elm?.product_name && he.decode(elm.product_name)}</p>

                      {/* Price row */}
                      <div className="cd-item__price-row">
                        {priceInfo.hasDiscount ? (
                          <>
                            <span className="cd-item__price-old">{priceInfo.originalPrice} {currency?.symbol}</span>
                            <span className="cd-item__price-sale">{priceInfo.total} {currency?.symbol}</span>
                          </>
                        ) : (
                          <span className="cd-item__price">{priceInfo.total} {currency?.symbol}</span>
                        )}
                      </div>

                      {/* Qty control */}
                      {!elm.is_gift ? (
                        <div className="cd-qty">
                          <button
                            className="cd-qty__btn"
                            onClick={() => setQuantity(elm.product_id, elm.quantity - 1, elm.product_qty, elm?.maximum_order_quantity)}
                            disabled={elm.quantity <= 1}
                            aria-label="Decrease"
                            type="button"
                          >−</button>
                          <span className="cd-qty__num">{elm.quantity}</span>
                          <button
                            className="cd-qty__btn"
                            onClick={() => setQuantity(elm.product_id, elm.quantity + 1, elm.product_qty, elm?.maximum_order_quantity)}
                            aria-label="Increase"
                            type="button"
                          >+</button>
                        </div>
                      ) : (
                        <span className="cd-item__gift-badge">🎁 Free Gift</span>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      className="cd-item__remove"
                      onClick={() => removeItem(elm.product_id)}
                      aria-label="Remove item"
                      type="button"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="cd-empty">
            <div className="cd-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c5a05a" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <p className="cd-empty__title">Your bag is empty</p>
            <p className="cd-empty__sub">Discover our exclusive fragrances</p>
            <Link href={`/${locale}/shop`} className="cd-btn cd-btn--gold" onClick={closeCart}>
              Explore Collection
            </Link>
          </div>
        )}

        {/* ── Footer Actions ──────────────────────────────────────── */}
        {cartProducts.length > 0 && (
          <div className="cd-footer">
            {/* Delivery notice */}
            <div className="cd-notice">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c5a05a" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Deliveries may take 8–10 days due to high demand</span>
            </div>

            {/* Subtotal */}
            <div className="cd-subtotal">
              <span className="cd-subtotal__label">Subtotal</span>
              <span className="cd-subtotal__value">{totalPrice.toFixed(2)} {currency?.symbol}</span>
            </div>
            <p className="cd-subtotal__vat">Includes VAT · Shipping calculated at checkout</p>

            {/* CTAs */}
            <div className="cd-ctas">
              <Link href={`/${locale}/shop-cart`} className="cd-btn cd-btn--outline" onClick={closeCart}>
                View Cart
              </Link>
              <Link href={`/${locale}/shop-checkout`} className="cd-btn cd-btn--gold" onClick={closeCart}>
                Checkout
              </Link>
            </div>

            {/* Payment methods note */}
            <p className="cd-payment-note">
              🔒 Secure checkout · Visa · Mastercard · mada · Tamara · Tabby
            </p>
          </div>
        )}
      </div>

      <div id="cartDrawerOverlay" onClick={closeCart} className="page-overlay" />
    </>
  );
}
