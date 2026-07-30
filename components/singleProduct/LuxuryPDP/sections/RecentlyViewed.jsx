"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * RecentlyViewed — Section 14
 *
 * Reads from localStorage key "ahmed_recently_viewed".
 * This component also WRITES the current product to the list on mount.
 * Uses Swiper slider, matching ItemFamilySlider card UI exactly.
 *
 * localStorage item format:
 *   [{ product_id, product_name, slug, category, subcategory, image, price }]
 *
 * Max 10 items stored. Current product is excluded from display.
 * Purely client-side — no SSR, no API call.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const STORAGE_KEY = "ahmed_recently_viewed";
const MAX_ITEMS = 10;

const RecentlyViewed = ({ product, category, subcategory }) => {
  const locale = useLocale();
  const [viewed, setViewed] = useState([]);

  useEffect(() => {
    if (!product?.product_id) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      // Remove duplicates of current product
      const filtered = existing.filter(
        (item) => item.product_id !== product.product_id
      );

      // Persist current product to the list
      const images = product?.images
        ? (typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images)
        : [];

      const entry = {
        product_id: product.product_id,
        product_name: product.product_name,
        slug: product.slug || product.product_name?.toLowerCase().replace(/ /g, "-"),
        // Store the URL-safe slugs passed from the route (not the raw API names)
        category_slug: category || product.category_name?.toLowerCase().replace(/\s+/g, "-") || "perfumes",
        subcategory_slug: subcategory || product.subcategory?.subcategory_name?.toLowerCase().replace(/\s+/g, "-") || "online-exclusive",
        image: images[0] || null,
        price: product.price,
        discount: product.discount || null,
      };

      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Display: everything except current product
      setViewed(filtered.slice(0, 8));
    } catch (_) {
      // localStorage unavailable — fail silently
    }
  }, [product?.product_id]);

  if (viewed.length === 0) return null;

  const swiperOptions = {
    slidesPerView: 2,
    spaceBetween: 14,
    loop: viewed.length > 4,
    modules: [Navigation, Pagination],
    pagination: {
      el: ".rv-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".rv-next",
      prevEl: ".rv-prev",
    },
    breakpoints: {
      576: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      992: { slidesPerView: 4, spaceBetween: 24 },
      1400: { slidesPerView: 5, spaceBetween: 28 },
    },
  };

  return (
    <section className="products-carousel container my-4 pdp-rv-section" aria-labelledby="rv-heading">
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4 mt-4" id="rv-heading">
        Recently Viewed
      </h2>

      <div className="position-relative" id="rv-slider">
        <Swiper {...swiperOptions} className="swiper-container js-swiper-slider">
          {viewed.map((item, idx) => {
            const href = `/${locale}/shop/${item.category_slug || item.category || "perfumes"}/${item.subcategory_slug ||
              (typeof item.subcategory === "object"
                ? item.subcategory?.subcategory_name?.toLowerCase().replace(/\s+/g, "-")
                : item.subcategory) || "online-exclusive"}/${item.slug}`;

            const imgSrc = item.image
              ? `${API_URL}storage/${item.image}`
              : "/assets/images/general_product.png";

            return (
              <SwiperSlide key={idx} className="swiper-slide product-card">
                <div className="pc__img-wrapper">
                  <Link href={href}>
                    <Image
                      loading="lazy"
                      src={imgSrc}
                      width={330}
                      height={400}
                      alt={item.product_name || "Recently viewed product"}
                      className="pc__img"
                    />
                  </Link>
                </div>

              <div className="pc__info position-relative">
                  <p className="pc__category">{locale === "ar" ? "" : "Recently Viewed"}</p>
                  <h6 className="pc__title">
                    <Link href={href}>{item.product_name}</Link>
                  </h6>
                  <div className="product-card__price d-flex align-items-baseline" style={{ gap: '6px', flexWrap: 'wrap' }}>
                    {(() => {
                      const now = new Date();
                      const d = item.discount;
                      if (d && new Date(d.start_date) <= now && new Date(d.end_date) >= now) {
                        let salePrice;
                        let label;
                        if (d.discount_type === "percent") {
                          salePrice = (item.price - (item.price / 100) * d.value).toFixed(2);
                          label = `${d.value}% OFF`;
                        } else {
                          salePrice = parseFloat(d.final_price || item.price - d.value).toFixed(2);
                          label = `${d.value} OFF`;
                        }
                        return (
                          <>
                            <span className="money price" style={{ color: '#9E7A42', fontWeight: 600 }}>
                              SAR {salePrice}
                            </span>
                            <span className="money price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', fontWeight: 400 }}>
                              SAR {parseFloat(item.price).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '0.65em', background: '#EAF5EE', color: '#2A7A52', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', letterSpacing: '0.05em' }}>
                              {label}
                            </span>
                          </>
                        );
                      }
                      return (
                        <span className="money price">
                          {item.price ? `SAR ${parseFloat(item.price).toFixed(2)}` : ""}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation arrows - matching products-carousel style */}
        <div className="cursor-pointer rv-prev products-carousel__prev position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <use href="#icon_prev_md" />
          </svg>
        </div>
        <div className="cursor-pointer rv-next products-carousel__next position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <use href="#icon_next_md" />
          </svg>
        </div>

        {/* Pagination */}
        <div className="rv-pagination products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center" />
      </div>
    </section>
  );
};

export default RecentlyViewed;
