"use client";
import { slides6 } from "@/data/heroslides";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { socialLinks } from "@/data/socials";
import { useLocale, useTranslations } from "next-intl";

export default function Hero() {
    const locale = useLocale();
    const t = useTranslations();
    const swiperOptions = {
        autoplay: {
            delay: 5000,
        },
        modules: [Autoplay, Navigation, Pagination, EffectFade],
        navigation: {
            nextEl: ".slideshow__next",
            prevEl: ".slideshow__prev",
        },
        pagination: {
            el: ".slideshow-pagination",
            type: "bullets",
            clickable: true,
        },
        slidesPerView: 1,
        effect: "fade",
        loop: true,
    };
    return (
        <Swiper
            className="swiper-container js-swiper-slider slideshow swiper-container-fade swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
            {...swiperOptions}
        >
            {slides6.map((elm, i) => (
                <SwiperSlide key={i} className="swiper-slide ">
                    {/* <div className="overflow-hidden position-relative h-100">
                        <div className="slideshow-bg">
                            <Image
                                loading="lazy"
                                src={elm.imgSrc}
                                width="1903"
                                height="945"
                                alt="Pattern"
                                className="slideshow-bg__img object-fit-cover"
                            />
                        </div>
                        <div className="slideshow-text container position-absolute start-50 top-50 text-center translate-middle">
                            <h2 className="h1 fw-normal color-white mb-4 animate animate_fade animate_btt animate_delay-5">
                                {elm.title.split(" ").slice(0, 4).join(" ")}
                                <br />
                                {elm.title.split(" ").slice(4).join(" ")}
                            </h2>
                            <div className="d-flex align-items-center justify-content-center gap-4">
                                <Link
                                    href="/shop"
                                    className="btn-link btn-link_lg color-white fw-medium animate animate_fade animate_btt animate_delay-7"
                                >
                                    Shop Women
                                </Link>
                                <Link
                                    href="/shop"
                                    className="btn-link btn-link_lg color-white fw-medium animate animate_fade animate_btt animate_delay-7"
                                >
                                    Shop Men
                                </Link>
                            </div>
                        </div>
                    </div> */}
                    <div className="overflow-hidden position-relative h-100">
                        <div className="best-sellers h-100 d-flex  align-items-center gap-4">
                            {/* Text Section */}
                            <div className="best-sellers-text text-center text-lg-start">
                                <h2 className="h1 fw-normal mb-4 animate animate_fade animate_btt animate_delay-5">
                                    {elm.title.split(" ").slice(0, 4).join(" ")}
                                    <br />
                                    {elm.title.split(" ").slice(4).join(" ")}
                                </h2>
                                <p>
                                    <span
                                        style={{
                                            color: "#bb8c1c",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {t("Top Notes: ")}
                                    </span>
                                    {t("GERANIUM LEATHER")}
                                </p>
                                <p>
                                    <span
                                        style={{
                                            color: "#bb8c1c",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {t("Heart Notes: ")}
                                    </span>
                                    {t("CEDARWOOD PATCHOULI")}
                                </p>
                                <p>
                                    <span
                                        style={{
                                            color: "#bb8c1c",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {t("Base Notes: ")}
                                    </span>
                                    {t("MOSS MUSK AMBER SANDALWOOD")}
                                </p>
                                <Link
                                    href="/shop"
                                    className="btn-link btn-link_lg default-underline text-uppercase fw-medium  mt-4"
                                >
                                    Discover Now
                                </Link>
                            </div>

                            {/* Image Section */}
                            <div className="best-sellers-img position-relative">
                                {/* Background Image */}
                                <div className="imgBg ">
                                    <Image
                                        loading="lazy"
                                        src={elm.imgBg}
                                        fill
                                        alt="Pattern"
                                        className="object-fit-cover position-absolute"
                                    />
                                </div>
                                {/* Foreground Image */}
                                <div className="position-relative">
                                    <Image
                                        loading="lazy"
                                        src={elm.imgSrc}
                                        width="400"
                                        height="345"
                                        alt="Pattern"
                                        className="object-fit-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
            {/* <!-- /.slideshow-item --> */}

            {/* <!-- /.slideshow-wrapper js-swiper-slider --> */}

            <div className="cursor-pointer slideshow__prev border-0 text-white position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <use href="#icon_prev_md" />
                </svg>
            </div>
            {/* <!-- /.slideshow__prev --> */}
            <div className="cursor-pointer slideshow__next border-0 text-white position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <use href="#icon_next_md" />
                </svg>
            </div>
            {/* <!-- /.slideshow__next --> */}

            <div className="container">
                <div className="slideshow-pagination type2 d-flex align-items-center position-absolute active-white bottom-0 left-50 mb-4"></div>
                {/* <!-- /.products-pagination --> */}
            </div>
            {/* <!-- /.container --> */}
        </Swiper>
    );
}
