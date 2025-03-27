"use client";
import Link from "next/link";
import { slidesData3 } from "@/data/heroslides";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { useMenu } from "../../../context/MenuContext";
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
    const {
            homeSliders,
            isLoading: isMenuLoading,
            error,
        } = useMenu();
    
        if (isMenuLoading) {
            return <div>Loading...</div>;
        }
        if (error) {
            return <div>{error}</div>;
        }
    return (
        <Swiper
            className="swiper-container js-swiper-slider slideshow minh-100 swiper-container-fade swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
            {...swiperOptions}
        >
            {homeSliders?.map((elm, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                    <div className="overflow-hidden position-relative h-100">
                        <div className="slideshow-bg">
                            <Link href={`${locale}/${elm.link}`}>
                                <Image
                                    loading="lazy"
                                    src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`}
                                    width="1903"
                                    height="945"
                                    alt="image"
                                    className="slideshow-bg__img"
                                />
                            </Link>
                        </div>
                        <div className="slideshow-text container position-absolute start-50 top-50 translate-middle">
                            {elm.title && (
                                <h6
                                    className={`t-subtitle text-uppercase fs-base fw-medium animate animate_fade animate_btt animate_delay-3`} style={{ 'color': elm.color}}
                                >
                                    {t(elm.season)}
                                </h6>
                            )}
                            <h2
                                className={`h1 fw-normal mb-0 animate animate_fade animate_btt animate_delay-5`} style={{ 'color': elm.color}}
                            >
                                {t(elm.title)}
                            </h2>
                            <h2
                                className={`h1 fw-bold mb-2 animate animate_fade animate_btt animate_delay-5`} style={{ 'color': elm.color}}
                            >
                                {t(elm.sub_title)}
                            </h2>
                            {elm.title && (
                                <Link
                                    href={`${locale}/${elm.link}`}
                                    className={`btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7`} style={{ 'color': elm.color}}
                                >
                                    {t("Discover More")}
                                </Link>
                            )}
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
