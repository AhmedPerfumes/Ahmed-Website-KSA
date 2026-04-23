"use client";

import { products54 } from "@/data/products/fashion";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations} from "next-intl";
import { useMenu } from '@/context/MenuContext';

export default function Style2({ category, subcategory, products: initialProducts }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const t=useTranslations();
  const [products, setProducts] = useState(() => {
    const list = [...initialProducts];
    const indexToPin = 1;
    const newLaunchIndex = list.findIndex(p => p.collection_name === 'New Launch');
    if (newLaunchIndex > -1) {
      const [pinned] = list.splice(newLaunchIndex, 1);
      list.splice(indexToPin, 0, pinned);
    }
    return list;
  })

  useEffect(() => {
    const list = [...initialProducts];
    const indexToPin = 1;
    const newLaunchIndex = list.findIndex(p => p.collection_name === 'New Launch');
    if (newLaunchIndex > -1) {
      const [pinned] = list.splice(newLaunchIndex, 1);
      list.splice(indexToPin, 0, pinned);
    }
    setProducts(list);

    const fetchLiveStatus = async () => {
      try {
        const productIds = list.map((p) => p.product_id);
        if (productIds.length === 0) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/live-status`, {
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_ids: productIds})
        });

        if(!response.ok) return;

        const liveData = await response.json();

        setProducts((prevProducts) => {
          return prevProducts.map((prevProd) => {
            const liveMatch = liveData.find((l) => l.product_id === prevProd.product_id)

            if(liveMatch) {
              return {
                ...prevProd,
                product_qty: liveMatch.product_qty,
                price: liveMatch.price,
                sale_price: liveMatch.sale_price,
                discount: liveMatch.discount,
                maximum_order_quantity: liveMatch.maximum_order_quantity
              };
            }
            return prevProd;
          });
        });
      } catch (error) {
        console.error("Failed to hydrate live product data", error);
      }
    };

    fetchLiveStatus();
  }, [initialProducts]);

  function capitalizeEachWord(str) {
    return str.split(' ') // Split the sentence into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
              .join(' '); // Join the words back into a sentence
  }

  // "WARNING: If you change this logic, update the corresponding PHP/JS file."
  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str?.replace(/&amp;/g, "");

    // Remove all special characters
    cleanedStr = cleanedStr?.replace(/[^\w\s-]/g, "");

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr?.replace(/\s+/g, " ").trim();

    return cleanedStr;
  }

  let subcat = "";
  if (subcategory != null) {
    subcat =
      removeSpecialCharactersAndAmp(subcategory)
        .split(" ")
        .join("-")
        .toLowerCase();
  } else {
    console.log(removeSpecialCharactersAndAmp(category));
    if (removeSpecialCharactersAndAmp(category) == "gift-sets") {
      subcat = "gift-sets";
    } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
      subcat = "hair-mist";
    } else if (removeSpecialCharactersAndAmp(category) == "xtrait-de-parfum") {
      subcat = "extrait-de-parfum";
    } else {
      subcat = "online-exclusive";
    }
  }

  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { addProductToQuickView } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const price = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        if(elm.discount.discount_type == "percent") {
          return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}{ currency.symbol }</span></>;
        } else if(elm.discount.discount_type == "amount") {
          return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - elm.discount.value).toFixed(2)}{ currency.symbol }</span></>;
        }
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } 
    // else if(elm?.sale_price) {
    //   return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {((elm.sale_price)).toFixed(2)}{ currency.symbol }</span></>;
    // } 
    else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  return (
    <div
      className="products-grid row row-cols-2 row-cols-md-3 row-cols-lg-3"
      id="products-grid-2"
    >
      {products.map((elm, i) => (
        <div key={i} className="product-card-wrapper">
          <div className="product-card mb-3 mb-md-4 mb-xxl-5">
            <div className={i != 1 ? "pc__img-wrapper" : ""}>
              {i != 1 ? (
                <Swiper
                  slidesPerView={1}
                  className="swiper-container background-img js-swiper-slider"
                  modules={[Navigation]}
                  id={`style-2${elm?.product_id.toString()}`}
                  navigation={{
                    prevEl: `#style-2${elm?.product_id.toString()} .pc__img-prev`,
                    nextEl: `#style-2${elm?.product_id.toString()} .pc__img-next`,
                  }}
                >
                  <SwiperSlide key={i} className="swiper-slide">
                    <Link
                      href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                        category
                      )}/${subcat}/${removeSpecialCharactersAndAmp(
                        elm.product_name
                      )
                        .split(" ")
                        .join("-")
                        .toLowerCase()}`}
                    >
                      {elm?.images &&
                        // JSON.parse(elm.images).map((image, ind) => (
                            <>
                              {JSON.parse(elm.images)[0] && <Image
                                loading="lazy"
                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                                width="330"
                                height="400"
                                alt="img"
                                className="pc__img"
                              />
                              }

                              {JSON.parse(elm.images)[1] && <Image
                                loading="lazy"
                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                                width="330"
                                height="400"
                                alt="img"
                                className="pc__img pc__img-second"
                              />
                              }
                            </>
                        // ))
                        }
                      </Link>
                      {elm?.label_name && (
                        <div
                          style={{ backgroundColor: elm.label_color }}
                          className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2"
                        >
                          {elm?.label_name}
                        </div>
                      )}
                      {elm.product_qty <= 0 ? (
                        <div style={{ backgroundColor: '#dc3545' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                          {t("Out Of Stock")}
                        </div>
                      ) : (
                       elm.discount && elm. discount.discount_type == 'percent' && (
                          <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            Sale {elm.discount.value}%
                          </div>
                        )
                      )}
                      </SwiperSlide>

                  {i != 1 ? (
                    <>
                      <span className="cursor-pointer pc__img-prev">
                        <svg
                          width="7"
                          height="11"
                          viewBox="0 0 7 11"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <use href="#icon_prev_sm" />
                        </svg>
                      </span>
                      <span className="cursor-pointer pc__img-next">
                        <svg
                          width="7"
                          height="11"
                          viewBox="0 0 7 11"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <use href="#icon_next_sm" />
                        </svg>
                      </span>
                    </>
                  ) : null}
                </Swiper>
              ) : (
                <>
                  <Link
                    href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                      category
                    )}/${subcat}/${removeSpecialCharactersAndAmp(
                      elm.permalink?.key
                    )?.toLowerCase()}`}
                  >
                    <Image
                      loading="lazy"
                      src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`}
                      width="500"
                      height="0"
                      layout="intrinsic"
                      className=""
                      alt="image"
                    />
                  </Link>
                  <div className="content_abs content_bottom content_left content_bottom-lg content_left-lg">
                    <h2 className="fs-30 fw-normal text-uppercase mb-0 text-white cat-title">
                      {elm?.product_name && he.decode (elm?.product_name)}
                    </h2>
                    <p className="mb-4 text-white">{t("Exclusive Launch")}</p>
                    <Link
                      className="btn btn-outline-primary rounded-pill border-0 fs-base text-uppercase fw-medium btn-45 d-inline-flex align-items-center"
                      href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                        category
                      )}/${subcat}/${removeSpecialCharactersAndAmp(
                        elm.permalink?.key
                      )?.toLowerCase()}`}
                    >
                      <span>Explore</span>
                    </Link>
                  </div>
                </>
              )}
              {i != 1 ? (
                <div className="anim_appear-bottom position-absolute bottom-0 start-0 w-100 d-none d-sm-flex align-items-center">
                  {isAddedToCartProducts(elm?.product_id)
                    ? elm.product_qty > 0 && (
                        <button
                          className="btn btn-primary flex-grow-1 fs-base ps-3 ps-xxl-4 pe-0 border-0 text-uppercase fw-medium"
                          title="Already Added"
                        >
                          {t("Already Added")}
                        </button>
                      )
                    : elm?.product_qty > 0 && (
                        <button
                          className="btn btn-primary flex-grow-1 fs-base ps-3 ps-xxl-4 pe-0 border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                          onClick={() => addProductToCart({...elm, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcat.split('-').join(' '))})}
                          title="Add to Cart"
                        >
                          {t("Add To Cart")}
                        </button>
                      )}
                  <button
                    className="btn btn-primary flex-grow-1 fs-base ps-0 pe-3 pe-xxl-4 border-0 text-uppercase fw-medium js-quick-view"
                    data-bs-toggle="modal"
                    data-bs-target="#quickView"
                    title="Quick view"
                    onClick={() => addProductToQuickView({...elm, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcat.split('-').join(' '))})}
                  >
                    {t("Quick View")}
                  </button>
                </div>
              ) : null}
              {/* {i != 1 ? (
                <button
                  className={`pc__btn-wl position-absolute bg-body rounded-circle border-0 text-primary js-add-wishlist ${
                    isAddedtoWishlist(elm.product_id) ? "active" : ""
                  }`}
                  onClick={() => toggleWishlist(elm)}
                  title="Add To Wishlist"
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
                </button>
              ) : null} */}
            </div>
            {i != 1 ? (
              <div className="pc__info position-relative">
                {/* <p className="pc__category text-beige">{elm.category}</p> */}
                <h6 className="pc__title">
                  <Link
                    href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                      category
                    )}/${subcat}/${removeSpecialCharactersAndAmp(
                      elm?.product_name
                    )
                      ?.split(" ")
                      .join("-")
                      .toLowerCase()}`}
                  >
                     {
                      locale == 'ar' ? elm?.product_name_ar : he.decode(elm?.product_name)
                    }
                    {/* {elm?.product_name && t(he.decode(elm?.product_name))} */}
                  </Link>
                </h6>
                <div className="product-card__price d-flex">
                  { price(elm) }
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
