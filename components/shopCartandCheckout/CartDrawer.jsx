"use client";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import he from 'he';
import { useLocale } from "next-intl";
import { useMenu } from '../../context/MenuContext';
import VideoPanel from "../VideoPanel";

export default function CartDrawer() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const [error, setError] = useState(null);
  const { cartProducts, setCartProducts, totalPrice } = useContextElement();
  const pathname = usePathname();
  const closeCart = () => {
    document
      .getElementById("cartDrawerOverlay")
      .classList.remove("page-overlay_visible");
    document.getElementById("cartDrawer").classList.remove("aside_visible");
  };
  const setQuantity = (id, quantity, productQty) => {
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
  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.product_id != id)]);
  };
  useEffect(() => {
    closeCart();
  }, [pathname]);

  // Calculate progress towards free shipping
  const freeShippingThreshold = 400;
  const progressPercentage = Math.min(
    (totalPrice / freeShippingThreshold) * 100,
    100
  );

  const subTotalPrice = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <span className="cart-drawer-item__price money price">{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
      } else {
        return <span className="cart-drawer-item__price money price">{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <span className="cart-drawer-item__price money price">{((elm.price - (elm.price / 100 * elm.sale_price)) * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
    } else {
      return <span className="cart-drawer-item__price money price">{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</span>;
    }
  };

  return (
    <>
      <div
        className="aside aside_right overflow-hidden cart-drawer "
        id="cartDrawer"
      >
        <div className="aside-header d-flex align-items-center">
          <h3 className="text-uppercase fs-6 mb-0">
            SHOPPING BAG (
            <span className="cart-amount js-cart-items-count">
              {cartProducts.length}
            </span>{" "}
            )
          </h3>
          <button
            onClick={closeCart}
            className="btn-close-lg js-close-aside btn-close-aside ms-auto"
          ></button>
        </div>
        <h6 style={{ color: "red" }}>{error && error}</h6>
        {cartProducts.length ? (
          <div className="aside-content cart-drawer-items-list">
            {cartProducts.map((elm, i) => (
              <React.Fragment key={i}>
                <div className="cart-drawer-item d-flex position-relative">
                  <div className="position-relative">
                    <Image
                      loading="lazy"
                      className="cart-drawer-item__img"
                      width={330}
                      height={400}
                      style={{ height: "fit-content" }}
                      src={elm.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${elm?.images && JSON.parse(elm.images)[0]}`}
                      alt="image"
                    />
                  </div>
                  <div className="cart-drawer-item__info flex-grow-1">
                    <h6 className="cart-drawer-item__title fw-normal">
                      {elm?.product_name && he.decode(elm.product_name)}
                    </h6>
                    {/* <p className="cart-drawer-item__option text-secondary">
                      Color: Yellow
                    </p>
                    <p className="cart-drawer-item__option text-secondary">
                      Size: L
                    </p> */}
                    <div className="d-flex align-items-center justify-content-between mt-1">
                      <div className="qty-control position-relative">
                        <input
                          type="number"
                          name="quantity"
                          onChange={(e) =>
                            setQuantity(elm.product_id, e.target.value / 1, elm.product_qty)
                          }
                          value={elm.quantity}
                          min="1"
                          className="qty-control__number border-0 text-center"
                          readOnly
                        />
                        <div
                          onClick={() => {
                            setQuantity(elm.product_id, elm.quantity - 1, elm.product_qty);
                          }}
                          className="qty-control__reduce text-start"
                        >
                          -
                        </div>
                        <div
                          onClick={() => setQuantity(elm.product_id, elm.quantity + 1, elm.product_qty)}
                          className="qty-control__increase text-end"
                        >
                          +
                        </div>
                      </div>

                        {subTotalPrice(elm)}
                      
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(elm.product_id)}
                    className="btn-close-xs position-absolute top-0 end-0 js-cart-item-remove"
                  ></button>
                </div>
                <hr className="cart-drawer-divider" />
              </React.Fragment>
            ))}

            {/* Free Shipping Progress Bar */}
           
          </div>
        ) : (
          <div className="fs-18 mt-5 px-5">
            Your cart is empty. Start shopping!
          </div>
        )}
        <div className="cart-drawer-actions position-absolute start-0 bottom-0 w-100">
        {/* <Image
          loading="lazy"
          src={"/assets/images/home/demo8/square banner final.jpg"}
          width={200}
          height={200}
          alt="image"
        /> */}
        <div className="d-flex-column justify-content-center d-none d-md-flex">
          <VideoPanel src="/assets/videos/popup video.mp4" section='popup'/>
        </div>
        <div className="d-flex-column justify-content-center d-flex d-md-none">
          <VideoPanel src="/assets/videos/popup video.mp4" section='sm_popup'/>
        </div>
        <div className="free-shipping-progress mt-3">
              {totalPrice < freeShippingThreshold ? (
                <div>
                  <p>
                    Spend {(freeShippingThreshold - totalPrice).toFixed(2)}{ currency.symbol } more to get free
                    shipping! ⛟
                  </p>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={progressPercentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ) : (
                <h4 className="success">☆ Congratulations! You qualify for free shipping!</h4>
              )}
        </div>
          <hr className="cart-drawer-divider" />
          <div className="d-flex justify-content-between">
            <h6 className="fs-base fw-medium">SUBTOTAL:</h6>
            <span className="cart-subtotal fw-medium">{totalPrice.toFixed(2)}{ currency.symbol }</span>
          </div>
          {cartProducts.length ? (
            <>
              <Link href={`/${locale}/shop-cart`} className="btn btn-light mt-3 d-block">
                View Cart
              </Link>
              <Link
                href={`/${locale}/shop-checkout`}
                className="btn btn-primary mt-3 d-block"
              >
                Checkout
              </Link>
            </>
          ) : (
            <Link href={`/${locale}/shop`} className="btn btn-light mt-3 d-block">
              Explore shop
            </Link>
          )}
        </div>
      </div>
      <div
        id="cartDrawerOverlay"
        onClick={closeCart}
        className="page-overlay"
      ></div>
    </>
  );
}
