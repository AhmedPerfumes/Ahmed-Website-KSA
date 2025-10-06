"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from 'he';
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from '@/context/MenuContext';

import { renderPrice } from "@/utlis/priceRenderer";

export default function ItemFamilySlider({ product, itemFamilyProds }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const t = useTranslations();
  const tp = useTranslations('ProductDetails');
  const swiperOptions = {
    autoplay: false,
    slidesPerView: 4,
    slidesPerGroup: 4,
    effect: "none",
    loop: true,
    modules: [Pagination, Navigation],
    pagination: {
      el: "#item_family_products .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".ssn-family",
      prevEl: ".ssp-family",
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
        spaceBetween: 24,
      },
      992: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        spaceBetween: 30,
      },
    },
  };

  function removeSpecialCharactersAndAmp(str) {
    let cleanedStr = str.replace(/&amp;/g, '');
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');
    cleanedStr = cleanedStr.replace(/\s+/g, ' ').trim();
    return cleanedStr;
  }

  const isSubcategory = (category, subcategory) => {
    let subcat = "";
    if (subcategory != null) {
      return subcat =
        removeSpecialCharactersAndAmp(subcategory.subcategory_name)
          .split(" ")
          .join("-")
          .toLowerCase();
    } else {
      if (removeSpecialCharactersAndAmp(category) == "gift-sets") {
        return subcat = "gift-sets";
      } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
        return subcat = "hair-mist";
      } else if (removeSpecialCharactersAndAmp(category) == "extrait-de-parfum") {
        return subcat = "extrait-de-parfum";
      } else {
        return subcat = "online-exclusive";
      }
    }
  }

  // const price = (elm) => {
  //   // Current time is Tuesday, September 9, 2025 at 2:59 PM (GST - UAE time)
  //   const current_date_time = new Date('2025-09-09T14:59:00+04:00');

  //   if (elm?.discount) {
  //     if (current_date_time >= new Date(elm.discount.start_date) && current_date_time <= new Date(elm.discount.end_date)) {
  //       return <><span className="money price price-old">{elm?.price}{currency.symbol}</span> <span className="money price price-sale">{(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}{currency.symbol}</span></>;
  //     } else {
  //       return <span className="money price">{elm?.price}{currency.symbol}</span>;
  //     }
  //   } else if (elm?.sale_price) {
  //     return <><span className="money price price-old">{elm?.price}{currency.symbol}</span> <span className="money price price-sale">{(elm.sale_price).toFixed(2)}{currency.symbol}</span></>;
  //   } else {
  //     return <span className="money price">{elm?.price}{currency.symbol}</span>;
  //   }
  // };

  // ADDED: Validation to hide the component if there's no data
  if (!itemFamilyProds || itemFamilyProds.length === 0) {
    return null;
  }

  return (
    <section className="products-carousel container my-4">
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4 mt-4">
                {tp.rich("discoverMore", {
                    familyName: he.decode(product?.product_family),
                    // Tell the component how to render the <bold> tag
                    bold: (chunks) => <strong>{chunks}</strong>,
                })}
            </h2>

      <div id="item_family_products" className="position-relative">
        <Swiper
          {...swiperOptions}
          className="swiper-container js-swiper-slider"
          data-settings=""
        >
          {itemFamilyProds && itemFamilyProds.map((elm, i) => (
            <SwiperSlide key={i} className="swiper-slide product-card">
              <div className="pc__img-wrapper">
                <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                  {elm?.images && Array.isArray(elm.images) &&
                    <>
                      {elm.images[0] && <Image
                        loading="lazy"
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.images[0]}`}
                        width="330"
                        height="400"
                        alt="img"
                        className="pc__img"
                      />
                      }
                      {elm.images[1] && <Image
                        loading="lazy"
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.images[1]}`}
                        width="330"
                        height="400"
                        alt="img"
                        className="pc__img pc__img-second"
                      />
                      }
                    </>
                  }
                </Link>
                {elm?.label_name && (
                  <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                    {elm?.label_name}
                  </div>
                )}
                {elm.product_qty <= 0 ? (
                  <div style={{ backgroundColor: '#dc3545' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                    Out Of Stock
                  </div>
                ) : (
                  elm.discount && (
                    <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                      Sale {elm.discount.value}%
                    </div>
                  )
                )}
                {
                  isAddedToCartProducts(elm?.product_id) ?
                    elm.product_qty > 0 && <button
                      className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                      title="Already Added"
                    >
                      Already Added
                    </button> : elm.product_qty > 0 && <button
                      className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                      onClick={() => addProductToCart({ ...elm, category_name: elm.category_name, subcategory_name: elm.subcategory.subcategory_name })}
                      title="Add to Cart"
                    >
                      Add To Cart
                    </button>
                }
              </div>

              <div className="pc__info position-relative">
                <p className="pc__category">{t(elm.category_name)}</p>
                <h6 className="pc__title">
                  <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>{elm?.product_name && t(he.decode(elm?.product_name))}</Link>
                </h6>
                <div className="product-card__price d-flex">
                  {renderPrice(elm, currency)}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="cursor-pointer products-carousel__prev ssp-family position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_prev_md" />
          </svg>
        </div>
        <div className="cursor-pointer products-carousel__next ssn-family position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_next_md" />
          </svg>
        </div>

        <div className="products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center"></div>
      </div>
    </section>
  );
}