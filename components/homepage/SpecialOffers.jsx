"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchDiscountOffers } from "@/utlis/productsCache";
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

    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [swiper, setSwiper]         = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* ── Fetch active discount promotions ── */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const discounts = await fetchDiscountOffers();
                if (Array.isArray(discounts) && discounts.length > 0) {
                    setPromotions(discounts);
                } else {
                    setPromotions([]);
                }
            } catch (e) {
                console.error("Error fetching discount offers:", e);
                setPromotions([]);
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

    /* ── Discount promotions & products ── */
    const discountPromos = promotions.filter((p) => !p.type || p.type === "discount");
    const currentPromo = discountPromos.find((p) => p.image) || discountPromos[0] || null;

    // Collect products from discount promotions (deduplicated by product_id) and limit to 8
    const allDiscountProducts = [];
    const seenIds = new Set();
    for (const promo of discountPromos) {
        for (const prod of (promo.products || [])) {
            if (prod && prod.product_id && !seenIds.has(prod.product_id)) {
                seenIds.add(prod.product_id);
                allDiscountProducts.push(prod);
            }
        }
    }

    const currentProducts = allDiscountProducts.slice(0, 8);

    const promoImage = currentPromo?.image
        ? (currentPromo.image.startsWith("http")
            ? currentPromo.image
            : `${process.env.NEXT_PUBLIC_API_URL}storage/${currentPromo.image}`)
        : null;

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

                {/* ── Dynamic Promotion Banner ── */}
                {promoImage && (
                    <div className="so-banner">
                        <Link href={`/${locale}/shop`} tabIndex={-1} className="so-banner__link" aria-label={currentPromo?.name ? he.decode(currentPromo.name) : t("Special Offers")}>
                            <Image
                                src={promoImage}
                                alt={currentPromo?.name ? `${he.decode(currentPromo.name)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi Special Offers"}
                                fill
                                sizes="(max-width: 768px) 95vw, 1440px"
                                className="so-banner__img"
                                priority={false}
                                loading="lazy"
                            />
                            <span className="so-banner__scrim" />
                        </Link>
                    </div>
                )}

                {/* ── Centered heading ── */}
                <div className="so-head">
                    <span className="so-eyebrow">{t("Exclusive Offers")}</span>
                    <h2 className="so-title">
                        {currentPromo?.name ? he.decode(currentPromo.name) : t("Special Offers")}
                    </h2>
                    {currentPromo?.description && (
                        <p className="so-desc">{he.decode(currentPromo.description)}</p>
                    )}

                </div>
                <div className="oe-view-all-row">
                    <Link href={`/${locale}/sale`} className="oe-view-all">
                        {t("View All")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

                {/* ── Carousel ── */}
                <div className="so-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
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
                            // Arabic name — mirrors PremiumProductCard logic exactly
                            const prodName = locale === 'ar'
                                ? (elm?.product_name_ar?.trim() || he.decode(elm?.product_name || ''))
                                : he.decode(elm?.product_name || '');
                            const catLabel = locale === 'ar'
                                ? (elm.subcategory?.subcategory_name_ar || elm.category_name_ar
                                   || t(elm.subcategory?.subcategory_name || elm.category_name || ''))
                                : (elm.subcategory?.subcategory_name || elm.category_name);

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
                                                {catLabel}
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

