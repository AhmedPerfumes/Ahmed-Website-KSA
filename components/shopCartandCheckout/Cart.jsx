"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useMenu } from '../../context/MenuContext';
import Pagination1 from "../common/Pagination1";
import TamaraWidget from "../TamaraWidget";
import dynamic from "next/dynamic";
const YouMayAlsoLike = dynamic(() => import("@/components/cart/YouMayAlsoLike"), { ssr: false });

export default function Cart() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  const { cartProducts, setCartProducts, totalPrice, freeShippingFlag, setCouponDataContext, removeGiftFromCart } = useContextElement();

  useEffect(() => {
    setCouponDataContext(null);
    removeGiftFromCart();
  }, []);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.tabby.ai/tabby-promo.js';
    s.async = true;
    document.body.appendChild(s);
    setCouponDataContext(null);
    return () => { document.body.removeChild(s); };
  }, []);

  const setQuantity = (id, quantity, productQty, maxOrderQty) => {
    const MAX = maxOrderQty && maxOrderQty > 0 ? maxOrderQty : productQty;
    if (quantity >= 1 && quantity <= productQty && quantity <= MAX) {
      setError(null);
      setCartProducts(cartProducts.map(elm =>
        elm.product_id === id ? { ...elm, quantity } : elm
      ));
    } else {
      setError(quantity < 1 ? 'Minimum quantity is 1' : `Maximum allowed quantity is ${MAX}`);
    }
  };

  const removeItem = id => setCartProducts(cartProducts.filter(elm => elm.product_id !== id));

  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError)   return <div>{isMenuError}</div>;

  const now = new Date(new Date().getTime() + 4*60*60*1000).toISOString().slice(0,19).replace('T',' ');


  const getDiscountedPrice = elm => {
    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type === 'percent') return elm.price - elm.price/100*elm.discount.value;
      if (elm.discount.discount_type === 'amount')  return elm.price - elm.discount.value;
    }
    // Legacy flat sale_price field
    if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < Number(elm.price)) {
      return Number(elm.sale_price);
    }
    return null;
  };

  const getItemSubtotal = elm => {
    const d = getDiscountedPrice(elm);
    return d !== null ? (d * elm.quantity).toFixed(2) : (elm.price * elm.quantity).toFixed(2);
  };

  const shippingLoaded = Array.isArray(shippingServiceCharges) && shippingServiceCharges.length >= 2;
  const grandTotal = shippingLoaded
    ? (!freeShippingFlag
        ? (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)
        : (totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2))
    : totalPrice.toFixed(2);
  const vatAmount = shippingLoaded && vatTax?.percentage
    ? (!freeShippingFlag
        ? ((parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + vatTax.percentage/100)) + (totalPrice - totalPrice / (1 + vatTax.percentage/100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage/100))).toFixed(2)
        : ((totalPrice - totalPrice / (1 + vatTax.percentage/100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage/100))).toFixed(2))
    : null;

  return (
    <>
    <div className="shopping-cart" style={{ minHeight: 'calc(100vh - 300px)', paddingBottom: '70px' }}>

      {error && <div className="cc-alert cc-alert--error mb-2">⚠️ {error}</div>}

      {cartProducts.length ? (
        <>
          {/* Items list — left column on desktop */}
          <div className="cart-table__wrapper">
            <div className="cc-cart-items-list">
              {cartProducts.map((elm, i) => {
                const disc = getDiscountedPrice(elm);
                const isGift = !!elm.is_gift;
                return (
                  <div key={i} className="cc-cart-item">
                    <div className="cc-cart-item__image">
                      <Image
                        src={elm.image
                          ? `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`
                          : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                        width={72} height={72} alt={elm.product_name} loading="lazy"
                        style={{objectFit:'cover'}}
                      />
                    </div>
                    <div className="cc-cart-item__body">
                      <p className="cc-cart-item__name">{elm.product_name}</p>
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
                            onClick={() => setQuantity(elm.product_id, elm.quantity-1, elm.product_qty, elm?.maximum_order_quantity)}>−</button>
                          <span className="cc-cart-item__qty-num">{elm.quantity}</span>
                          <button type="button" className="cc-cart-item__qty-btn" aria-label="Increase"
                            onClick={() => setQuantity(elm.product_id, elm.quantity+1, elm.product_qty, elm?.maximum_order_quantity)}>+</button>
                        </div>
                      ) : (
                        <span style={{fontSize:'0.72rem',color:'#888'}}>Qty: 1</span>
                      )}
                      <span className="cc-cart-item__subtotal">
                        Subtotal: <strong>{currency.symbol}{getItemSubtotal(elm)}</strong>
                      </span>
                    </div>
                    {!isGift && (
                      <button type="button" className="cc-cart-item__remove" aria-label="Remove item" onClick={() => removeItem(elm.product_id)}>
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
                  <span className="cc-totals-value">{totalPrice.toFixed(2)}{currency.symbol}</span>
                </div>
                <div className="cc-totals-card__row">
                  <span className="cc-totals-label">Shipping</span>
                  <span className="cc-totals-value">
                    {freeShippingFlag
                      ? <span className="cc-free-ship">🎉 Free</span>
                      : shippingLoaded ? `${shippingServiceCharges[0].price}${currency.symbol}` : '…'}
                  </span>
                </div>
                <div className="cc-totals-card__row cc-totals--total">
                  <span className="cc-totals-label">Total</span>
                  <span className="cc-totals-value">{grandTotal}{currency.symbol}</span>
                </div>
                <div style={{fontSize:'0.68rem',color:'#bbb',textAlign:'center',margin:'0.25rem 0 0.75rem'}}>
                  Includes VAT{vatAmount ? ` (${currency.symbol}${vatAmount})` : ''}
                </div>

                <TamaraWidget inlineType="6" inlineVariant='outlined' locale={locale}/>

                {/* Checkout CTA — below Tamara widget */}
                <Link
                  href={`/${locale}/shop-checkout`}
                  className="cc-btn-gold"
                  style={{ textDecoration: 'none', display: 'flex', marginTop: '1rem' }}
                >
                  Proceed to Checkout
                </Link>

                <div className="cc-trust-bar">
                  <span className="cc-trust-item">🔒 Secure</span>
                  <span className="cc-trust-item">📦 Free ship 300+ SAR</span>
                  <span className="cc-trust-item">✅ VAT incl.</span>
                </div>
              </div>
            </div>
          </div>

        </>
      ) : (
        <div className="cc-cart-empty">
          <div className="cc-cart-empty__icon">🛍️</div>
          <h2 className="cc-cart-empty__title">Your bag is empty</h2>
          <p className="cc-cart-empty__sub">Add some fragrances to get started</p>
          <Link href={`/${locale}/shop`} className="cc-btn-gold" style={{width:'auto',padding:'0 2rem',textDecoration:'none'}}>
            Explore Products
          </Link>
        </div>
      )}
    </div>
    <YouMayAlsoLike />
    </>
  );
}
