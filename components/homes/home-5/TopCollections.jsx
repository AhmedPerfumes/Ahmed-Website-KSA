"use client";
const filterCategories3 = ["Featured", "Popular", "Best Rated"];
import { useContextElement } from "@/context/Context";
import { products9 } from "@/data/products/fashion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from 'he';
import Pagination1 from "../../common/Pagination1";
import { useLocale } from "next-intl";
import { useMenu } from '@/context/MenuContext';
// import Pagination1 from "../../common/Pagination1";

export default function TopCollections() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const swiperOptions = {
    autoplay: {
      delay: 5000,
    },
    slidesPerView: 5,
    slidesPerGroup: 5,
    modules: [Autoplay, Navigation, Pagination],
    effect: "none",
    loop: false,
    pagination: {
      el: "#collections-tab-1 .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: "#collections-tab-1 .products-carousel__next",
      prevEl: "#collections-tab-1 .products-carousel__prev",
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        spaceBetween: 24,
        pagination: false,
      },
      1200: {
        slidesPerView: 5,
        slidesPerGroup: 1,
        spaceBetween: 28,
        pagination: false,
      },
    },
  };
  const [currentCategory, setCurrentCategory] = useState(filterCategories3[0]);
  const [filtered, setFiltered] = useState(products9);
  useEffect(() => {
    if (currentCategory == "All") {
      setFiltered(products9);
    } else {
      setFiltered([
        ...products9.filter((elm) => elm.filterCategory == currentCategory),
      ]);
    }
  }, [currentCategory]);

  useEffect(() => {
    const getExportProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/exportProducts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category_id: 19,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    getExportProducts();
  }, []);

  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str?.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr?.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr?.replace(/\s+/g, ' ').trim();

    return cleanedStr;
  }

  if (isMenuLoading) {
      return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  return loading ? <Pagination1 /> : (
    <div className="">
      <div className="mb-4 mb-xl-5 pt-1 pb-5"></div>

      <section className="products-carousel container">
        <h2 className="section-title fw-normal text-center mb-3 pb-xl-3 mb-xl-3">
          Our Top Collection
        </h2>

        {/* <ul
          className="nav nav-tabs mb-3 mb-xl-5 justify-content-center"
          id="collections-tab"
          role="tablist"
        >
          {filterCategories3.map((elm, i) => (
            <li
              onClick={() => setCurrentCategory(elm)}
              key={i}
              className="nav-item"
              role="presentation"
            >
              <a
                className={`nav-link nav-link_underscore ${
                  currentCategory == elm ? "active" : ""
                }`}
              >
                {elm}
              </a>
            </li>
          ))}
        </ul> */}

        <div className="tab-content" id="collections-tab-content">
          <div
            className="tab-pane fade show active"
            id="collections-tab-1"
            role="tabpanel"
            aria-labelledby="collections-tab-1-trigger"
          >
            <div className="position-relative">
              <Swiper
                className="swiper-container js-swiper-slider"
                {...swiperOptions}
              >
                {products.map((elm, i) => (
                  <SwiperSlide key={i} className="swiper-slide product-card">
                    <div className="pc__img-wrapper">
                      {/* {elm?.images && JSON.parse(elm.images).map((image, ind) => ( */}
                        <Link href={`/${locale}/shop/online-exclusive/online-exclusive/${removeSpecialCharactersAndAmp(elm?.product_name)?.split(' ').join('-').toLowerCase()}`}>
                        {JSON.parse(elm.images)[0] && <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                            width="260"
                            height="315"
                            alt="Cropped Faux leather Jacket"
                            className="pc__img"
                          />
                        }
                        {JSON.parse(elm.images)[1] && <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                            width="260"
                            height="315"
                            alt="Cropped Faux leather Jacket"
                            className="pc__img pc__img-second"
                          />
                        }
                        </Link>
                      {/* ))} */}
                      <button
                        className="pc__atc btn btn-lg anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        onClick={() => addProductToCart({...elm, category_name: 'Collections', subcategory_name: 'Online Exclusive'})}
                        title={
                          isAddedToCartProducts(elm.product_id)
                            ? "Already Added"
                            : "Add to Cart"
                        }
                      >
                        {isAddedToCartProducts(elm.product_id)
                          ? "Already Added"
                          : "Add To Cart"}
                      </button>
                      {/* <div className="anim_appear-right position-absolute top-0 mt-2 me-2">
                        <button
                          className="btn btn-round-sm btn-hover-red d-block border-0 text-uppercase mb-2 js-quick-view"
                          data-bs-toggle="modal"
                          data-bs-target="#quickView"
                          onClick={() => setQuickViewItem(elm)}
                          title="Quick view"
                        >
                          <svg
                            className="d-inline-block"
                            width="14"
                            height="14"
                            viewBox="0 0 18 18"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <use href="#icon_view" />
                          </svg>
                        </button>
                        <button
                          className={`btn btn-round-sm btn-hover-red d-block border-0 text-uppercase js-add-wishlist ${
                            isAddedtoWishlist(elm.product_id) ? "active" : ""
                          }`}
                          onClick={() => toggleWishlist(elm.product_id)}
                          title="Add To Wishlist"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <use href="#icon_heart" />
                          </svg>
                        </button>
                      </div> */}
                    </div>

                    <div className="pc__info position-relative">
                      {/* <p className="pc__category">{elm.category}</p> */}
                      <h6 className="pc__title">
                      <Link href={`/${locale}/shop//online-exclusive/online-exclusive/${removeSpecialCharactersAndAmp(elm?.product_name)?.split(' ').join('-').toLowerCase()}`}>{elm?.product_name && he.decode(elm?.product_name)}</Link>
                      </h6>
                      <div className="product-card__price d-flex">
                        {elm.priceOld && (
                          <>
                            <span className="money price price-old">
                              {elm.priceOld}{ currency.symbol }
                            </span>
                            <span className="money price price-sale">
                              {elm.price}{ currency.symbol }
                            </span>
                          </>
                        )}
                        {!elm.priceOld && (
                          <span className="money price">{elm.price}{ currency.symbol }</span>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}

                {/* <!-- /.swiper-wrapper --> */}
              </Swiper>
              {/* <!-- /.swiper-container js-swiper-slider --> */}

              <div className="cursor-pointer products-carousel__prev type2 position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_prev_md" />
                </svg>
              </div>
              {/* <!-- /.products-carousel__prev --> */}
              <div className="cursor-pointer products-carousel__next type2 position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_next_md" />
                </svg>
              </div>
              {/* <!-- /.products-carousel__next --> */}

              <div className="products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center"></div>
              {/* <!-- /.products-pagination --> */}
            </div>
            {/* <!-- /.position-relative --> */}
          </div>

          {/* <!-- /.tab-pane fade show--> */}
        </div>
        {/* <!-- /.tab-content pt-2 --> */}
      </section>
      {/* <!-- /.products-grid --> */}

      <div className="pt-1 pb-5"></div>
    </div>
  );
}
