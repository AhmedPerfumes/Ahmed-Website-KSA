"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchBuyXGetYOffers } from "@/utlis/productsCache";
import he from "he";
import "./BuyXGetY.css";

export default function BuyXGetY() {
    const locale = useLocale();
    const t      = useTranslations();
    const { currency, isLoading: isMenuLoading } = useMenu();
    const { addProductToCart, isAddedToCartProducts, toggleWishlist, isAddedtoWishlist } = useContextElement();

    /* Fire the CartToast used across the store */
    const fireToast = (elm, qty = 1) => {
        if (typeof window === "undefined") return;
        let img = "";
        try {
            img = JSON.parse(elm.images || "[]")[0]
                ? `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`
                : "";
        } catch {
            img = elm.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}` : "";
        }
        window.dispatchEvent(
            new CustomEvent("cart:added", {
                detail: {
                    name: elm.product_name,
                    image: img,
                    qty,
                    category: elm.category_name,
                    subcategory: elm.subcategory?.subcategory_name || "",
                },
            })
        );
    };

    const [promotions, setPromotions]             = useState([]);
    const [activePromoIndex, setActivePromoIndex] = useState(0);
    const [loading, setLoading]                   = useState(true);
    const [swiper, setSwiper]                     = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* ── Fetch active Buy X Get Y promotions ── */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const bogoData = await fetchBuyXGetYOffers();
                if (Array.isArray(bogoData) && bogoData.length > 0) {
                    setPromotions(bogoData);
                } else {
                    setPromotions([]);
                }
            } catch (e) {
                console.error("Error fetching Buy X Get Y offers:", e);
                setPromotions([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* Wire navigation refs after swiper mounts */
    useEffect(() => {
        if (swiper && !swiper.destroyed && prevRef.current && nextRef.current) {
            if (swiper.params?.navigation && swiper.navigation) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                try {
                    swiper.navigation.destroy();
                    swiper.navigation.init();
                    swiper.navigation.update();
                } catch (err) {
                    console.error("BuyXGetY Swiper navigation init error:", err);
                }
            }
        }
    }, [swiper]);

    /* Reset slide on tab switch */
    useEffect(() => {
        if (swiper && !swiper.destroyed) {
            try {
                swiper.slideTo(0, 300);
            } catch {}
        }
    }, [activePromoIndex, swiper]);

    /* ── Helpers ── */
    const cleanStr = useCallback((str) =>
        (str || "").replace(/&amp;/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim()
    , []);

    const getSubcatSlug = useCallback((category, subcategory) => {
        if (subcategory?.subcategory_name)
            return cleanStr(subcategory.subcategory_name).split(" ").join("-").toLowerCase();
        const cat = cleanStr(category).toLowerCase();
        if (cat.includes("gift")) return "gift-sets";
        if (cat.includes("hair")) return "hair-mist";
        return "extrait-de-parfum";
    }, [cleanStr]);

    const productUrl = useCallback((elm) =>
        `/${locale}/shop/${cleanStr(elm.category_name).split(" ").join("-").toLowerCase()}/${getSubcatSlug(elm.category_name, elm.subcategory)}/${cleanStr(elm.product_name).split(" ").join("-").toLowerCase()}`
    , [locale, cleanStr, getSubcatSlug]);

    const fmt = useCallback((v) => `${Number(v).toFixed(2)}${currency?.symbol || ""}`, [currency]);

    const getImage = useCallback((elm) => {
        if (!elm?.images && !elm?.image) return "";
        try {
            if (elm.images) {
                const p = JSON.parse(elm.images);
                if (p && p[0]) return `${process.env.NEXT_PUBLIC_API_URL}storage/${p[0]}`;
            }
            if (elm.image) return `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`;
            return "";
        } catch {
            return elm.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}` : "";
        }
    }, []);

    const currentPromo = promotions[activePromoIndex] || null;
    const currentProducts = currentPromo?.products ?? [];

    /* ── Loading Skeleton ─────────────────────────────────────── */
    if (isMenuLoading || loading) {
        return (
            <section className="bxy-section" id="buy-x-get-y">
                <div className="bxy-inner">
                    <div className="bxy-head">
                        <div className="bxy-skel-line bxy-skel-line--eyebrow" />
                        <div className="bxy-skel-line bxy-skel-line--title" />
                    </div>
                    <div className="bxy-skel-row">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bxy-skel-card">
                                <div className="bxy-skel-card__img" />
                                <div className="bxy-skel-line bxy-skel-line--name" />
                                <div className="bxy-skel-line bxy-skel-line--sub" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    /* ── If no active Buy X Get Y promotions exist, hide the section entirely ── */
    if (!currentProducts || currentProducts.length === 0) {
        return null;
    }

    const badgeLabel = (locale === "ar" && currentPromo?.badge_text_ar)
        ? currentPromo.badge_text_ar
        : (currentPromo?.badge_text || "BUY X GET Y FREE");

    return (
        <section className="bxy-section" aria-label="Buy X Get Y Offers" id="buy-x-get-y">
            <div className="bxy-inner">

                {/* ── Centered Heading ── */}
                <div className="bxy-head">
                    <span className="bxy-eyebrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        {badgeLabel}
                    </span>
                    <h2 className="bxy-title">
                        {currentPromo?.name ? he.decode(currentPromo.name) : (locale === "ar" ? "اشتري واكسب" : "Buy More Save More")}
                    </h2>
                    {currentPromo?.description && (
                        <p className="bxy-desc">{he.decode(currentPromo.description)}</p>
                    )}

                    {/* ── Campaign Tabs (when multiple Buy X Get Y promotions are active) ── */}
                    {promotions.length > 1 && (
                        <div className="bxy-tabs-wrap">
                            <div className="bxy-tabs" role="tablist" aria-label="Buy X Get Y Campaigns">
                                {promotions.map((promo, idx) => (
                                    <button
                                        key={promo.id || idx}
                                        type="button"
                                        role="tab"
                                        aria-selected={activePromoIndex === idx}
                                        className={`bxy-tab${activePromoIndex === idx ? " bxy-tab--active" : ""}`}
                                        onClick={() => setActivePromoIndex(idx)}
                                    >
                                        {promo.name ? he.decode(promo.name) : `${t("Offer")} ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Carousel ── */}
                <div className="bxy-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".bxy-scrollbar" }}
                        spaceBetween={20}
                        slidesPerView={1.4}
                        breakpoints={{
                            480:  { slidesPerView: 1.8, spaceBetween: 20 },
                            640:  { slidesPerView: 2.2, spaceBetween: 22 },
                            768:  { slidesPerView: 2.8, spaceBetween: 24 },
                            1024: { slidesPerView: 3.5, spaceBetween: 26 },
                            1280: { slidesPerView: 4,   spaceBetween: 28 },
                            1440: { slidesPerView: 4.5, spaceBetween: 28 },
                        }}
                    >
                        {currentProducts.map((elm) => {
                            const imgSrc   = getImage(elm);
                            const url      = productUrl(elm);
                            const inWish   = isAddedtoWishlist(elm.product_id);
                            const inStock  = elm.product_qty > 0;
                            const prodName = (locale === "ar" && elm.product_name_ar) ? elm.product_name_ar : elm.product_name;

                            return (
                                <SwiperSlide key={elm.product_id}>
                                    <article className="bxy-card">

                                        {/* Image Container */}
                                        <div className="bxy-card__media">
                                            <Link href={url} tabIndex={-1}>
                                                {imgSrc && (
                                                    <Image
                                                        src={imgSrc}
                                                        alt={prodName ? `${he.decode(prodName)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi Special Offer"}
                                                        fill
                                                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                                                        className="bxy-card__img"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </Link>

                                            {/* Badge */}
                                            <span className="bxy-card__badge">
                                                {badgeLabel}
                                            </span>

                                            {/* Wishlist Button */}
                                            <button
                                                type="button"
                                                className={`bxy-card__wish${inWish ? " bxy-card__wish--active" : ""}`}
                                                aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
                                                onClick={() => toggleWishlist(elm.product_id)}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Card Body */}
                                        <div className="bxy-card__body">
                                            <span className="bxy-card__cat">
                                                {elm.subcategory?.subcategory_name || elm.category_name || "Perfumes"}
                                            </span>

                                            <h3 className="bxy-card__title">
                                                <Link href={url}>
                                                    {prodName ? he.decode(prodName) : "Ahmed Perfume"}
                                                </Link>
                                            </h3>

                                            <div className="bxy-card__price-row">
                                                <span className="bxy-card__price">{fmt(elm.price)}</span>
                                            </div>

                                            {inStock ? (
                                                <button
                                                    type="button"
                                                    className="bxy-card__btn"
                                                    onClick={() => {
                                                        addProductToCart(elm.product_id, 1);
                                                        fireToast(elm, 1);
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="9" cy="21" r="1"></circle>
                                                        <circle cx="20" cy="21" r="1"></circle>
                                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                    </svg>
                                                    {t("Add to Cart") || "Add to Cart"}
                                                </button>
                                            ) : (
                                                <button type="button" className="bxy-card__btn bxy-card__btn--disabled" disabled>
                                                    {t("Out of Stock") || "Out of Stock"}
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button ref={prevRef} className="bxy-nav-btn bxy-nav-btn--prev" aria-label="Previous Offer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button ref={nextRef} className="bxy-nav-btn bxy-nav-btn--next" aria-label="Next Offer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>

                    {/* Scrollbar */}
                    <div className="bxy-scrollbar" />
                </div>
            </div>
        </section>
    );
}
