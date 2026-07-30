"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchAllProducts } from "@/utlis/productsCache";
import he from "he";
import "./OnlineExclusive.css";

/**
 * OnlineExclusive â€” product carousel for the "online-exclusive" category.
 * Structurally identical to SpecialOffers, fetches products whose category
 * name resolves to the "online-exclusive" slug (or subcategory is null and
 * category is not gift-sets / hair-mist / extrait-de-parfum).
 */
export default function OnlineExclusive() {
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

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [swiper, setSwiper]     = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* â”€â”€ Helpers â”€â”€ */
    const cleanStr = useCallback((str) =>
        str?.replace(/&amp;/g, "").replace(/[^\\w\\s-]/g, "").replace(/\\s+/g, " ").trim() ?? "",
    []);

    const getSubcatSlug = useCallback((category, subcategory) => {
        if (subcategory?.subcategory_name)
            return cleanStr(subcategory.subcategory_name).split(" ").join("-").toLowerCase();
        const cat = cleanStr(category ?? "").toLowerCase();
        if (cat.includes("gift"))   return "gift-sets";
        if (cat.includes("hair"))   return "hair-mist";
        if (cat.includes("extrait")) return "extrait-de-parfum";
        return "online-exclusive";
    }, [cleanStr]);

    const productUrl = useCallback((elm) => {
        const cat    = cleanStr(elm.category_name ?? "").split(" ").join("-").toLowerCase();
        const subcat = getSubcatSlug(elm.category_name ?? "", elm.subcategory);
        const name   = cleanStr(elm.product_name ?? "").split(" ").join("-").toLowerCase();
        return `/${locale}/shop/${cat}/${subcat}/${name}`;
    }, [locale, cleanStr, getSubcatSlug]);

    const fmt = useCallback((v) => `${Number(v).toFixed(2)}${currency?.symbol || ""}`, [currency]);

    const getSalePrice = useCallback((elm) => {
        const base = Number(elm.price);
        if (!elm?.discount?.value) return base;
        if (elm.discount.discount_type === "percent")
            return base - (base * Number(elm.discount.value)) / 100;
        if (elm.discount.discount_type === "amount")
            return base - Number(elm.discount.value);
        return base;
    }, []);

    const getImage = useCallback((elm) => {
        if (!elm?.images) return "";
        try {
            const p = JSON.parse(elm.images);
            return p[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${p[0]}` : "";
        } catch { return ""; }
    }, []);

    /* â”€â”€ Fetch online-exclusive products â”€â”€ */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await fetchAllProducts();
                if (data?.length) {
                    const oe = data.filter((p) => {
                        if (p.product_qty <= 0) return false;
                        const subcat = getSubcatSlug(p.category_name ?? "", p.subcategory);
                        return subcat === "online-exclusive";
                    });
                    setProducts(oe.length > 0 ? oe : data.filter(p => p.product_qty > 0).slice(0, 12));
                }
            } catch (e) { console.error(e); }
            finally     { setLoading(false); }
        })();
    }, [getSubcatSlug]);

    /* â”€â”€ Wire nav refs after swiper mounts â”€â”€ */
    useEffect(() => {
        if (swiper && prevRef.current && nextRef.current) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
        }
    }, [swiper]);

    /* â”€â”€ Skeleton â”€â”€ */
    if (isMenuLoading || loading) {
        return (
            <section className="oe-section" id="online-exclusive">
                <div className="oe-inner">
                    <div className="oe-head">
                        <div className="oe-skel-line oe-skel-line--eyebrow" />
                        <div className="oe-skel-line oe-skel-line--title" />
                    </div>
                    <div className="oe-skel-row">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="oe-skel-card">
                                <div className="oe-skel-card__img" />
                                <div className="oe-skel-line oe-skel-line--name" />
                                <div className="oe-skel-line oe-skel-line--sub" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!products.length) return null;

    return (
        <section className="oe-section" aria-label={t("Online Exclusive")} id="online-exclusive">
            <div className="oe-inner">

                {/* ── Centered heading ── */}
                {/* <div className="oe-head">
                    <span className="oe-eyebrow">{t("exclusive luxury meets your senses")}</span>
                    <h2 className="oe-title">{t("curated collections")}</h2>
                    <p className="oe-subtitle">
                        {t("Rare finds, curated collections and limited editions, available exclusively online.")}
                    </p>
                </div> */}
                <div className="gs2-head">
                    <h2 className="gs2-lead">{t("Exclusive luxury meets your senses")}</h2>
                    <p className="gs2-sub">
                        {t("Rare finds, curated collections and limited editions, available exclusively online.")}
                    </p>
                </div>

                {/* ── View All row ── */}
                <div className="oe-view-all-row">
                    <Link href={`/${locale}/shop`} className="oe-view-all">
                        {t("View All")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="oe-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".oe-scrollbar" }}
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
                        {products.map((elm) => {
                            const imgSrc  = getImage(elm);
                            const url     = productUrl(elm);
                            const inCart  = isAddedToCartProducts(elm.product_id);
                            const inWish  = isAddedtoWishlist(elm.product_id);
                            const base    = Number(elm.price);
                            const sale    = getSalePrice(elm);
                            const hasDisc = elm?.discount?.value && Number(elm.discount.value) > 0;
                            const pctOff  = hasDisc
                                ? (elm.discount.discount_type === "percent"
                                    ? Math.round(Number(elm.discount.value))
                                    : Math.round(((base - sale) / base) * 100))
                                : 0;

                            return (
                                <SwiperSlide key={elm.product_id}>
                                    <article className="oe-card">

                                        {/* â”€â”€ Image â”€â”€ */}
                                        <div className="oe-card__media">
                                            <Link href={url} tabIndex={-1}>
                                                {imgSrc && (
                                                    <Image
                                                        src={imgSrc}
                                                        alt={elm.product_name ? `${he.decode(elm.product_name)} — Ahmed Al Maghribi Online Exclusive` : "Ahmed Al Maghribi Online Exclusive Perfume"}
                                                        fill
                                                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                                                        className="oe-card__img"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </Link>

                                            {/* Online Exclusive badge */}
                                            <span className="oe-card__badge">{t("Online Exclusive")}</span>

                                            {/* Discount badge */}
                                            {hasDisc && pctOff > 0 && (
                                                <span className="oe-card__disc">-{pctOff}%</span>
                                            )}

                                            {/* Wishlist */}
                                            <button
                                                type="button"
                                                className={`oe-card__wish${inWish ? " active" : ""}`}
                                                onClick={() => toggleWishlist(elm.product_id)}
                                                aria-label={t("Add to Wishlist")}
                                            >
                                                <svg viewBox="0 0 24 24">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* â”€â”€ Info â”€â”€ */}
                                        <div className="oe-card__info">
                                            <p className="oe-card__sub">
                                                {elm.subcategory?.subcategory_name || elm.category_name}
                                            </p>
                                            <h3 className="oe-card__name">
                                                <Link href={url}>
                                                    {elm.product_name && he.decode(elm.product_name)}
                                                </Link>
                                            </h3>
                                            <div className="oe-card__price">
                                                {hasDisc ? (
                                                    <>
                                                        <span className="oe-card__price-old">{fmt(base)}</span>
                                                        <span className="oe-card__price-new">{fmt(sale)}</span>
                                                    </>
                                                ) : (
                                                    <span className="oe-card__price-cur">{fmt(base)}</span>
                                                )}
                                            </div>

                                            {elm.product_qty > 0 ? (() => {
                                                const cartItem = cartProducts.find(p => p.product_id === elm.product_id);
                                                const cartQty  = cartItem?.quantity || 0;
                                                const maxQty   = elm.maximum_order_quantity || elm.product_qty || 99;
                                                return cartQty > 0 ? (
                                                    <div className="oe-card__stepper">
                                                        <button type="button" className="oe-card__step-btn" aria-label="Decrease" onClick={() => {
                                                            if (cartQty <= 1) { setCartProducts(cartProducts.filter(p => p.product_id !== elm.product_id)); }
                                                            else { setCartProducts(cartProducts.map(p => p.product_id === elm.product_id ? { ...p, quantity: cartQty - 1 } : p)); }
                                                        }}>−</button>
                                                        <span className="oe-card__step-num">{cartQty}</span>
                                                        <button type="button" className={`oe-card__step-btn${cartQty >= maxQty ? " oe-card__step-btn--max" : ""}`} aria-label="Increase" onClick={() => {
                                                            if (cartQty >= maxQty) return;
                                                            const newQty = cartQty + 1;
                                                            setCartProducts(cartProducts.map(p => p.product_id === elm.product_id ? { ...p, quantity: newQty } : p));
                                                            fireToast(elm, newQty);
                                                        }}>+</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" className="oe-card__atc" onClick={() => { addProductToCart({ ...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name, _silent: true }); fireToast(elm, 1); }}>{t("Add To Cart")}</button>
                                                );
                                            })() : (
                                                <span className="oe-card__atc oe-card__atc--out">{t("Out Of Stock")}</span>
                                            )}
                                        </div>

                                    </article>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Scrollbar line */}
                    <div className="oe-scrollbar" />
                </div>

                {/* â”€â”€ Nav arrows â”€â”€ */}
                <div className="oe-nav">
                    <button type="button" ref={prevRef} className="oe-arrow" aria-label="Previous">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button type="button" ref={nextRef} className="oe-arrow" aria-label="Next">
                        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                    </button>
                </div>

            </div>
        </section>
    );
}

