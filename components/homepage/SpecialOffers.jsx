"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchSpecialOffers, fetchAllProducts } from "@/utlis/productsCache";
import he from "he";
import "./SpecialOffers.css";

export default function SpecialOffers() {
    const locale = useLocale();
    const t      = useTranslations();
    const { currency, isLoading: isMenuLoading } = useMenu();
    const { addProductToCart, isAddedToCartProducts, toggleWishlist, isAddedtoWishlist, cartProducts, setCartProducts } = useContextElement();

    /* Fire the same CartToast used on the product listing page */
    const fireToast = (elm, qty = 1) => {
        if (typeof window === "undefined") return;
        let img = "";
        try { img = JSON.parse(elm.images || "[]")[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}` : ""; } catch {}
        window.dispatchEvent(new CustomEvent("cart:added", { detail: { name: elm.product_name, image: img, qty, category: elm.category_name, subcategory: elm.subcategory?.subcategory_name || "" } }));
    };

    const [promotions, setPromotions]               = useState([]);
    const [activePromoIndex, setActivePromoIndex]   = useState(0);
    const [fallbackProducts, setFallbackProducts]   = useState([]);
    const [loading, setLoading]                     = useState(true);
    const [swiper, setSwiper]                       = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* ── Fetch active promotions & products ── */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await fetchSpecialOffers();
                if (Array.isArray(data) && data.length > 0) {
                    setPromotions(data);
                } else {
                    // Fallback to fetchAllProducts if no active dynamic promotion
                    const all = await fetchAllProducts();
                    if (all?.length) {
                        const discounted = all.filter(
                            (p) => p?.discount?.value && Number(p.discount.value) > 0 && p.product_qty > 0
                        );
                        const fallback = all.filter((p) => p.product_qty > 0).slice(0, 12);
                        setFallbackProducts(discounted.length > 0 ? discounted : fallback);
                    }
                }
            } catch (e) {
                console.error("Error fetching special offers:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* Wire nav refs after swiper mounts */
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
                    console.error("Swiper navigation init error:", err);
                }
            }
        }
    }, [swiper]);

    /* Reset slide on tab change */
    useEffect(() => {
        if (swiper && !swiper.destroyed) {
            try {
                swiper.slideTo(0, 300);
            } catch {}
        }
    }, [activePromoIndex, swiper]);

    /* ── Helpers ──────────────────────────────────────────────── */
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

    const getSalePrice = useCallback((elm) => {
        const base = Number(elm.price);
        if (!elm?.discount?.value && !elm?.discount?.final_price) return base;
        if (elm.discount.final_price) return Number(elm.discount.final_price);
        if (elm.discount.discount_type === "percent")
            return base - (base * Number(elm.discount.value)) / 100;
        if (elm.discount.discount_type === "amount")
            return base - Number(elm.discount.value);
        return base;
    }, []);

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
    const currentProducts = currentPromo?.products?.length ? currentPromo.products : fallbackProducts;

    /* ── Skeleton ─────────────────────────────────────────────── */
    if (isMenuLoading || loading) {
        return (
            <section className="so-section" id="special-offers">
                <div className="so-inner">
                    <div className="so-head">
                        <div className="so-skel-line so-skel-line--eyebrow" />
                        <div className="so-skel-line so-skel-line--title" />
                    </div>
                    <div className="so-skel-row">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="so-skel-card">
                                <div className="so-skel-card__img" />
                                <div className="so-skel-line so-skel-line--name" />
                                <div className="so-skel-line so-skel-line--sub" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!currentProducts || currentProducts.length === 0) {
        return null;
    }

    return (
        <section className="so-section" aria-label="Special Offers" id="special-offers">
            <div className="so-inner">

                {/* ── Centered heading ── */}
                <div className="so-head">
                    <span className="so-eyebrow">{t("Exclusive Offers")}</span>
                    <h2 className="so-title">
                        {currentPromo?.name ? he.decode(currentPromo.name) : t("Special Offers")}
                    </h2>
                    {currentPromo?.description && (
                        <p className="so-desc">{he.decode(currentPromo.description)}</p>
                    )}

                    {/* ── Promotion Tabs (when multiple promotions active) ── */}
                    {promotions.length > 1 && (
                        <div className="so-tabs-wrap">
                            <div className="so-tabs" role="tablist" aria-label="Special Offer Campaigns">
                                {promotions.map((promo, idx) => (
                                    <button
                                        key={promo.id || idx}
                                        type="button"
                                        role="tab"
                                        aria-selected={activePromoIndex === idx}
                                        className={`so-tab${activePromoIndex === idx ? " so-tab--active" : ""}`}
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
                <div className="so-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".so-scrollbar" }}
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
                            const imgSrc  = getImage(elm);
                            const url     = productUrl(elm);
                            const inCart  = isAddedToCartProducts(elm.product_id);
                            const inWish  = isAddedtoWishlist(elm.product_id);
                            const base    = Number(elm.price);
                            const sale    = getSalePrice(elm);
                            const hasDisc = elm?.discount && (Number(elm.discount.value) > 0 || Number(elm.discount.final_price) > 0);
                            const pctOff  = hasDisc
                                ? (elm.discount.discount_type === "percent"
                                    ? Math.round(Number(elm.discount.value))
                                    : Math.round(((base - sale) / base) * 100))
                                : 0;
                            const prodName = (locale === "ar" && elm.product_name_ar) ? elm.product_name_ar : elm.product_name;

                            return (
                                <SwiperSlide key={elm.product_id}>
                                    <article className="so-card">

                                        {/* Image */}
                                        <div className="so-card__media">
                                            <Link href={url} tabIndex={-1}>
                                                {imgSrc && (
                                                    <Image
                                                        src={imgSrc}
                                                        alt={prodName ? `${he.decode(prodName)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi Special Offer Perfume"}
                                                        fill
                                                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                                                        className="so-card__img"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </Link>

                                            {/* Discount badge */}
                                            {hasDisc && pctOff > 0 && (
                                                <span className="so-card__badge">-{pctOff}%</span>
                                            )}

                                            {/* Wishlist */}
                                            <button
                                                type="button"
                                                className={`so-card__wish${inWish ? " active" : ""}`}
                                                onClick={() => toggleWishlist(elm.product_id)}
                                                aria-label={t("Add to Wishlist")}
                                            >
                                                <svg viewBox="0 0 24 24">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="so-card__info">
                                            <p className="so-card__sub">
                                                {elm.subcategory?.subcategory_name || elm.category_name}
                                            </p>
                                            <h3 className="so-card__name">
                                                <Link href={url}>
                                                    {prodName && he.decode(prodName)}
                                                </Link>
                                            </h3>
                                            <div className="so-card__price">
                                                {hasDisc && sale < base ? (
                                                    <>
                                                        <span className="so-card__price-old">{fmt(base)}</span>
                                                        <span className="so-card__price-new">{fmt(sale)}</span>
                                                    </>
                                                ) : (
                                                    <span className="so-card__price-cur">{fmt(base)}</span>
                                                )}
                                            </div>

                                            {elm.product_qty > 0 ? (() => {
                                                const cartItem = cartProducts.find(p => p.product_id === elm.product_id);
                                                const cartQty  = cartItem?.quantity || 0;
                                                const maxQty   = elm.maximum_order_quantity || elm.product_qty || 99;
                                                return cartQty > 0 ? (
                                                    <div className="so-card__stepper">
                                                        <button type="button" className="so-card__step-btn" aria-label="Decrease" onClick={() => {
                                                             if (cartQty <= 1) { setCartProducts(cartProducts.filter(p => p.product_id !== elm.product_id)); }
                                                             else { setCartProducts(cartProducts.map(p => p.product_id === elm.product_id ? { ...p, quantity: cartQty - 1 } : p)); }
                                                        }}>−</button>
                                                        <span className="so-card__step-num">{cartQty}</span>
                                                        <button type="button" className={`so-card__step-btn${cartQty >= maxQty ? " so-card__step-btn--max" : ""}`} aria-label="Increase" onClick={() => {
                                                            if (cartQty >= maxQty) return;
                                                            const newQty = cartQty + 1;
                                                            setCartProducts(cartProducts.map(p => p.product_id === elm.product_id ? { ...p, quantity: newQty } : p));
                                                            fireToast(elm, newQty);
                                                        }}>+</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" className="so-card__atc" onClick={() => { addProductToCart({ ...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name, _silent: true }); fireToast(elm, 1); }}>{t("Add To Cart")}</button>
                                                );
                                            })() : (
                                                <span className="so-card__atc so-card__atc--out">{t("Out Of Stock")}</span>
                                            )}
                                        </div>

                                    </article>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Scrollbar line */}
                    <div className="so-scrollbar" />
                </div>

                {/* ── Nav arrows centered below ── */}
                <div className="so-nav">
                    <button type="button" ref={prevRef} className="so-arrow" aria-label="Previous">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button type="button" ref={nextRef} className="so-arrow" aria-label="Next">
                        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                    </button>
                </div>

            </div>
        </section>
    );
}

