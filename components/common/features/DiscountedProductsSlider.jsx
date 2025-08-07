"use client";
import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import Pagination1 from "../Pagination1";
import { useLocale } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import Link from "next/link";

export default function DiscountedProductsSlider({
  title,
  onlyDiscounted = false,
}) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const {
    toggleWishlist,
    isAddedtoWishlist,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/allProducts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: 1, limit: 1000 }), // You can adjust this limit if needed
        });
        const result = await response.json();
        setProducts(result.data || []);
      } catch (error) {
        console.error("Failed to fetch all products", error);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, []);

  const removeSpecialCharactersAndAmp = (str) => {
    return str
      ?.replace(/&amp;/g, "")
      ?.replace(/[^\w\s-]/g, "")
      ?.replace(/\s+/g, " ")
      ?.trim();
  };
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
        // console.log("gift-sets");
        return subcat = "gift-sets";
      } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
        // console.log("hair-mist");
        return subcat = "hair-mist";
      } else if (removeSpecialCharactersAndAmp(category) == "extrait-de-parfum") {
        return subcat = "extrait-de-parfum";
      } else {
        return subcat = "online-exclusive";
      }
    }
  }

  const price = (elm) => {
    const currentGST = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);

    if (elm?.discount) {
      const start = new Date(elm.discount.start_date);
      const end = new Date(elm.discount.end_date);
      if (currentGST >= start && currentGST <= end) {
        const discounted = (elm.price - (elm.price * elm.discount.value) / 100).toFixed(2);
        return (
          <>
            <span className="money price price-old">{elm.price}{currency.symbol}</span>
            <span className="money price price-sale">{discounted}{currency.symbol}</span>
          </>
        );
      }
    } else if (elm?.sale_price) {
      return (
        <>
          <span className="money price price-old">{elm.price}{currency.symbol}</span>
          <span className="money price price-sale">{elm.sale_price.toFixed(2)}{currency.symbol}</span>
        </>
      );
    }

    return <span className="money price">{elm.price}{currency.symbol}</span>;
  };

  const filteredProducts = products
    .filter((p) => p.product_qty > 0)
    .filter((p) => !onlyDiscounted || (p.discount && p.discount.value > 0));

  if (loading || isMenuLoading) return <Pagination1 />;
  if (isMenuError) return <div>Error loading menu</div>;

  return (
    <section className="products-carousel container">
      <h2 className="section-title fw-normal text-center mb-3 pb-xl-3 mb-xl-3">
        {title}
      </h2>
      <Swiper
        className="swiper-container js-swiper-slider"
        {...{
          autoplay: { delay: 5000 },
          slidesPerView: 5,
          slidesPerGroup: 5,
          modules: [Autoplay, Navigation, Pagination],
          pagination: {
            el: "#collections-tab-1 .products-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: "#collections-tab-1 .products-carousel__next",
            prevEl: "#collections-tab-1 .products-carousel__prev",
          },
          breakpoints: {
            320: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
            992: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 24 },
            1200: { slidesPerView: 5, slidesPerGroup: 1, spaceBetween: 28 },
          },
        }}
      >
        {filteredProducts.map((elm, i) => (
          <SwiperSlide key={i} className="swiper-slide product-card">
            <div className="pc__img-wrapper">
            <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                {JSON.parse(elm.images)[0] && (
                  <Image
                    loading="lazy"
                    src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                    width="260"
                    height="315"
                    alt={elm.product_name}
                    className="pc__img"
                  />
                )}
                {JSON.parse(elm.images)[1] && (
                  <Image
                    loading="lazy"
                    src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                    width="260"
                    height="315"
                    alt={elm.product_name}
                    className="pc__img pc__img-second"
                  />
                )}
              </Link>

              {elm?.label_name && (
                <div style={{ backgroundColor: elm.label_color }} className="product-label text-white right-0 top-0 left-auto mt-2 mx-2">
                  {elm.label_name}
                </div>
              )}

              {elm.product_qty <= 0 ? (
                <div className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2" style={{ backgroundColor: "#dc3545" }}>
                  Out Of Stock
                </div>
              ) : elm.discount && (
                <div className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2" style={{ backgroundColor: "#198754" }}>
                  Sale {elm.discount.value}%
                </div>
              )}

              {elm.product_qty > 0 && (
                <button
                  className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                  onClick={() => {
                    if (!isAddedToCartProducts(elm.product_id)) {
                      addProductToCart({
                        ...elm,
                        category_name: elm.category_name,
                        subcategory_name: elm.subcategory,
                      });
                    }
                  }}
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
              )}
            </div>

            <div className="pc__info position-relative">
              <h6 className="pc__title">
              <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                  {elm?.product_name && he.decode(elm.product_name)}
                </Link>
              </h6>
              <div className="product-card__price d-flex">
                {price(elm)}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
