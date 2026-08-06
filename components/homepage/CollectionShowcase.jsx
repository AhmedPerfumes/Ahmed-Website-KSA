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
        id: "ghaf-black-fume",
        title: "Ghaf & Black Fume",
        subtitle: "",
        desc: "A bold union of smoky black fume and the earthy warmth of ghaf wood — a daring statement of Arabian masculinity.",
        image: "https://admin.ahmedalmaghribi.com/public/storage/collections/ghaf-black-fumejpg.jpeg",
        href: "/shop/collections/summer-bundles/ghaf-black-fume",
    },
    {
        id: "marj-opaline-wave",
        title: "Marj & Opaline Wave",
        subtitle: "",
        desc: "Fresh meadow blooms meet shimmering opaline facets — a luminous, airy duo for the spirit that longs for serenity.",
        image: "https://admin.ahmedalmaghribi.com/public/storage/collections/marj-opaline-wavejpg.jpeg",
        href: "/shop/collections/summer-bundles/marj-opaline-wave",
    },
    {
        id: "waves-of-oud",
        title: "Waves of Oud",
        subtitle: "",
        desc: "Oud at its most fluid — rich, resinous notes ripple through the senses like waves across an ancient shore.",
        image: "https://admin.ahmedalmaghribi.com/public/storage/collections/blue-by-ahmed-blue-oud-couturejpg.jpeg",
        href: "/shop/collections/summer-collection/waves-of-oud",
    },
    {
        id: "the-royal-essence",
        title: "The Royal Essence",
        subtitle: "",
        desc: "A regal blend of rare ingredients inspired by the grandeur of Arabian courts — timeless, majestic, unforgettable.",
        image: "https://admin.ahmedalmaghribi.com/public/storage/collections/ctrine-summer-oud-tayyib-halwahjpg.jpeg",
        href: "/shop/collections/summer-collection/the-royal-essence",
    },
    {
        id: "misr-e-bakhoor",
        title: "Misr-e-Bakhoor",
        subtitle: "",
        desc: "Heritage bakhoor reimagined — layers of myrrh, amber and precious resins from the lands of ancient spice routes.",
        image: "https://admin.ahmedalmaghribi.com/public/storage/collections/marrah-takhayyal-taajabmalikijpg.jpeg",
        href: "/shop/collections/summer-collection/misr-e-bakhoor",
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

                        {/* Nav arrows — rendered here so they appear BELOW the slider.
                            On desktop (≥1024px) they are hidden; desktop uses a CSS
                            clone injected by the .collections__text::after trick in CSS.
                            Single source of truth for refs = no duplicate-ref bugs. */}
                        <div className="collections__nav" aria-label="Collection navigation">
                            <button type="button" ref={prevRef} className="collections__arrow" aria-label="Previous collection">
                                <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button type="button" ref={nextRef} className="collections__arrow" aria-label="Next collection">
                                <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
