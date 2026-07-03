"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./CollectionShowcase.css";

const COLLECTIONS = [
    {
        id: "perfumes",
        title: "Perfumes",
        subtitle: "",
        desc: "Luxury fragrances crafted for distinction. From bold oud to delicate florals, discover scents that define your presence.",
        image: "/assets/images/home/demo8/collection-Banner.jpg",
        href: "/product-category/perfumes",
    },
    {
        id: "kseries",
        title: "K-Series",
        subtitle: "",
        desc: "A trilogy of past, present and future. Bold magnetic fragrances that capture the essence of timeless masculinity.",
        image: "/assets/images/kseries/hero-banner.jpg",
        href: "/product-category/perfumes",
    },
    {
        id: "dakhoon",
        title: "Dakhoon",
        subtitle: "",
        desc: "Rooted in Arabian heritage, our dakhoon collection fills your space with rich, lasting aromas crafted from natural ingredients.",
        image: "/assets/images/home/demo8/Dakhoon-Banner.jpg",
        href: "/product-category/dakhoon",
    },
    {
        id: "oud",
        title: "Oud",
        subtitle: "collection",
        desc: "The finest natural oud, sourced and aged to perfection. A legacy of depth and warmth in every note.",
        image: "/assets/images/home/demo8/Oud-Asateen.jpg",
        href: "/product-category/dakhoon",
    },
    {
        id: "giftsets",
        title: "Gift Sets",
        subtitle: "",
        desc: "Elegance, beautifully wrapped. Curated sets that make the perfect gift for every occasion.",
        image: "/assets/images/home/demo8/Giftset-banner.jpg",
        href: "/product-category/gift-sets",
    },
];

export default function CollectionShowcase() {
    const locale = useLocale();
    const t = useTranslations();
    const [swiperInstance, setSwiperInstance] = useState(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    useEffect(() => {
        if (swiperInstance && prevRef.current && nextRef.current) {
            swiperInstance.params.navigation.prevEl = prevRef.current;
            swiperInstance.params.navigation.nextEl = nextRef.current;
            swiperInstance.navigation.destroy();
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();
        }
    }, [swiperInstance]);

    return (
        <section className="collections" aria-label={t("Collections")} id="collections-showcase">
            <div className="collections__inner">
                <div className="collections__layout">
                    {/* Left: Text */}
                    <div className="collections__text">
                        <h2 className="collections__title">
                            {t("Collections")}
                        </h2>
                        <p className="collections__desc">
                            {t(
                                "Explore our exclusive collection of refined scents made with the finest ingredients Elegant and original each fragrance complements your style"
                            )}
                        </p>
                        <Link
                            href={`/${locale}/shop`}
                            className="collections__discover-all"
                        >
                            {t("Discover all collections")}
                            <svg viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>

                        {/* Nav arrows below text on desktop */}
                        <div className="collections__nav">
                            <button type="button" ref={prevRef} className="collections__arrow" aria-label="Previous">
                                <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button type="button" ref={nextRef} className="collections__arrow" aria-label="Next">
                                <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Right: Swiper Slider */}
                    <div className="collections__slider">
                        <Swiper
                            modules={[Navigation, Scrollbar]}
                            onSwiper={setSwiperInstance}
                            spaceBetween={16}
                            slidesPerView={1.4}
                            breakpoints={{
                                420: { slidesPerView: 1.6, spaceBetween: 16 },
                                576: { slidesPerView: 1.8, spaceBetween: 20 },
                                768: { slidesPerView: 2.2, spaceBetween: 22 },
                                1024: { slidesPerView: 2.5, spaceBetween: 24 },
                                1200: { slidesPerView: 2.8, spaceBetween: 28 },
                                1400: { slidesPerView: 3, spaceBetween: 28 },
                            }}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            scrollbar={{
                                draggable: true,
                                el: ".collections__scrollbar",
                            }}
                        >
                            {COLLECTIONS.map((col) => (
                                <SwiperSlide key={col.id}>
                                    <Link
                                        href={`/${locale}${col.href}`}
                                        className="collections__card"
                                        id={`collection-${col.id}`}
                                    >
                                        <div className="collections__card-media">
                                            <Image
                                                src={col.image}
                                                alt={`Ahmed Al Maghribi ${t(col.title)} Collection — Luxury Fragrance`}
                                                fill
                                                sizes="(max-width: 768px) 70vw, 320px"
                                                className="collections__card-img"
                                                loading="lazy"
                                            />
                                        </div>
                                        <h3 className="collections__card-title">
                                            {t(col.title)}
                                        </h3>
                                        {col.subtitle && (
                                            <span className="collections__card-subtitle">
                                                {t(col.subtitle)}
                                            </span>
                                        )}
                                        <p className="collections__card-desc">
                                            {t(col.desc)}
                                        </p>
                                        <span className="collections__card-cta">
                                            {t("Discover")}
                                            <svg viewBox="0 0 24 24">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="collections__scrollbar" />
                    </div>
                </div>
            </div>
        </section>
    );
}
