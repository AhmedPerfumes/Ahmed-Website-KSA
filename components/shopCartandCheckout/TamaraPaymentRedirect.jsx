// components/HandleCancel.jsx
'use client';

import { useContextElement } from "@/context/Context";
import { useMenu } from '@/context/MenuContext';
import { useState, useEffect, useRef } from 'react';
import he from 'he';
import Pagination1 from "../common/Pagination1";
import FeedbackForm from "../common/Feedback";
import { useLocale, useTranslations } from "next-intl";
import OrderLines, { normalizeOrderLines, orderLineTotals } from "./OrderLines";

export default function TamaraPaymentRedirect() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { setCartProducts } = useContextElement();
  const locale = useLocale();
  const t = useTranslations('OrderComplete');
  const tAll = useTranslations();
  const money = (n) => `${Number(n || 0).toFixed(2)}${currency?.symbol || ''}`;
  // Product names come from the backend in English; use the Arabic catalogue name when we have one
  const productName = (name) => { const n = he.decode(String(name || '')); return locale === 'ar' && tAll.has(n) ? tAll(n) : n; };
  const payLabel = (m) => { const k = `pm_${String(m || '').toLowerCase()}`; return t.has(k) ? t(k) : m; };
  const orderDate = () => new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-US');
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [apiError, setApiError] = useState(null);
  const hasTrackedRef = useRef(false);
  const vatMult = 1 + (parseFloat(orderDetails?.vat_amount) || 15) / 100;

  useEffect(() => {
    const fetchOrderDetails = async (orderId, status) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/tamaraPaymentResponse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const json = await res.json();
        setOrderDetails(json);
        setPaymentStatus(status);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setApiError(t('somethingWrong'));
        setPaymentStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };

    const hash = window.location.hash;
    if (!hash) return;

    const match = hash.match(/#\/(success|cancel|fail)/i);
    const status = match ? match[1].toLowerCase() : null;
    if (!status) return;

    const raw = hash.startsWith('#/') ? hash.slice(2) : hash.slice(1);
    const [route, ...queryParts] = raw.split('?');
    const fixedQueryString = queryParts.join('&');
    const params = new URLSearchParams(fixedQueryString);
    const orderId = params.get('orderId');

    if (orderId) fetchOrderDetails(orderId, status);
  }, []);

  // 2. ANALYTICS EFFECT: Only fire if Tamara payment is actually successful (Strictly ONCE per order)
  useEffect(() => {
    if (paymentStatus === 'success' && orderDetails && (orderDetails.order_id || orderDetails.id)) {
      const orderId = orderDetails.order_id || orderDetails.id;
      const orderKey = `tracked_purchase_${orderId}`;

      // Prevent duplicate tracking in memory or across page reloads for this order
      if (hasTrackedRef.current === orderKey || (typeof window !== "undefined" && sessionStorage.getItem(orderKey))) {
        return;
      }

      hasTrackedRef.current = orderKey;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(orderKey, "true");
      }

      // ---- First-Party AhmedTracker ----
      if (typeof window !== "undefined" && window.AhmedTracker) {
        window.AhmedTracker.track("purchase", {
          order_id: orderId,
          total: parseFloat(orderDetails.total),
          payment_type: "tamara",
          items: orderDetails.products ? orderDetails.products.map((item) => ({
            product_id: (item.product_id || item.id)?.toString(),
            product_name: item.product_name ? he.decode(item.product_name) : (item.name ? he.decode(item.name) : ""),
            price: parseFloat(item.price),
            quantity: item.qty || item.quantity || 1,
          })) : [],
        });
      }

      // ---- GA4 Purchase ----
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          affiliation: "Ahmed Al Maghribi Perfumes KSA",
          value: parseFloat(orderDetails.total),
          currency: currency?.code || "SAR",
          items: orderDetails.products ? orderDetails.products.map((item) => ({
            item_id: (item.product_id || item.id)?.toString(),
            item_name: item.product_name ? he.decode(item.product_name) : (item.name ? he.decode(item.name) : ""),
            price: parseFloat(item.price),
            quantity: item.qty || item.quantity || 1,
          })) : [],
        },
      });

      // ---- TikTok Purchase ----
      if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
        window.ttq.track("Purchase", {
          contents: orderDetails.products ? orderDetails.products.map((item) => ({
            content_id: (item.product_id || item.id)?.toString(),
            content_type: "product",
            content_name: item.product_name ? he.decode(item.product_name) : (item.name ? he.decode(item.name) : ""),
          })) : [],
          value: parseFloat(orderDetails.total),
          currency: currency?.code || "SAR",
        });
      }

      // ---- Snapchat Purchase ----
      if (typeof window.snaptr === "function") {
        window.snaptr("track", "PURCHASE", {
          transaction_id: orderId,
          price: parseFloat(orderDetails.total),
          currency: currency?.code || "SAR",
          item_ids: orderDetails.products ? orderDetails.products.map((item) => (item.product_id || item.id)?.toString()) : [],
          item_category: "perfume",
          number_items: orderDetails.products ? orderDetails.products.length : 0,
        });
      }

      // Clear local cart after successful Tamara payment and tracking
      localStorage.removeItem("cartList");
      setCartProducts([]);
    }
  }, [paymentStatus, orderDetails?.order_id, orderDetails?.id, currency?.code]);

  const subTotalPrice = (elm) => {
    if (elm.is_gift) return <td>0.00{currency.symbol} ({t('freeGift')})</td>;

    if (elm.discount_percent) {
      const discounted = (elm.price * (1 + elm.vat / 100)) * (1 - elm.discount_percent / 100) * elm.qty;
      return <td>{discounted.toFixed(2)}{currency.symbol}</td>;
    }

    if (elm.coupon) {
      const discounted = (elm.price * (1 - elm.coupon.value / 100)) * elm.qty;
      return <td>{discounted.toFixed(2)}{currency.symbol}</td>;
    }

    if (elm.discount_amount && elm.discount_amount !== '0') {
      return <td>{elm.gross_amount}{currency.symbol}</td>;
    }

    return <td>{((elm.price * (1 + elm.vat / 100)) * elm.qty).toFixed(2)}{currency.symbol}</td>;
  };

  // Saved order lines: struck-through original price next to the price actually paid
  const olLines = normalizeOrderLines(orderDetails?.products, vatMult - 1);
  const olTotals = orderLineTotals(olLines);

  if (isMenuLoading || isLoading) return <div><Pagination1 /></div>;
  if (isMenuError) return <div>{isMenuError}</div>;
  if (apiError) return <div className="text-center py-5">{apiError}</div>;

  return (
    <>
      {orderDetails && orderDetails.order_id ? (
        <div className="order-complete">
          <div className="order-complete__message">
            {paymentStatus=== 'success' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#B9A16B" />
                <path
                  d="M52.9743 35.7612C52.9743 35.3426 52.8069 34.9241 52.5056 34.6228L50.2288 32.346C49.9275 32.0446 49.5089 31.8772 49.0904 31.8772C48.6719 31.8772 48.2533 32.0446 47.952 32.346L36.9699 43.3449L32.048 38.4062C31.7467 38.1049 31.3281 37.9375 30.9096 37.9375C30.4911 37.9375 30.0725 38.1049 29.7712 38.4062L27.4944 40.683C27.1931 40.9844 27.0257 41.4029 27.0257 41.8214C27.0257 42.24 27.1931 42.6585 27.4944 42.9598L33.5547 49.0201L35.8315 51.2969C36.1328 51.5982 36.5513 51.7656 36.9699 51.7656C37.3884 51.7656 37.8069 51.5982 38.1083 51.2969L40.385 49.0201L52.5056 36.8996C52.8069 36.5982 52.9743 36.1797 52.9743 35.7612Z"
                  fill="white"
                />
              </svg>
            )}
            {paymentStatus === 'success' ? <h3>{t('heading')}</h3> : <h3>{t('orderFailed')}</h3>}
            {paymentStatus === 'success' && <p>{t('thanks')}</p>}
            <FeedbackForm orderId={orderDetails?.order_id || orderDetails?.id} customerName={orderDetails?.customer_name} />
          </div>

          {paymentStatus === 'success' && (
            <>
              <div className="order-info">
                <div className="order-info__item">
                  <label>{t('orderNumber')}</label>
                  <span>{orderDetails.order_id}</span>
                </div>
                <div className="order-info__item">
                  <label>{t('date')}</label>
                  <span>{orderDate()}</span>
                </div>
                <div className="order-info__item">
                  <label>{t('total')}</label>
                  <span>{t('inclVat', { amount: money(orderDetails.total), vat: money(orderDetails.tax_amount) })}</span>
                </div>
                <div className="order-info__item">
                  <label>{t('paymentMethod')}</label>
                  <span>{t('pm_tamara')}</span>
                </div>
              </div>

              <div className="checkout__totals-wrapper">
                <div className="checkout__totals">
                  <h3>{t('orderDetails')}</h3>
                  <OrderLines lines={olLines} money={money} t={t} productName={productName} />
                  <table className="checkout-totals">
                    <tbody>
                      <tr>
                        <th>{t('subtotal')}</th>
                        <td>{money(olTotals.discount > 0 ? olTotals.original : orderDetails.sub_total)}</td>
                      </tr>
                      {olTotals.discount > 0 && (
                        <tr className="ol-discount">
                          <th>{t('discount')}</th>
                          <td><bdi dir="ltr">−{money(olTotals.discount)}</bdi></td>
                        </tr>
                      )}
                      <tr>
                        <th>{t('shipping')}</th>
                        <td>{!(orderDetails.shipping_amount > 0) ? t('freeShipping') : money(orderDetails.shipping_amount * vatMult)}</td>
                      </tr>
                      {parseFloat(orderDetails.service_amount) > 0 && (
                        <tr>
                          <th>{t('serviceFee')}</th>
                          <td>{money(orderDetails.service_amount * vatMult)}</td>
                        </tr>
                      )}

                      { orderDetails.payment_method === "cod" && (
                        <tr>
                            <th>{t('codFee')}</th>
                            <td>{money(orderDetails.cod_charge * vatMult)}</td> 
                        </tr>
                      )}
                      
                      <tr>
                        <th>{t('total')}</th>
                        <td>{t('inclVat', { amount: money(orderDetails.total), vat: money(orderDetails.tax_amount) })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">{t('continueShopping')}</a>
              </div>
            </>
          )}

          {paymentStatus !== 'success' && (
            <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">{t('continueShopping')}</a>
          )}
        </div>
      ) : (
        <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">{t('continueShopping')}</a>
      )}
    </>
  );
}
