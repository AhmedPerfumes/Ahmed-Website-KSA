"use client";
import { useContextElement } from "@/context/Context";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Size from "../singleProduct/Size";
import Colors from "../singleProduct/Colors";
import Image from "next/image";
import ShareComponent from "../common/ShareComponent";
import { useState, useEffect, useRef } from "react";
import he from 'he';
// import Link from "next/link";
import { useMenu } from '@/context/MenuContext';
import Pagination1 from "../common/Pagination1";

export default function QuickView() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { quickViewItem } = useContextElement();
  const { isAddedToCartProducts } = useContextElement();
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const swiperOptions = {
    slidesPerView: 1,
    slidesPerGroup: 1,
    effect: "none",
    modules: [Navigation],
    loop: false,
    navigation: {
      nextEl:
        ".modal-dialog.quick-view .product-single__media .swiper-button-next",
      prevEl:
        ".modal-dialog.quick-view .product-single__media .swiper-button-prev",
    },
  };
  const swiperSlideItems = [
    // quickViewItem.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${quickViewItem.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(quickViewItem.images)[0]}`,
    // quickViewItem.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${quickViewItem.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(quickViewItem.images)[0]}`,
    // quickViewItem.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${quickViewItem.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(quickViewItem.images)[0]}`,
    // quickViewItem.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${quickViewItem.image}` : `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(quickViewItem.images)[0]}`,
  ];
  const { cartProducts, setCartProducts } = useContextElement();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  const isIncludeCard = () => {
    const item = cartProducts.filter((elm) => elm.product_id == quickViewItem.product_id)[0];
    return item;
  };
  const setQuantityCartItem = (id, quantity) => {
    if (isIncludeCard()) {
      if (quantity >= 1 && quantity <= quickViewItem.product_qty) {
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
    } else {
      setQuantity((quantity <= quickViewItem.product_qty && quantity >= 1) ? quantity : quickViewItem.product_qty);
      setError(null);
      if(quantity > quickViewItem.product_qty) {
        setError("Quantity is more than available quantity");
      } else {
        setError(null);
      }
    }
  };
  const addToCart = () => {
    if (!isIncludeCard()) {
      const item = {...quickViewItem, category_name: capitalizeEachWord(quickViewItem.category_name.split('-').join(' ')), subcategory_name: capitalizeEachWord(quickViewItem.subcategory_name.split('-').join(' '))};
      item.quantity = quantity;
      setCartProducts((pre) => [...pre, item]);
      document
      .getElementById("cartDrawerOverlay")
      .classList.add("page-overlay_visible");
      document.getElementById("cartDrawer").classList.add("aside_visible");
    }
  };
  
  const modalElement = useRef();

  useEffect(() => {
    const bootstrap = require("bootstrap"); // dynamically import bootstrap
    let myModal = new bootstrap.Modal(
      document.getElementById("quickView"),
      {
        keyboard: false,
      }
    );

    // myModal.show();
    modalElement.current.addEventListener("hidden.bs.modal", () => {
      myModal.hide();
    });
  }, []);

  const price = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      // console.log(current_date_time, new Date(elm.discount.start_date), new Date(elm.discount.end_date));
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <><span className="money price price-old">{ currency.symbol }{elm?.price}</span> <span className="money price price-sale"> { currency.symbol }{(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}</span></>;
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <><span className="money price price-sale">{ currency.symbol }{(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(2)}</span><span className="money price price-old">{ currency.symbol }{elm?.price}</span> </>;
    } else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  function capitalizeEachWord(str) {
    return str.split(' ') // Split the sentence into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
              .join(' '); // Join the words back into a sentence
  }

  // if (isMenuLoading) {
  //   return <div><Pagination1 /></div>;
  // }
  // if (isMenuError) {
  //   return <div>{ isMenuError }</div>;
  // }

  return (
    <div className="modal fade" id="quickView" tabIndex="-1" ref={modalElement}>
      <div className="modal-dialog quick-view modal-dialog-centered">
        <div className="modal-content">
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
          <div className="product-single">
            <div className="product-single__media m-0">
              <div className="product-single__image position-relative w-100">
                <Swiper
                  {...swiperOptions}
                  className="swiper-container js-swiper-slider"
                >
                  {JSON.parse(quickViewItem.images).map((image, i) => (
                    <SwiperSlide
                      key={i}
                      className="swiper-slide product-single__image-item"
                    >
                      <Image
                        loading="lazy"
                        width={500}
                        height={700}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`}
                        alt="image"
                      />
                    </SwiperSlide>
                  ))}

                  <div className="cursor-pointer swiper-button-prev">
                    <svg
                      width="7"
                      height="11"
                      viewBox="0 0 7 11"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <use href="#icon_prev_sm" />
                    </svg>
                  </div>
                  <div className="cursor-pointer swiper-button-next">
                    <svg
                      width="7"
                      height="11"
                      viewBox="0 0 7 11"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <use href="#icon_next_sm" />
                    </svg>
                  </div>
                </Swiper>
              </div>
            </div>
            <div className="product-single__detail">
              <h1 className="product-single__name">{he.decode(quickViewItem.product_name)}</h1>
              <div className="product-single__price">
                { price(quickViewItem) }
              </div>
              <div className="product-single__short-desc">
                <div dangerouslySetInnerHTML={{ __html: quickViewItem.description }}>
                </div>
              </div>
              <h6 style={{ color: "red" }}>{error && error}</h6>
              <form onSubmit={(e) => e.preventDefault()}>
                {/* <div className="product-single__swatches">
                  <div className="product-swatch text-swatches">
                    <label>Sizes</label>
                    <div className="swatch-list">
                      <Size />
                    </div>
                    <a
                      href="#"
                      className="sizeguide-link"
                      data-bs-toggle="modal"
                      data-bs-target="#sizeGuide"
                    >
                      Size Guide
                    </a>
                  </div>
                  <div className="product-swatch color-swatches">
                    <label>Color</label>
                    <div className="swatch-list">
                      <Colors />
                    </div>
                  </div>
                </div> */}
                {quickViewItem.product_qty > 0 &&
                <div className="product-single__addtocart">
                  <div className="qty-control position-relative">
                    <input
                      type="number"
                      name="quantity"
                      value={
                        isIncludeCard() ? isIncludeCard().quantity : quantity
                      }
                      readOnly
                      min="1"
                      onChange={(e) =>
                        setQuantityCartItem(quickViewItem.product_id, e.target.value)
                      }
                      className="qty-control__number text-center"
                    />
                    <div
                      onClick={() =>
                        setQuantityCartItem(
                          quickViewItem.product_id,
                          isIncludeCard()?.quantity - 1 || quantity - 1
                        )
                      }
                      className="qty-control__reduce"
                    >
                      -
                    </div>
                    <div
                      onClick={() =>
                        setQuantityCartItem(
                          quickViewItem.product_id,
                          isIncludeCard()?.quantity + 1 || quantity + 1
                        )
                      }
                      className="qty-control__increase"
                    >
                      +
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart()}
                    className="btn btn-primary btn-addtocart js-open-aside"
                  >
                    {isAddedToCartProducts(quickViewItem.product_id)
                      ? "Already Added"
                      : "Add To Cart"}
                  </button>
                </div>
                }
              </form>
              <div className="product-single__addtolinks">
                {/* <Link
                  href="#"
                  className={`menu-link menu-link_us-s add-to-wishlist  ${
                    isAddedtoWishlist(quickViewItem.product_id) ? "active" : ""
                  }`}
                  onClick={() => toggleWishlist(quickViewItem.product_id)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <use href="#icon_heart" />
                  </svg>
                  <span>Add to Wishlist</span>
                </Link> */}
                <ShareComponent title={he.decode(quickViewItem.product_name)} />
              </div>
              {/* <div className="product-single__meta-info mb-0">
                <div className="meta-item">
                  <label>SKU:</label>
                  <span>N/A</span>
                </div>
                <div className="meta-item">
                  <label>Categories:</label>
                  <span>Casual & Urban Wear, Jackets, Men</span>
                </div>
                <div className="meta-item">
                  <label>Tags:</label>
                  <span>biker, black, bomber, leather</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
