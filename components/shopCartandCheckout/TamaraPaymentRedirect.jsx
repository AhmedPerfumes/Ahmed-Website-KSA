// components/HandleCancel.jsx
'use client';

import { useContextElement } from "@/context/Context";
import { useMenu } from '@/context/MenuContext';
import { useState, useEffect } from 'react';
import he from 'he';
import Pagination1 from "../common/Pagination1";
import FeedbackForm from "../common/Feedback";

export default function TamaraPaymentRedirect() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { setCartProducts } = useContextElement();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [apiError, setApiError] = useState(null);

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
        setApiError(err.message || "Something went wrong.");
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

  const subTotalPrice = (elm) => {
    if (elm.is_gift) return <td>0.00{currency.symbol} (Free Gift)</td>;

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

  if (isMenuLoading || isLoading) return <div><Pagination1 /></div>;
  if (isMenuError) return <div>{isMenuError}</div>;
  if (apiError) return <div>Error: {apiError}</div>;

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
            {paymentStatus === 'success' ? <h3>Your order is completed!</h3> : <h3>Your order failed!</h3>}
            {paymentStatus === 'success' && <p>Thank you. Your order has been received.</p>}
            <FeedbackForm orderId={orderDetails.id} customerName={orderDetails.customer_name} />
          </div>

          {paymentStatus === 'success' && (
            <>
              <div className="order-info">
                <div className="order-info__item">
                  <label>Order Number</label>
                  <span>{orderDetails.order_id}</span>
                </div>
                <div className="order-info__item">
                  <label>Date</label>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="order-info__item">
                  <label>Total</label>
                  <span>{orderDetails.total}{currency.symbol} (includes {orderDetails.tax_amount}{currency.symbol} VAT)</span>
                </div>
                <div className="order-info__item">
                  <label>Payment Method</label>
                  <span>Tamara</span>
                </div>
              </div>

              <div className="checkout__totals-wrapper">
                <div className="checkout__totals">
                  <h3>Order Details</h3>
                  <table className="checkout-cart-items">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.products.map((elm, i) => (
                        <tr key={i}>
                          <td>{he.decode(elm.product_name)} x {elm.qty}</td>
                          {subTotalPrice(elm)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="checkout-totals">
                    <tbody>
                      <tr>
                        <th>SUBTOTAL</th>
                        <td>{orderDetails.sub_total}{ currency.symbol }</td>
                      </tr>
                      <tr>
                        <th>SHIPPING</th>
                        <td>{orderDetails.shipping_amount <= 0 ? 'You Got Free Shipping' : `Shipping Cost: ${ (orderDetails.shipping_amount * (1 + orderDetails.vat_amount / 100)).toFixed(2) }${ currency.symbol }`}</td>
                      </tr>
                      <tr>
                        
                        <th>SERVICE FEE</th>
                        <td>{ (orderDetails.service_amount * (1 + orderDetails.vat_amount / 100)).toFixed(2) }{ currency.symbol }</td>
                      </tr>

                      { orderDetails.payment_method === "cod" && (
                        <tr>
                            <th>COD CHARGES</th>
                            <td>{ (orderDetails.cod_charge * (1 + orderDetails.vat_amount / 100)).toFixed(2) }{ currency.symbol }</td> 
                        </tr>
                      )}
                      
                      <tr>
                        <th>TOTAL</th>
                        <td>{orderDetails.total}{ currency.symbol } (includes { orderDetails.tax_amount }{ currency.symbol } VAT)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <a href="/" className="btn btn-primary w-100 text-uppercase mb-3">Continue Shopping</a>
              </div>
            </>
          )}

          {paymentStatus !== 'success' && (
            <a href="/" className="btn btn-primary w-100 text-uppercase mb-3">Continue Shopping</a>
          )}
        </div>
      ) : (
        <a href="/" className="btn btn-primary w-100 text-uppercase mb-3">Continue Shopping</a>
      )}
    </>
  );
}
