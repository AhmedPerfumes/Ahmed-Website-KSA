"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import "./NewArrivals.css";

/* ── Static editorial new arrival cards ── */
const NEW_ARRIVAL_ITEMS = [
    {
        id: "the-roots",
        label: "K-Series · 2000",
        name: "The Roots",
        img: "/assets/images/kseries/PAST_Bottle_Final.jpg",
        link: "/k-series/2000",
    },
    {
        id: "the-alchemy-lab",
        label: "K-Series · 2025",
        name: "The Alchemy Lab",
        img: "/assets/images/kseries/Present_2025.jpg",
        link: "/k-series/2025",
    },
    {
        id: "the-beyond",
        label: "K-Series · 2050",
        name: "The Beyond",
        img: "/assets/images/kseries/FUTURE_mobile_1.jpg",
        link: "/k-series/2050",
    },
];

export default function NewArrivals() {
    const locale = useLocale();
    const t = useTranslations();
    const { toggleWishlist, isAddedtoWishlist, addProductToCart } = useContextElement();

    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [swiper, setSwiper] = useState(null);

    /* Wire nav refs after swiper mounts */
    useEffect(() => {
        if (swiper && prevRef.current && nextRef.current) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
        }
    }, [swiper]);

    /* ── Static BannerCard ── */
    const BannerCard = ({ item }) => {
        const inWish = isAddedtoWishlist(item.id);
        const url = `/${locale}${item.link}`;

        return (
            <article className="na2-banner">
                <Link href={url} className="na2-banner__link" tabIndex={-1}>
                    <Image
                        src={item.img}
                        alt={`${item.name} — Ahmed Al Maghribi New Arrival Perfume`}
                        fill
                        sizes="(max-width: 767px) 85vw, 33vw"
                        className="na2-banner__img"
                        loading="lazy"
                    />
                    <span className="na2-banner__overlay" />
                </Link>

                <span className="na2-banner__badge">{t("New")}</span>
                <button
                    type="button"
                    className={`na2-banner__wish${inWish ? " active" : ""}`}
                    onClick={() => toggleWishlist(item.id)}
                    aria-label={t("Add to Wishlist")}
                >
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                <div className="na2-banner__body">
                    <p className="na2-banner__sub">{item.label}</p>
                    <h3 className="na2-banner__name">
                        <Link href={url}>{item.name}</Link>
                    </h3>
                    <div className="na2-banner__footer">
                        <div />
                        <Link href={url} className="na2-banner__atc">
                            {t("Shop Now")}
                        </Link>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <section className="na2" aria-label={t("New Arrivals")} id="new-arrivals">
            <div className="na2__inner">

                {/* ── Heading ── */}
                <div className="na2__head">
                    <div>
                        <span className="na2__eyebrow">{t("Just Arrived")}</span>
                        <h2 className="na2__title">
                            {t("New")} <strong>{t("Arrivals")}</strong>
                        </h2>
                    </div>
                    <Link href={`/${locale}/shop`} className="na2__view-all">
                        {t("View All")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

                {/* ── 3-column banner grid ── */}
                <div className="na2__grid">
                    {NEW_ARRIVAL_ITEMS.map((item) => (
                        <BannerCard key={item.id} item={item} />
                    ))}
                </div>

                {/* ── Mobile Swiper carousel (hidden ≥768px) ── */}
                <div className="na2__carousel">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".na2-scrollbar" }}
                        spaceBetween={14}
                        slidesPerView={1.15}
                        breakpoints={{
                            480: { slidesPerView: 1.4, spaceBetween: 16 },
                            640: { slidesPerView: 1.8, spaceBetween: 18 },
                        }}
                    >
                        {NEW_ARRIVAL_ITEMS.map((item) => (
                            <SwiperSlide key={item.id}>
                                <BannerCard item={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Scrollbar */}
                    <div className="na2-scrollbar" />

                    {/* Nav arrows */}
                    <div className="na2__nav">
                        <button type="button" ref={prevRef} className="na2-arrow" aria-label="Previous">
                            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <button type="button" ref={nextRef} className="na2-arrow" aria-label="Next">
                            <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
