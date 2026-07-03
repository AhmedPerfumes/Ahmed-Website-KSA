"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchAllProducts } from "@/utlis/productsCache";
import he from "he";
import "./BestSellers.css";

const TABS = [
    { id: "all",                 label: "All",                 match: null },
    { id: "perfumes",            label: "Perfumes",            match: "perfume" },
    { id: "dakhoon",             label: "Dakhoon",             match: "dakhoon" },
    { id: "concentrated-parfum", label: "Concentrated Parfum", match: "concentrated" },
    { id: "gift-sets",           label: "Gift Sets",           match: "gift" },
    { id: "care-essentials",     label: "Care Essentials",     match: "care" },
];

export default function BestSellers() {
    const locale = useLocale();
    const t      = useTranslations();
    const { currency, isLoading: isMenuLoading } = useMenu();
    const { addProductToCart, isAddedToCartProducts, toggleWishlist, isAddedtoWishlist } = useContextElement();

    const [activeTab, setActiveTab]     = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [swiper, setSwiper]           = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* ── Fetch ─────────────────────────────────────────────── */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await fetchAllProducts();
                if (data?.length) {
                    setAllProducts([...data].sort((a, b) => (b.sales || 0) - (a.sales || 0)));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

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

    /* Reset slide on tab change */
    useEffect(() => { if (swiper) swiper.slideTo(0, 300); }, [activeTab, swiper]);

    /* Filter */
    const currentTab = TABS[activeTab];
    const products   = currentTab.match === null
        ? allProducts
        : allProducts.filter(p => p.category_name?.toLowerCase().includes(currentTab.match));

    /* ── Helpers ────────────────────────────────────────────── */
    const cleanStr = useCallback(str =>
        str.replace(/&amp;/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim()
    , []);

    const getSubcatSlug = useCallback((category, subcategory) => {
        if (subcategory?.subcategory_name)
            return cleanStr(subcategory.subcategory_name).split(" ").join("-").toLowerCase();
        const cat = cleanStr(category).toLowerCase();
        if (cat.includes("gift")) return "gift-sets";
        if (cat.includes("hair")) return "hair-mist";
        return "extrait-de-parfum";
    }, [cleanStr]);

    const productUrl = useCallback(elm =>
        `/${locale}/shop/${cleanStr(elm.category_name).split(" ").join("-").toLowerCase()}/${getSubcatSlug(elm.category_name, elm.subcategory)}/${cleanStr(elm.product_name).split(" ").join("-").toLowerCase()}`
    , [locale, cleanStr, getSubcatSlug]);

    const fmt = useCallback(v => `${Number(v).toFixed(2)}${currency?.symbol || ""}`, [currency]);

    const renderPrice = useCallback(elm => {
        const base = Number(elm.price);
        if (elm?.discount?.value) {
            let sale;
            if (elm.discount.discount_type === "percent") sale = base - (base * Number(elm.discount.value)) / 100;
            if (elm.discount.discount_type === "amount")  sale = base - Number(elm.discount.value);
            if (sale !== undefined && sale < base) return (
                <>
                    <span className="bs-card__price-old">{fmt(base)}</span>
                    <span className="bs-card__price-new">{fmt(sale)}</span>
                </>
            );
        }
        return <span className="bs-card__price-cur">{fmt(base)}</span>;
    }, [fmt]);

    const getImage = useCallback(elm => {
        if (!elm?.images) return "";
        try {
            const p = JSON.parse(elm.images);
            return p[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${p[0]}` : "";
        } catch { return ""; }
    }, []);

    /* ── Skeleton ───────────────────────────────────────────── */
    if (isMenuLoading || loading) return (
        <section className="best-sellers" id="best-sellers">
            <div className="best-sellers__inner">
                <div className="best-sellers__head">
                    <div className="bs-skel-line bs-skel-line--eyebrow" />
                    <div className="bs-skel-line bs-skel-line--title"   />
                </div>
                <div className="bs-skel-tabs">
                    {[...Array(5)].map((_, i) => <div key={i} className="bs-skel-tab" />)}
                </div>
                <div className="bs-skel-row">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bs-skel-card">
                            <div className="bs-skel-card__img" />
                            <div className="bs-skel-line bs-skel-line--name" />
                            <div className="bs-skel-line bs-skel-line--sub"  />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    if (!allProducts.length) return null;

    return (
        <section className="best-sellers" aria-label="Best Sellers" id="best-sellers">
            <div className="best-sellers__inner">

                {/* ── Centered heading ── */}
                <div className="best-sellers__head">
                    <span className="best-sellers__eyebrow">{t("Best Sellers")}</span>
                    <h2 className="best-sellers__title">{t("EXPLORE BY CATEGORY")}</h2>
                </div>

                {/* ── Centered underline tabs ── */}
                <div className="best-sellers__tabs-wrap">
                    <div className="best-sellers__tabs" role="tablist">
                        {TABS.map((tab, idx) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === idx}
                                className={`bs-tab${activeTab === idx ? " bs-tab--active" : ""}`}
                                onClick={() => setActiveTab(idx)}
                            >
                                {t(tab.label)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Slider ── */}
                <div className="best-sellers__slider-wrap">
                    <Swiper
                        key={activeTab}
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".bs-scrollbar" }}
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
                        {products.map(elm => {
                            const imgSrc = getImage(elm);
                            const url    = productUrl(elm);
                            const inCart = isAddedToCartProducts(elm.product_id);
                            const inWish = isAddedtoWishlist(elm.product_id);

                            return (
                                <SwiperSlide key={elm.product_id}>
                                    <article className="bs-card">

                                        {/* Image */}
                                        <div className="bs-card__media">
                                            <Link href={url} tabIndex={-1}>
                                                {imgSrc && (
                                                    <Image
                                                        src={imgSrc}
                                                        alt={elm.product_name ? `${he.decode(elm.product_name)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi Perfume"}
                                                        fill
                                                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                                                        className="bs-card__img"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </Link>

                                            {/* Badge */}
                                            {elm?.label_name && (
                                                <span className="bs-card__badge" style={{ background: elm.label_color }}>
                                                    {elm.label_name}
                                                </span>
                                            )}
                                            {!elm?.label_name && elm?.discount?.discount_type === "percent" && elm.discount.value && (
                                                <span className="bs-card__badge">-{elm.discount.value}%</span>
                                            )}

                                            {/* Wishlist */}
                                            <button
                                                type="button"
                                                className={`bs-card__wish${inWish ? " active" : ""}`}
                                                onClick={() => toggleWishlist(elm.product_id)}
                                                aria-label={t("Add to Wishlist")}
                                            >
                                                <svg viewBox="0 0 24 24">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="bs-card__info">
                                            <p className="bs-card__sub">
                                                {elm.subcategory?.subcategory_name || elm.category_name}
                                            </p>
                                            <h3 className="bs-card__name">
                                                <Link href={url}>
                                                    {elm.product_name && he.decode(elm.product_name)}
                                                </Link>
                                            </h3>
                                            <div className="bs-card__price">
                                                {renderPrice(elm)}
                                            </div>

                                            {/* Add to Cart — always visible */}
                                            {elm.product_qty > 0 ? (
                                                <button
                                                    type="button"
                                                    className={`bs-card__atc${inCart ? " bs-card__atc--added" : ""}`}
                                                    onClick={() => addProductToCart({
                                                        ...elm,
                                                        category_name: elm.category_name,
                                                        subcategory_name: elm.subcategory?.subcategory_name,
                                                    })}
                                                >
                                                    {inCart ? t("Added to Cart") : t("Add To Cart")}
                                                </button>
                                            ) : (
                                                <span className="bs-card__atc bs-card__atc--out">
                                                    {t("Out Of Stock")}
                                                </span>
                                            )}
                                        </div>

                                    </article>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Scrollbar line */}
                    <div className="bs-scrollbar" />
                </div>

                {/* ── Nav arrows centered below ── */}
                <div className="best-sellers__nav">
                    <button type="button" ref={prevRef} className="bs-arrow" aria-label="Previous">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button type="button" ref={nextRef} className="bs-arrow" aria-label="Next">
                        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                    </button>
                </div>

            </div>
        </section>
    );
}
