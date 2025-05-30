"use client";
import Link from "next/link";
import {
    categories8,
    categories88,
    categoriesTop,
    categoriesInfluencers,
} from "@/data/categories";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function Categories({ section }) {
    const t = useTranslations();
    const locale = useLocale();
    const swiperOptions = {
        autoplay: {
            delay: 5000,
        },
        modules: [Autoplay, Navigation],
        slidesPerView: 4,
        slidesPerGroup: 4,
        effect: "none",
        loop: false,
        // pagination: {
        //   el: ".swiper-pagination",
        //   clickable: true,
        // },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        grabCursor: true,
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
                slidesPerView: 5,
                slidesPerGroup: 1,
                spaceBetween: 30,
            },
        },
    };

    let categoryRend;

    const renderSlides = (categories) =>
        categories.map((elm, i) => (
            <SwiperSlide key={i} className="swiper-slide">
                <Link
                    href={`${locale}${elm.link}`}
                    className="menu-link h6 fw-medium"
                >
                    <video
                        loading="lazy"
                        className="w-100 mb-3"
                        width="330"
                        height="400"
                        style={{ height: "fit-content" }}
                        muted
                        loop
                        onMouseOver={(event) => event.target.play()}
                        onMouseOut={(event) => event.target.pause()}
                        preload="none"
                        poster={elm.imgSrc2}
                    >
                        <source type="video/mp4" src={elm.videoSrc} />
                    </video>
                </Link>
                <div className="text-center">
                    <Link
                        href={`${locale}${elm.link}`}
                        className="menu-link h6 fw-medium"
                    >
                        {t(elm.altText)}
                        <br />
                        <span className="fs-14 text-secondary fst-italic">
                            {t(elm.subText)}
                        </span>
                    </Link>
                </div>
                <div className="d-flex justify-content-center">
                    <Link
                        href={`/${locale}${elm.btn}`}
                        className="btn-videos btn-link_lg text-uppercase fw-medium "
                    >
                        {t("Shop Now")}
                    </Link>
                </div>
            </SwiperSlide>
        ));

    if (section === "section3") {
        categoryRend = (
            <Swiper className="swiper-container" {...swiperOptions}>
                {renderSlides(categories8)}
                <div className="swiper-pagination"></div>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
            </Swiper>
        );
    } else if (section === "section4") {
        categoryRend = (
            <>
                <h2 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-2">
                    {t("Iconic Indulgence")}
                </h2>
                <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center section-paragraph">
                    {t(
                        "See luxury in motion through the eyes of those who know it best"
                    )}
                </p>
                <Swiper className="swiper-container" {...swiperOptions}>
                    {renderSlides(categories88)}
                    <div className="swiper-pagination"></div>
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                </Swiper>
            </>
        );
    } else if (section === "sectionTop") {
        categoryRend = (
            <>
                <h2 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-2">
                    {t("Cherished by All")}
                </h2>
                <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center section-paragraph">
                    {t(
                        "Long-lasting fragrance in every drop"
                    )}
                </p>
                <Swiper className="swiper-container" {...swiperOptions}>
                    {renderSlides(categoriesTop)}
                    <div className="swiper-pagination"></div>
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                </Swiper>
            </>
        );
    } else {
        categoryRend = (
            <>
                <h2 className="section-title text-uppercase fs-25 fw-medium text-center mb-2">
                    {t("Luxury Delight")}
                </h2>
                <p className="fs-15 mb-4 pb-xl-2 mb-xl-4 text-secondary text-center">
                    {t("Modern elegance meets Middle Eastern tradition")}
                </p>
                <Swiper className="swiper-container" {...swiperOptions}>
                    {renderSlides(categoriesInfluencers)}
                    <div className="swiper-pagination"></div>
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                </Swiper>
            </>
        );
    }

    return (
        <section className="category-carousel container position-relative">
            <div className="slider-shadow-left"></div>
            {categoryRend}
            <div className="slider-shadow-right"></div>
        </section>
    );
}