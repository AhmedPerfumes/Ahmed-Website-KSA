"use client";

import { useContextElement } from "@/context/Context";
import he from 'he';
import { useState, useEffect, useRef } from 'react';
import { useMenu } from '@/context/MenuContext';
import Pagination1 from "../common/Pagination1";
import FeedbackForm from "../common/Feedback";
import { useLocale, useTranslations } from "next-intl";
import OrderLines, { normalizeOrderLines, orderLineTotals } from "./OrderLines";

export default function OrderPaymentCompleted({ orderDetails: initialOrderDetails, initialOrderCode }) {
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
  const vatMult = 1 + (parseFloat(initialOrderDetails?.vat_amount) || 15) / 100;

  // State to hold the live data and loading status
  const [orderData, setOrderData] = useState(initialOrderDetails);
  const [isVerifying, setIsVerifying] = useState(false);
  const isPollingRef = useRef(false);
  const hasFiredPurchase = useRef(false); // prevents analytics firing more than once

  // 1. POLLING EFFECT: Check status if it's not final (From your UAE code)
  useEffect(() => {
    const finalStatuses = ['completed', 'failed', 'canceled', 'rejected', 'expired'];
    
    // If status is NOT final (e.g., 'pending' from PayTabs redirect), start polling
    if (orderData && !finalStatuses.includes(orderData.payment_status)) {
        setIsVerifying(true);
        
        const pollInterval = setInterval(async () => {
            if (isPollingRef.current) return;
            isPollingRef.current = true;

            try {
                // Fetch updated details using your standard endpoint
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/orderDetails`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      order_number: initialOrderCode || orderData.order_id
                    })
                });

                if (response.ok) {
                    const updatedData = await response.json();
                    
                    // If status changed to a final state, update and stop polling
                    if (finalStatuses.includes(updatedData.payment_status)) {
                        setOrderData(updatedData);
                        setIsVerifying(false);
                        clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            } finally {
                isPollingRef.current = false;
            }
        }, 5000); // Polling every 5 seconds is slightly better for instant payment feedback

        // Cleanup: Stop polling after 50 seconds (timeout) or on unmount
        const timeoutId = setTimeout(() => {
            clearInterval(pollInterval);
            setIsVerifying(false); // Give up and show what we have (e.g., pending message)
        }, 50000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
        };
    } else {
        // If loaded initially as completed/failed
        setIsVerifying(false);
    }
  }, [orderData?.payment_status, initialOrderCode]);

  // 2. ANALYTICS EFFECT: Only fire if payment is actually completed (Strictly ONCE per order)
  useEffect(() => {
    if (orderData?.payment_status === "completed" && orderData?.id && !hasFiredPurchase.current) {
      hasFiredPurchase.current = true; // lock — never fires again even if orderData re-renders

      const orderId = orderData.order_id || orderData.id;

      // ---- First-Party AhmedTracker ----
      if (typeof window !== "undefined" && window.AhmedTracker) {
        window.AhmedTracker.track("purchase", {
          order_id: orderId,
          total: parseFloat(orderData.total) || 0,
          revenue: parseFloat(orderData.total) || 0,
          payment_type: orderData.payment_type || "card",
          customer_phone: orderData.phone || orderData.customer_phone || orderData.mobile || null,
          customer_email: orderData.email || orderData.customer_email || null,
          items: (orderData.products || []).map((item) => ({
            product_id: (item.product_id || item.id)?.toString(),
            product_name: item.name ? he.decode(item.name) : (item.product_name ? he.decode(item.product_name) : ""),
            price: parseFloat(item.price) || 0,
            quantity: item.qty || 1,
          })),
        });
      }

      // ---- GA4 Purchase (TikTok listener in layout.jsx maps this to ttq.track("Purchase")) ----
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          affiliation: "Ahmed Al Maghribi Perfumes KSA",
          value: parseFloat(orderData.total),
          currency: currency?.code || "SAR",
          items: orderData.products ? orderData.products.map((item) => ({
            item_id: item.product_id?.toString(),
            item_name: he.decode(item.product_name || item.name || ""),
            price: parseFloat(item.price),
            quantity: item.qty,
          })) : [],
        },
      });

      // ---- Meta (Facebook) Pixel Purchase ----
      if (typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          content_ids: orderData.products.map((item) => item.product_id?.toString()),
          content_type: "product",
          contents: orderData.products.map((item) => ({
            id: item.product_id?.toString(),
            quantity: item.qty,
          })),
          value: parseFloat(orderData.total),
          currency: currency?.code || "SAR",
          order_id: orderData.order_id,
        });
      }

      // ---- Snapchat Purchase ----
      if (typeof window.snaptr === "function") {
        window.snaptr("track", "PURCHASE", {
          transaction_id: orderId,
          price: parseFloat(orderData.total),
          currency: currency?.code || "SAR",
          item_ids: orderData.products ? orderData.products.map((item) => item.product_id?.toString()) : [],
          item_category: "perfume",
          number_items: orderData.products ? orderData.products.length : 0,
        });
      }

      // Clear local cart after successful payment and tracking
      localStorage.removeItem("cartList");
      setCartProducts([]);
    }
  }, [orderData?.payment_status, orderData?.id, orderData?.order_id, currency?.code]);
  

  const subTotalPrice = (elm) => {
    if (elm.is_gift) return <td>0.00{currency.symbol} ({t('freeGift')})</td>;
    
    if(elm?.discount_percent) {
        return <td>{(((elm.price * 1.15) - ((elm.price * 1.15) / 100 * elm.discount_percent)) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    } else if(elm?.coupon) {
        return <td>{((elm.price - (elm.price / 100 * elm.coupon.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    } else {
        if(elm.discount_amount && elm.discount_amount != '0') {
          return <td>{ elm.gross_amount }{ currency.symbol }</td>;
        }
        return <td>{((elm.price * 1.15) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    }
  };

  // Saved order lines: struck-through original price next to the price actually paid
  const olLines = normalizeOrderLines(orderData?.products, vatMult - 1);
  const olTotals = orderLineTotals(olLines);

  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError) return <div>{ isMenuError }</div>;

  // --- Show Loading Screen while verifying Webhook ---
  if (isVerifying) {
    return (
        <div className="text-center pt-5 pb-5">
            <h2 className="page-title">{t('verifyingTitle')}</h2>
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">{t('loading')}</span>
            </div>
            <p className="mt-3">{t('verifyingText')}</p>
        </div>
    );
  }

  const paymentStatusMessage = () => {
    if(orderData.payment_channel == 'tabby' || orderData.payment_channel == 'paytabs') {
      if(orderData.payment_description == 'EXPIRED' || orderData.payment_status == 'expired') {
        return <h3>{t('paymentAborted')}</h3>;
      } else if(orderData.payment_description == 'REJECTED' || orderData.payment_status == 'rejected' || orderData.payment_status == 'failed') {
        return <h3>{t('paymentRejected')}</h3>;
      } else if (orderData.payment_status == 'pending') {
        return <><h3>{t('processingTitle')}</h3><p>{t('processingText')}</p></>;
      } else {
        return <><h3>{t('heading')}</h3><p>{t('thanks')}</p></>;
      }
    } else {
      if(orderData.payment_status != 'failed') {
        return <><h3>{t('heading')}</h3><p>{t('thanks')}</p></>;
      } else {
        return <h3>{t('orderFailed')}</h3>;
      }
    }
  }

  // Determine if we should show the success checkmark
  const isSuccess = orderData.payment_status !== 'failed' && 
                    orderData.payment_status !== 'rejected' && 
                    orderData.payment_status !== 'expired' && 
                    orderData.payment_status !== 'pending';

  return (
    <>
    <h2 className="page-title">{isSuccess ? t('pageTitle') : t('statusTitle')}</h2>

    {orderData.order_id ? <><div className="order-complete">
      <div className="order-complete__message">
        {isSuccess && <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="40" fill="#B9A16B" />
          <path
            d="M52.9743 35.7612C52.9743 35.3426 52.8069 34.9241 52.5056 34.6228L50.2288 32.346C49.9275 32.0446 49.5089 31.8772 49.0904 31.8772C48.6719 31.8772 48.2533 32.0446 47.952 32.346L36.9699 43.3449L32.048 38.4062C31.7467 38.1049 31.3281 37.9375 30.9096 37.9375C30.4911 37.9375 30.0725 38.1049 29.7712 38.4062L27.4944 40.683C27.1931 40.9844 27.0257 41.4029 27.0257 41.8214C27.0257 42.24 27.1931 42.6585 27.4944 42.9598L33.5547 49.0201L35.8315 51.2969C36.1328 51.5982 36.5513 51.7656 36.9699 51.7656C37.3884 51.7656 37.8069 51.5982 38.1083 51.2969L40.385 49.0201L52.5056 36.8996C52.8069 36.5982 52.9743 36.1797 52.9743 35.7612Z"
            fill="white"
          />
        </svg>}
        
        { paymentStatusMessage() }
        {orderData && (
          <FeedbackForm orderId={orderData.id} customerName={orderData.customer_name}/>
        )}
      </div>

      {isSuccess ? <>
      <div className="order-info">
        <div className="order-info__item">
          <label>{t('orderNumber')}</label>
          <span>{ orderData.order_id }</span>
        </div>
        <div className="order-info__item">
          <label>{t('date')}</label>
          <span>{orderDate()}</span>
        </div>
        <div className="order-info__item">
          <label>{t('total')}</label>
          <span>{t('inclVat', { amount: money(orderData.total), vat: money(orderData.tax_amount) })}</span>
        </div>
        <div className="order-info__item">
          <label>{t('paymentMethod')}</label>
          <span>{ payLabel(orderData.payment_method || orderData.payment_channel) }</span>
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
                <td>{money(olTotals.discount > 0 ? olTotals.original : orderData.sub_total)}</td>
              </tr>
              {olTotals.discount > 0 && (
                <tr className="ol-discount">
                  <th>{t('discount')}</th>
                  <td><bdi dir="ltr">−{money(olTotals.discount)}</bdi></td>
                </tr>
              )}
              <tr>
                <th>{t('shipping')}</th>
                <td>{!(orderData.shipping_amount > 0) ? t('freeShipping') : money(orderData.shipping_amount * vatMult)}</td>
              </tr>
              {parseFloat(orderData.service_amount) > 0 && (
                <tr>
                  <th>{t('serviceFee')}</th>
                  <td>{money(orderData.service_amount * vatMult)}</td>
                </tr>
              )}
              <tr>
                <th>{t('total')}</th>
                <td>{t('inclVat', { amount: money(orderData.total), vat: money(orderData.tax_amount) })}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">
          {t('continueShopping')}
        </a>
      </div></> : <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">{t('continueShopping')}</a>
      } 
    </div></> :  <a href={`/${locale}`} className="btn btn-primary w-100 text-uppercase mb-3">{t('continueShopping')}</a> }
    </>
  );
}