"use client";
import Link from "next/link";
import { slidesData3, slidesData33 } from "@/data/heroslides";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations();
  const swiperOptions = {
    autoplay: {
      delay: 5000,
    },
    modules: [Autoplay, EffectFade, Pagination],
    slidesPerView: 1,
    effect: "fade",
    loop: true,
    pagination: {
      el: ".slideshow-pagination",
      type: "bullets",
      clickable: true,
    },
  };
  return (
    <Swiper
      className="swiper-container js-swiper-slider slideshow minh-100 swiper-container-fade swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
      {...swiperOptions}
    >
      {slidesData33.map((elm, i) => (
        <SwiperSlide key={i} className="swiper-slide">
          <div className="overflow-hidden position-relative h-100">
            <div className="slideshow-bg">
              <Link href={`${locale}/${elm.href}`}>
                <Image
                  loading="lazy"
                  src={elm.imageSrc}
                  width="1903"
                  height="945"
                  alt="image"
                  className="slideshow-bg__img"
                />
              </Link>
            </div>
            <div className="slideshow-text container position-absolute start-50 top-50 translate-middle">
              {elm.id != 3 && <h6 className="text_dash text-uppercase fs-base fw-medium animate animate_fade animate_btt animate_delay-3 text-white">
                {t(elm.season)}
              </h6>}
              <h2 className="h1 fw-normal mb-0 animate animate_fade animate_btt animate_delay-5 text-white">
                {t(elm.title)}
              </h2>
              <h2 className="h1 fw-bold mb-2 animate animate_fade animate_btt animate_delay-5 text-white">
                {t(elm.subtitle)}
              </h2>
              {elm.id != 3 && <a
                href={`${locale}/${elm.href}`}
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7 text-white"
              >
                {t("Discover More")}
              </a>}
            </div>
          </div>
        </SwiperSlide>
      ))}
      {/* <!-- /.slideshow-wrapper js-swiper-slider --> */}

      {/* <div className="slideshow-pagination position-right-center type2 color-white position-right-2"></div> */}
      {/* <!-- /.products-pagination --> */}
      <a
        href="#footer"
        className="slideshow-scroll d-none d-xxl-block position-absolute end-0 bottom-0 text_dash text-white text-uppercase fw-medium mb-4 mb-xl-5 mx-xl-4"
      >
        Scroll
      </a>
    </Swiper>
  );
}
