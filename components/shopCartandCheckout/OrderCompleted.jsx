"use client";

import { useContextElement } from "@/context/Context";
import { useMenu } from '@/context/MenuContext';
import { useEffect, useState } from "react";
import he from 'he';
import Link from "next/link";
import Pagination1 from "../common/Pagination1";
import FeedbackForm from "../common/Feedback";

export default function OrderCompleted() {
  const { cartProducts, totalPrice, freeShippingFlag, orderDetails, setCartProducts, setOrderDetails, couponDataContext,promotionsContext } = useContextElement();
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  
  const [showDate, setShowDate] = useState(false);
  const [orderData, setorderData] = useState(null);
  useEffect(() => {
  setShowDate(true);
  localStorage.setItem('cartList', []);
  setCartProducts([]);

  if (orderDetails && orderDetails.order_id) {
    // ---- First-Party AhmedTracker ----
    if (typeof window !== "undefined" && window.AhmedTracker) {
      window.AhmedTracker.track("purchase", {
        order_id: orderDetails.order_id,
        total: parseFloat(orderDetails.total),
        payment_type: orderDetails.payment_method || orderDetails.payment_type || "cod",
        items: orderDetails.products ? orderDetails.products.map((item) => ({
          product_id: item.product_id?.toString(),
          product_name: item.name ? he.decode(item.name) : "",
          price: parseFloat(item.price),
          quantity: item.qty,
        })) : [],
      });
    }

    // ---- GA4 Purchase ----
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: orderDetails.order_id,
        affiliation: "Ahmed Al Maghribi Perfumes KSA",
        value: parseFloat(orderDetails.total),
        currency: currency?.code || "SAR",
        items: orderDetails.products.map((item) => ({
          item_id: item.product_id?.toString(),
          item_name: he.decode(item.name),
          price: parseFloat(item.price),
          quantity: item.qty,
        })),
      },
    });

    // ---- TikTok Pixel ----
    window.ttq?.track("Purchase", {
      contents: orderDetails.products.map((item) => ({
        content_id: item.product_id?.toString(),
        content_type: "product",
        content_name: he.decode(item.name),
      })),
      value: parseFloat(orderDetails.total),
      currency: currency?.code || "SAR",
    });

    // ---- Snapchat Pixel ----
    if (window.snaptr) {
      window.snaptr('track', 'PURCHASE', {
        transaction_id: orderDetails.order_id,
        price: parseFloat(orderDetails.total),
        currency: currency?.code || "SAR",
        item_ids: orderDetails.products.map((item) => item.product_id?.toString()),
        item_category: "perfume",
        number_items: orderDetails.products.length,
      });
    }
  }
}, [orderDetails]);

  if (isMenuLoading) {
    return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  const subTotalPrice = (elm) => {
    if (elm.is_gift) {
      console.log('FREE');
      return <td>0.00{currency.symbol} (Free Gift)</td>;
    }
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    let itemPrice = elm.price;
  
     if (elm.is_gift) {
        console.log('FREE');
        return <td>0.00{currency.symbol} (Free Gift)</td>;
      }

   if (couponDataContext && couponDataContext.code && couponDataContext.type === "customer") {
      // console.log('common Customer Coupon', elm);
      const validCoupon = orderDetails.products.some(
        // (item) => !item.sale_price && !item.discount && !item.is_gift && !promotionsContext.some((promo) =>
        (item) => !item.discount && !item.is_gift && !promotionsContext.some((promo) =>
        promo.buy_products.some((item) => item.product_id === elm.product_id)
        )
      ) && (
        !couponDataContext.start_date ||
        !couponDataContext.end_date ||
        (new Date(current_date_time) >= new Date(couponDataContext.start_date) &&
          new Date(current_date_time) <= new Date(couponDataContext.end_date))
      );

      if (
        elm.is_coupon &&
        validCoupon &&
        // !elm.sale_price &&
        !elm.discount
      ) {
        // console.log('common Customer Coupon If', elm);
        // itemPrice = elm.price - (elm.price / 100) * couponDataContext.value;
        if(couponDataContext.coupon_type == "percent") {
          itemPrice = elm.price - (elm.price / 100) * couponDataContext.value;
        } else if(couponDataContext.coupon_type == "amount") {
          // console.log('amount...', elm, couponData);
          itemPrice = elm.price - couponDataContext.value;
        }
        return (
          <td>        
              {currency.symbol}
              {(itemPrice * elm.qty).toFixed(2)}          
          </td>
        );
      }
    }
    if(elm?.discount) {
      console.log('DISC', elm.discount);
      console.log('DISC', new Date(current_date_time), new Date(elm.discount.start_date));
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        console.log('if...');
        if(elm.discount.discount_type == 'percent') {
          console.log('percent...', elm);
          return <td>{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
        } else if(elm.discount.discount_type == 'amount') {
          console.log('amount...', elm);
          return <td>{((elm.price - elm.discount.value) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
        }
        // return <td>{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
      } else {
        console.log('else...');
        return <td>{(elm.price * elm.qty).toFixed(2)}{ currency.symbol }</td>;
      }
    }
    else if(elm?.sale_price) {
      console.log('SALE', elm);
      return <td>{((elm.sale_price) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    } 
    // else if(elm?.coupon && elm.coupon.length != 0 && elm.coupon[couponDataContext?.code.toLowerCase()]?.code == couponDataContext?.code.toLowerCase()) {
    //   console.log('COUPON', elm);
    //   if(new Date(current_date_time) >= new Date(elm.coupon[couponDataContext?.code.toLowerCase()]?.start_date) && new Date(current_date_time) <= new Date(elm.coupon[couponDataContext?.code.toLowerCase()]?.end_date)) {
    //     return <td>{((elm.price - (elm.price / 100 * elm.coupon[couponDataContext?.code.toLowerCase()]?.value)) * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    //   } else {
    //     return <td>{(elm.price * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    //   }
    // } 
    else {
        return <td>{(elm.price * elm.qty).toFixed(2)}{ currency.symbol }</td>;
    }
    
    
  };
 
  

  return (
    <>
    {Object.keys(orderDetails).length ? <><div className="order-complete">
      <div className="order-complete__message">
        <svg
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
        </svg>
        <h3>Your order is completed!</h3>
        <p>Thank you. Your order has been received.</p>
      </div>
      <FeedbackForm orderId={orderDetails.id} customerName={orderDetails.customer_name}/>
      <div className="order-info">
        <div className="order-info__item">
          <label>Order Number</label>
          <span>{ orderDetails.order_id }</span>
        </div>
        <div className="order-info__item">
          <label>Date</label>
          {showDate && <span>{new Date().toLocaleDateString()}</span>} 
        </div>
        <div className="order-info__item">
          <label>Total</label>

          <span>{parseFloat(orderDetails.total).toFixed(2)}{ currency.symbol } (includes { orderDetails.shipping_amount > 0 ? (
                (
                  (parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + parseFloat(vatTax.percentage / 100))) +
                  (parseFloat(orderDetails.sub_total) - parseFloat(orderDetails.sub_total) / (1 + parseFloat(vatTax.percentage / 100))) +
                  (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                ).toFixed(2)) : (
                (
                  0 +
                  (parseFloat(orderDetails.sub_total) - parseFloat(orderDetails.sub_total) / (1 + parseFloat(vatTax.percentage / 100))) +
                  (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                ).toFixed(2)) }{ currency.symbol } VAT)
          </span>
        </div>
        <div className="order-info__item">
          <label>Paymetn Method</label>
          <span>{ orderDetails.payment_method }</span>
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
              {orderDetails?.products?.map((elm, i) => (
                <tr key={i}>
                  <td>
                    {he.decode(elm.name)} x {elm.qty}
                  </td>
                  { subTotalPrice(elm) }
                </tr>
              ))}
            </tbody>
          </table>
          <table className="checkout-totals">
            <tbody>
              <tr>
                <th>SUBTOTAL</th>
                <td>{parseFloat(orderDetails.sub_total).toFixed(2)}{ currency.symbol }</td>
              </tr>
              <tr>
                <th>SHIPPING</th>
                <td>{(orderDetails.sub_total).toFixed(2) >= 300 ? 'You Got Free Shipping' : `Shipping Cost: ${ shippingServiceCharges[0].price }${ currency.symbol }`}</td>
              </tr>
              {/* <tr>
                <th>SERVICE FEE</th>
                <td>{ shippingServiceCharges[1].price }{ currency.symbol }</td>
              </tr> */}
              <tr>
                <th>TOTAL</th>
                <td>{parseFloat(orderDetails.total).toFixed(2)}{ currency.symbol } (includes { orderDetails.shipping_amount > 0 ? (
                    (
                      (parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + parseFloat(vatTax.percentage / 100))) +
                      (parseFloat(orderDetails.sub_total) - parseFloat(orderDetails.sub_total) / (1 + parseFloat(vatTax.percentage / 100))) +
                      (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                    ).toFixed(2)) : (
                    (
                      0 +
                      (parseFloat(orderDetails.sub_total) - parseFloat(orderDetails.sub_total) / (1 + parseFloat(vatTax.percentage / 100))) +
                      (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                    ).toFixed(2)) }{ currency.symbol } VAT)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <a href='/'
          className="btn btn-primary w-100 text-uppercase mb-3"
        >
          Continue Shopping
        </a>
      </div>      
    </div></> :  <a href='/' className="btn btn-primary w-100 text-uppercase mb-3">Continue Shopping</a> }
    </>
  );
}
