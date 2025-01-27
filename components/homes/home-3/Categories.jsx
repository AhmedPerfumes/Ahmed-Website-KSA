"use client";
import { categories2 } from "@/data/categories";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Categories({ params, subCategories }) {

  const locale = useLocale();
  const categoryName = usePathname().split("/")[3];
  const t = useTranslations();

  const handleMouseOver = (e) => {
    const tooltip = document.getElementById("video-tooltip");
    const tooltipVideo = document.getElementById("tooltip-video");
    const videoSrc = e.target.getAttribute("data-video-src");
  

    if (tooltip && tooltipVideo) {
      tooltipVideo.querySelector("source").src = videoSrc;
      tooltipVideo.load();
      tooltip.classList.add("show");
      tooltip.style.display = "block";
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight}px`;
    }
  };

  const handleMouseOut = () => {
    const tooltip = document.getElementById("video-tooltip");

    if (tooltip) {
      tooltip.classList.remove("show");
      tooltip.style.display = "none";
    }
  };

  // useEffect(() => {
  //   document.addEventListener("mousemove", (e) => {
  //     const tooltip = document.getElementById("video-tooltip");
  //     if (tooltip && tooltip.classList.contains("show")) {
  //       tooltip.style.left = `${e.pageY}px`;
  //     }
  //   });
  // }, []);
  // // -----------

  const swiperOptions = {
    autoplay: {
      delay: 5000,
    },
    slidesPerView: 4,
    slidesPerGroup: 1,
    effect: "none",
    loop: true,
    modules: [Autoplay, Navigation],
    navigation: {
      nextEl: ".products-carousel__next-1",
      prevEl: ".products-carousel__prev-1",
    },
    breakpoints: {
      320: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        pagination: false,
      },
      768: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        pagination: false,
      },
      992: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        pagination: false,
      },
      1200: {
        slidesPerView: 5,
        slidesPerGroup: 0,
        pagination: false,
      },
    },
  };

  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, ' ').trim();

    return cleanedStr;
  }

  return (
    <section className="category-carousel container">
      <div className="position-relative">
        <Swiper {...swiperOptions} className="swiper-center swiper-container js-swiper-slider sub-cat-video">
          {subCategories?.map((elm, i) => (
            <SwiperSlide key={i} className="swiper-slide text-center">
              <Link
                key={i}
                href={`/${locale}/product-category/${removeSpecialCharactersAndAmp(categoryName)}/${removeSpecialCharactersAndAmp(elm.name).split(' ').join('-').toLowerCase()}`}
                className="shop-categories__item mb-3"
              >
                <video
                  loading="lazy"
                  width="200"
                  height="120"
                  className="shop-categories__item-img rounded-circle text-center"
                  autoPlay
                  loop
                  muted
                  data-video-src={`${process.env.NEXT_PUBLIC_API_URL}storage/${ elm.video}`}
                  onMouseOver={(e) => handleMouseOver(e)}
                  onMouseOut={handleMouseOut}
                >
                  <source src={`${process.env.NEXT_PUBLIC_API_URL}storage/${ elm.video}`} type="video/mp4" width={200} />
                </video>
              </Link>
              <div className="text-center">
                <Link
                  href={`/${locale}/product-category/${categoryName}/${elm.name.split(' ').join('-').toLowerCase()}`}
                  className="menu-link fw-medium"
                  key={i}
                >
                  {t(elm.name)}
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div id="video-tooltip" className="video-tooltip">
          <video id="tooltip-video" autoPlay loop muted>
            <source src="" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
