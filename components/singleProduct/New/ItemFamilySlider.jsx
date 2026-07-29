"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { useRef } from "react";
import { renderPrice } from "@/utlis/priceRenderer";
import "./ItemFamilySlider.css";

/** Fires the global cart toast — same event that CartToast listens to */
function fireCartToast(name, image, qty) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("cart:added", { detail: { name, image, qty: qty || 1 } })
    );
}

/** Build the product URL slug — mirrors the PHP/JS logic */
function removeSpecialCharactersAndAmp(productName) {
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, "") + " Description";
    const wordsToRemove = ["&", " &", "& ", " & ", "amp", " amp", "amp ", " amp ", ";", " ;", "; ", " ; "];
    let cleanString = dynamicKey;
    wordsToRemove.forEach((word) => {
        const regex = new RegExp(word, "gi");
        cleanString = cleanString.replace(regex, "");
    });
    return cleanString.replace(/\s+/g, " ").trim();
}

function getSubcategorySlug(category, subcategory) {
    if (subcategory != null) {
        return removeSpecialCharactersAndAmp(subcategory.subcategory_name)
            .split(" ").join("-").toLowerCase();
    }
    const cat = removeSpecialCharactersAndAmp(category).toLowerCase();
    if (cat === "gift-sets") return "gift-sets";
    if (cat === "hair-mist") return "hair-mist";
    if (cat === "extrait-de-parfum") return "extrait-de-parfum";
    return "online-exclusive";
}

function getProductUrl(locale, elm) {
    const catSlug = removeSpecialCharactersAndAmp(elm.category_name).split(" ").join("-").toLowerCase();
    const subSlug = getSubcategorySlug(elm.category_name.split(" ").join("-").toLowerCase(), elm.subcategory);
    const prodSlug = removeSpecialCharactersAndAmp(elm.product_name).split(" ").join("-").toLowerCase();
    return `/${locale}/shop/${catSlug}/${subSlug}/${prodSlug}`;
}

export default function ItemFamilySlider({ product, itemFamilyProds }) {
    const { currency } = useMenu();
    const locale = useLocale();
    const { addProductToCart, isAddedToCartProducts } = useContextElement();
    const t = useTranslations();
    const tp = useTranslations("ProductDetails");

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // Guard: no data
    if (!itemFamilyProds || itemFamilyProds.length === 0) return null;

    // Filter out-of-stock
    const inStockProds = itemFamilyProds.filter((p) => p?.product_qty > 0);
    if (inStockProds.length === 0) return null;

    const familyName = product?.product_family ? he.decode(product.product_family) : "";

    return (
        <section className="ymal-section">
            <div className="ymal-inner">

                {/* ── Header ── */}
                <div className="ymal-header">
                    <div className="ymal-title-block">
                        <span className="ymal-eyebrow">You May Also Like</span>
                        <h2 className="ymal-title">
                            {familyName
                                ? <>Discover More from <strong>{familyName}</strong></>
                                : "Complete Your Collection"}
                        </h2>
                    </div>

                    {/* Desktop nav arrows */}
                    <div className="ymal-nav-btns">
                        <button
                            ref={prevRef}
                            className="ymal-nav-btn ymal-prev"
                            aria-label="Previous products"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            ref={nextRef}
                            className="ymal-nav-btn ymal-next"
                            aria-label="Next products"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Carousel ── */}
                <Swiper
                    className="ymal-swiper"
                    modules={[Pagination, Navigation]}
                    loop={inStockProds.length > 4}
                    slidesPerView={2}
                    spaceBetween={16}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = prevRef.current;
                        swiper.params.navigation.nextEl = nextRef.current;
                    }}
                    pagination={{
                        el: ".ymal-pagination",
                        clickable: true,
                    }}
                    breakpoints={{
                        576: { slidesPerView: 2, spaceBetween: 16 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                        1280: { slidesPerView: 4, spaceBetween: 28 },
                    }}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                >
                    {inStockProds.map((elm, i) => {
                        const imgs = Array.isArray(elm.images) ? elm.images : [];
                        const img0 = imgs[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${imgs[0]}` : null;
                        const img1 = imgs[1] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${imgs[1]}` : null;
                        const url = getProductUrl(locale, elm);
                        const name = he.decode(elm?.product_name || "");
                        const isAdded = isAddedToCartProducts(elm?.product_id);

                        // Check active discount
                        const now = new Date();
                        const hasDiscount = elm.discount &&
                            new Date(elm.discount.start_date) <= now &&
                            new Date(elm.discount.end_date) >= now;

                        return (
                            <SwiperSlide key={i}>
                                <div className="ymal-card">

                                    {/* Image area */}
                                    <div className="ymal-card__img-wrap">
                                        <Link href={url} tabIndex={-1} aria-hidden="true">
                                            {img0 && (
                                                <Image
                                                    src={img0}
                                                    alt={name}
                                                    fill
                                                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    className="ymal-img"
                                                    loading="lazy"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            )}
                                            {img1 && (
                                                <Image
                                                    src={img1}
                                                    alt={name}
                                                    fill
                                                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    className="ymal-img-hover"
                                                    loading="lazy"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            )}
                                        </Link>

                                        {/* Sale badge */}
                                        {hasDiscount && (
                                            <span className="ymal-badge ymal-badge--sale">
                                                Sale {elm.discount.value}%
                                            </span>
                                        )}
                                        {elm?.label_name && !hasDiscount && (
                                            <span
                                                className="ymal-badge"
                                                style={{ background: elm.label_color || "#1A1A1A" }}
                                            >
                                                {elm.label_name}
                                            </span>
                                        )}

                                        {/* Quick Add */}
                                        <button
                                            className={`ymal-card__atc${isAdded ? " ymal-card__atc--added" : ""}`}
                                            onClick={() => {
                                                if (isAdded) return;
                                                addProductToCart({
                                                    ...elm,
                                                    category_name: elm.category_name,
                                                    subcategory_name: elm.subcategory?.subcategory_name || "",
                                                });
                                                fireCartToast(name, img0, 1);
                                            }}
                                            title={isAdded ? "Added to bag" : "Add to bag"}
                                        >
                                            {isAdded ? "✓ Added to Bag" : "Add to Bag"}
                                        </button>
                                    </div>

                                    {/* Card info */}
                                    <div className="ymal-card__info">
                                        <p className="ymal-card__category">
                                            {t(elm.category_name)}
                                        </p>
                                        <h3 className="ymal-card__name">
                                            <Link href={url}>{name}</Link>
                                        </h3>
                                        <div className="ymal-card__price">
                                            {renderPrice(elm, currency)}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Pagination dots */}
                <div className="ymal-pagination" />
            </div>
        </section>
    );
}
