"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { useLocale } from "next-intl";
import { useMenu } from '../../context/MenuContext';
import Pagination1 from "../common/Pagination1";

export default function Cart() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  // const [couponCode, setCouponCode] = useState("");
  // const [couponError, setCouponError] = useState(null);
  // const [couponSuccess, setCouponSuccess] = useState(null);
  const { cartProducts, setCartProducts, totalPrice, freeShippingFlag } = useContextElement();
  const setQuantity = async (id, quantity, productQty) => {
    if (quantity >= 1 && quantity <= productQty) {
      setError(null);
      const item = cartProducts.filter((elm) => elm.product_id == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    } else {
      setError("Quantity is more than available quantity");
    }
  };
  const removeItem = async(id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.product_id != id)]);
  };

  const [checkboxes, setCheckboxes] = useState({
    free_shipping: freeShippingFlag,
    flat_rate: false,
    local_pickup: false,
  });

  // Step 2: Create a handler function
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [id]: checked,
    }));
  };

  // const handleCouponChange = (e) => {
  //   setCouponCode(e.target.value);
  // };

  // const applyCoupon = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Call your backend API or validation logic for the coupon code
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/validateCoupon`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ couponCode }),
  //     });

  //     const data = await res.json();

  //     if(data.message && data.message.split(' ')[0] == 'Details') {
  //       setCouponError(null);
  //       setCouponSuccess('Coupon Applied Successfully');
  //     } else {
  //       setCouponSuccess(null);
  //       console.log(data);
  //       if(data['couponCode']) {
  //         setCouponError(data['couponCode']);
  //       } else if(data['mobile_number']) {
  //         setCouponError(data['mobile_number']);
  //       } else {
  //         setCouponError(data.message);
  //       }
  //     }
  //   } catch (err) {
  //     setCouponSuccess(null);
  //     setCouponError("An error occurred. Please try again.");
  //   }
  // };

  if (isMenuLoading) {
    return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  const currentUTC = new Date(); // Current UTC time
  const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
  const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");

  const subTotalPrice = (elm) => {
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <span className="shopping-cart__subtotal">{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
      } else {
        return <span className="shopping-cart__subtotal">{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <span className="shopping-cart__subtotal">{((elm.price - (elm.price / 100 * elm.sale_price)) * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
    } else {
      return <span className="shopping-cart__subtotal">{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
    }
  };

  const price = (elm) => {
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <span className="shopping-cart__product-price">{(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}{ currency.symbol }</span>;
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <span className="shopping-cart__product-price">{(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(2)}{ currency.symbol }</span>;
    } else {
      return <span className="shopping-cart__product-price">{elm.price}{ currency.symbol }</span>;
    }
  };

  return (
    <div className="shopping-cart" style={{ minHeight: "calc(100vh - 300px)" }}>
      <div className="cart-table__wrapper">
        {cartProducts.length ? (
          <>
            <h6 style={{ color: "red" }}>{error && error}</h6>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th></th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartProducts.map((elm, i) => (
                  <tr key={i}>
                    <td>
                      <div className="shopping-cart__product-item">
                        <Image
                          loading="lazy"
                          src={elm.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                          width="120"
                          height="120"
                          alt="image"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="shopping-cart__product-item__detail">
                        <h4>{elm.product_name}</h4>
                        {/* <ul className="shopping-cart__product-item__options">
                          <li>Color: Yellow</li>
                          <li>Size: L</li>
                        </ul> */}
                      </div>
                    </td>
                    <td>
                      
                        { price(elm) }
                      
                    </td>
                    <td>
                      <div className="qty-control position-relative">
                        <input
                          type="number"
                          name="quantity"
                          value={elm.quantity}
                          min={1}
                          onChange={(e) =>
                            setQuantity(elm.product_id, e.target.value / 1, elm.product_qty)
                          }
                          className="qty-control__number text-center"
                          readOnly
                        />
                        <div
                          onClick={() => setQuantity(elm.product_id, elm.quantity - 1, elm.product_qty)}
                          className="qty-control__reduce"
                        >
                          -
                        </div>
                        <div
                          onClick={() => setQuantity(elm.product_id, elm.quantity + 1, elm.product_qty)}
                          className="qty-control__increase"
                        >
                          +
                        </div>
                      </div>
                    </td>
                    <td>
                      
                        { subTotalPrice(elm) }
                      
                    </td>
                    <td>
                      <a
                        onClick={() => removeItem(elm.product_id)}
                        className="remove-cart"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="#767676"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0.259435 8.85506L9.11449 0L10 0.885506L1.14494 9.74056L0.259435 8.85506Z" />
                          <path d="M0.885506 0.0889838L9.74057 8.94404L8.85506 9.82955L0 0.97449L0.885506 0.0889838Z" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <div className="cart-table-footer">
              <form
                onSubmit={applyCoupon}
                className="position-relative bg-body"
              >
                {couponError ? <div style={{ color: 'red' }}>{couponError}</div> : <div style={{ color: 'green' }}>{couponSuccess}</div>}
                <input
                  className="form-control"
                  type="text"
                  name="coupon_code"
                  placeholder="Coupon Code"
                  required
                  value={couponCode}
                  onChange={handleCouponChange}
                />
                <input
                  className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4"
                  type="submit"
                  value="APPLY COUPON"
                />
              </form>
              -<button className="btn btn-light">UPDATE CART</button>-
            </div> */}
          </>
        ) : (
          <>
            <div className="fs-20">Shop cart is empty</div>

            <button className="btn mt-3 btn-light">
              <Link href={`/${locale}/shop`}>Explore Products</Link>
            </button>
          </>
        )}
      </div>
      {cartProducts.length ? (
        <div className="shopping-cart__totals-wrapper">
          <div className="sticky-content">
            <div className="shopping-cart__totals">
              <h3>Cart Totals</h3>
              <table className="cart-totals">
                <tbody>
                  <tr>
                    <th>Subtotal</th>
                    <td>{totalPrice.toFixed(2)}{ currency.symbol }</td>
                  </tr>
                  <tr>
                    <th>Shipping</th>
                    <td>
                      {/* <div className="form-check">
                        <input
                          className="form-check-input form-check-input_fill"
                          type="checkbox"
                          id="free_shipping"
                          checked={freeShippingFlag}
                          onChange={handleCheckboxChange}
                          disabled
                        />
                        <label
                          className="form-check-label"
                          htmlFor="free_shipping"
                        >
                          Free shipping
                        </label>
                      </div> */}
                      {
                        freeShippingFlag ? <div className="form-check">
                          <label className="form-check-label" htmlFor="flat_rate">
                            You Got Free Shipping
                          </label>
                        </div> :
                        <div className="form-check">
                          <label className="form-check-label" htmlFor="flat_rate">
                            Shipping Cost: { shippingServiceCharges[0].price }{ currency.symbol }
                          </label>
                        </div>
                      }
                      {/* <div className="form-check">
                        <input
                          className="form-check-input form-check-input_fill"
                          type="checkbox"
                          id="local_pickup"
                          checked={checkboxes.local_pickup}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="local_pickup"
                        >
                          Local pickup: $8
                        </label>
                      </div> */}
                      {/* <div>Shipping to AL.</div> */}
                      {/* <div>
                        <Link href="#" className="menu-link menu-link_us-s">
                          CHANGE ADDRESS
                        </Link>
                      </div> */}
                    </td>
                  </tr>
                  <tr>
                    <th>SERVICE FEE</th>
                    <td>{ shippingServiceCharges[1].price }{ currency.symbol }</td>
                  </tr>
                  <tr>
                    <th>Total</th>
                    <td>
                      {!freeShippingFlag ?
                        (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2) :
                        (0 + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)}{ currency.symbol } (includes { !freeShippingFlag ? (
                          (
                            (parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + parseFloat(vatTax.percentage / 100))) +
                            (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) +
                            (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                          ).toFixed(2)) : (
                          (
                            0 +
                            (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) +
                            (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                          ).toFixed(2)) }{ currency.symbol } VAT)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mobile_fixed-btn_wrapper">
              <div className="button-wrapper container">
                <Link href={`/${locale}/shop-checkout`} className="btn btn-primary btn-checkout">
                  PROCEED TO CHECKOUT
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
