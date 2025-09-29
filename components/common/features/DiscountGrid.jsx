"use client";
import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import Pagination1 from "../Pagination1";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import Link from "next/link";

function DiscountGrid({ title, onlyDiscounted = false }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedColView, setSelectedColView] = useState(3);
  const [page, setPage] = useState(1);
  const perPage = 9; // ✅ Always show 10 products
  const t = useTranslations();

  useEffect(() => {
    const getAllProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 1, limit: 1000 }), // ✅ Fetch all once
          }
        );
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

  const removeSpecialCharactersAndAmp = (str) =>
    str?.replace(/&amp;/g, "")
      ?.replace(/[^\w\s-]/g, "")
      ?.replace(/\s+/g, " ")
      ?.trim();

  const isSubcategory = (category, subcategory) => {
    if (subcategory) {
      return removeSpecialCharactersAndAmp(subcategory.subcategory_name)
        .split(" ")
        .join("-")
        .toLowerCase();
    }
    const clean = removeSpecialCharactersAndAmp(category);
    if (clean === "gift-sets") return "gift-sets";
    if (clean === "hair-mist") return "hair-mist";
    if (clean === "extrait-de-parfum") return "extrait-de-parfum";
    return "online-exclusive";
  };

  const discPrice = (elm) => {
    const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // GST
    const start = new Date(elm?.discount?.start_date);
    const end = new Date(elm?.discount?.end_date);

    if (elm?.discount && now >= start && now <= end) {
      const discounted = (
        elm.price -
        (elm.price * elm.discount.value) / 100
      ).toFixed(2);
      return (
        <>
          <span className="money price price-old">
            {elm.price}{currency.symbol}
          </span>
          <span className="money price price-sale">
            {discounted}{currency.symbol}
          </span>
        </>
      );
    } else if (elm?.sale_price) {
      return (
        <>
          <span className="money price price-old">
            {elm.price}{currency.symbol}
          </span>
          <span className="money price price-sale">
            {elm.sale_price.toFixed(2)}{currency.symbol}
          </span>
        </>
      );
    }
    return <span className="money price">{elm.price}{currency.symbol}</span>;
  };

  // ✅ Filter discounted/in-stock products
const filteredProducts = products
  .filter((p) => p.product_qty > 0)
  .filter(
    (p) =>
      p.sale_price !== null || (onlyDiscounted && p.discount && p.discount.value > 0)
  );

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const currentProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  if (loading || isMenuLoading) return <Pagination1 />;
  if (isMenuError) return <div>Error loading menu</div>;

  return (
    <section className="container py-4">
      <h2 className="section-title fw-normal text-center mb-4">{title}</h2>
      <div className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}>
        {currentProducts.map((elm, i) => (
          <div key={i} className="product-card-wrapper">
            <div className="product-card mb-3 mb-md-4 mb-xxl-5">
              <div className="pc__img-wrapper">
                <Swiper className="background-img" slidesPerView={1} navigation={false} modules={[Navigation]}>
                  {JSON.parse(elm.images).map((img, index) => (
                    <SwiperSlide key={index}>
                      <Link
                        href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(" ").join("-").toLowerCase()}/${isSubcategory(elm.category_name, elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(" ").join("-").toLowerCase()}`}
                      >
                        <Image
                          loading="lazy"
                          src={`${process.env.NEXT_PUBLIC_API_URL}storage/${img}`}
                          width="330"
                          height="400"
                          alt={elm.product_name}
                          className={`pc__img ${index === 1 ? "pc__img-second" : ""}`}
                        />
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {elm.label_name && (
                  <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-auto right-0 mt-2 mx-2">
                    {elm.label_name}
                  </div>
                )}

                {elm.product_qty <= 0 ? (
                  <div style={{ backgroundColor: "#dc3545" }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2 ">
                    Out Of Stock
                  </div>
                ) : (
                  elm.discount && (
                    <div style={{ backgroundColor: "#198754" }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                      Sale {elm.discount.value}%
                    </div>
                  )
                )}

                {elm.product_qty > 0 && (
                  <button
                    className="pc__atc btn anim_appear-bottom position-absolute border-0 text-uppercase fw-medium"
                    onClick={() =>
                      addProductToCart({
                        ...elm,
                        category_name: elm.category_name,
                        subcategory_name: elm.subcategory?.subcategory_name,
                      })
                    }
                    disabled={isAddedToCartProducts(elm.product_id)}
                  >
                    {t(isAddedToCartProducts(elm.product_id) ? "Already Added" : "Add To Cart")}
                  </button>
                )}
              </div>

              <div className="pc__info position-relative">
                <p className="pc__category">{t(elm.category_name)}</p>
                <h6 className="pc__title">
                  <Link
                    href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(" ").join("-").toLowerCase()}/${isSubcategory(elm.category_name, elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(" ").join("-").toLowerCase()}`}
                  >
                    {t(he.decode(elm.product_name))}
                  </Link>
                </h6>
                <div className="product-card__price d-flex">{discPrice(elm)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-outline-dark me-2"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <span className="align-self-center">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline-dark ms-2"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default DiscountGrid;
