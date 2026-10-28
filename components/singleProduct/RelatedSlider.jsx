"use client";
import { useContextElement } from "@/context/Context";
import { products51 } from "@/data/products/fashion";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from 'he';
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from '@/context/MenuContext';

export default function RelatedSlider({ relatedProds }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const t = useTranslations();
  const isAr = locale === "ar";
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const swiperOptions = {
    autoplay: false,
    slidesPerView: 4,
    slidesPerGroup: 4,
    effect: "none",
    loop: true,
    modules: [Pagination, Navigation],
    pagination: {
      el: "#related_products .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".ssn11",
      prevEl: ".ssp11",
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

  // "WARNING: If you change this logic, update the corresponding PHP/JS file."
  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
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
        console.log("gift-sets");
        return subcat = "gift-sets";
      } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
        console.log("hair-mist");
        return subcat = "hair-mist";
      } else {
        console.log("extrait-de-parfum");
        return subcat = "extrait-de-parfum";
      }
    }
  }

  const getCategoryName = (elm) => {
    if (isAr) {
      if (elm?.category_name_ar) return elm.category_name_ar;
      try {
        const tr = t(elm?.category_name);
        if (tr && tr !== elm?.category_name) return tr;
      } catch (_) {}
    }
    return elm?.category_name || "";
  };

  const getProductName = (elm) => {
    if (!elm) return "";
    const rawName = he.decode(elm.product_name || "");
    if (!isAr) return rawName;

    // 1. Direct from API fields (product_name_ar, name_ar, etc.)
    const apiArabic = elm.product_name_ar || elm.name_ar;
    if (apiArabic && typeof apiArabic === "string" && apiArabic.trim()) {
      return he.decode(apiArabic.trim());
    }

    // 2. Try translating via intl dictionary
    try {
      const candidates = [
        rawName,
        rawName.trim(),
        rawName.replace(/\s+/g, " ").trim(),
        rawName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
        rawName.toUpperCase().trim(),
        rawName.toLowerCase().trim(),
      ];

      for (const candidate of candidates) {
        if (!candidate) continue;
        const translated = t(candidate);
        if (translated && translated !== candidate) {
          return translated;
        }
      }
    } catch (_) {}

    return rawName;
  };

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
    else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  if (!relatedProds || relatedProds.length === 0) {
    return null;
  }

  return (
    <section className="products-carousel container">
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
        {isAr ? (
          <>
            {t("Products")} <strong>{t("Related")}</strong>
          </>
        ) : (
          <>
            {t("Related")} <strong>{t("Products")}</strong>
          </>
        )}
      </h2>

      <div id="related_products" className="position-relative">
        <Swiper
          {...swiperOptions}
          key={locale}
          dir={isAr ? "rtl" : "ltr"}
          className="swiper-container js-swiper-slider"
          data-settings=""
        >
          {relatedProds && relatedProds.map((elm, i) => {
            const prodName = getProductName(elm);

            return (
              <SwiperSlide key={i} className="swiper-slide product-card">
                <div className="pc__img-wrapper">
                  <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                    {elm?.images && (
                      <>
                        {JSON.parse(elm.images)[0] && (
                          <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                            width="330"
                            height="400"
                            alt={prodName || "product image"}
                            className="pc__img"
                          />
                        )}

                        {JSON.parse(elm.images)[1] && (
                          <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                            width="330"
                            height="400"
                            alt={prodName || "product image"}
                            className="pc__img pc__img-second"
                          />
                        )}
                      </>
                    )}
                  </Link>
                  {elm?.label_name && (
                    <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                      { isAr ? (elm?.label_name_ar || (t.has && t.has(elm?.label_name) ? t(elm.label_name) : elm?.label_name)) : elm?.label_name }
                    </div>
                  )}
                  {elm.product_qty <= 0 ? (
                    <div style={{ backgroundColor: '#dc3545' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                      {t("Out Of Stock")}
                    </div>
                  ) : (
                    elm.discount && elm.discount.discount_type == 'percent' && (
                      <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                        {isAr ? `${elm.discount.value}% ${t("Sale")}` : `${t("Sale")} ${elm.discount.value}%`}
                      </div>
                    )
                  )}
                  {
                    isAddedToCartProducts(elm?.product_id) ? 
                    elm.product_qty > 0 && (
                      <button
                        className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        title={t("Already Added")}
                      >
                        {t("Already Added")}
                      </button>
                    ) : elm.product_qty > 0 && (
                      <button
                        className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        onClick={() => addProductToCart({...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name})}
                        title={t("Add To Cart")}
                      >
                        {t("Add To Cart")}
                      </button>
                    )
                  }
                </div>

                <div className="pc__info position-relative">
                  <p className="pc__category">{getCategoryName(elm)}</p>
                  <h6 className="pc__title">
                    <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                      {prodName}
                    </Link>
                  </h6>
                  <div className="product-card__price d-flex">
                    { price(elm) }
                  </div>
                </div>
              </SwiperSlide>
            );
          })}

          {/* <!-- /.swiper-wrapper --> */}
        </Swiper>
        {/* <!-- /.swiper-container js-swiper-slider --> */}

        <div
          className="cursor-pointer products-carousel__prev ssp11 position-absolute top-50 d-flex align-items-center justify-content-center"
          aria-label={t("Previous")}
          title={t("Previous")}
        >
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
        <div
          className="cursor-pointer products-carousel__next ssn11 position-absolute top-50 d-flex align-items-center justify-content-center"
          aria-label={t("Next")}
          title={t("Next")}
        >
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
    </section>
  );
}
