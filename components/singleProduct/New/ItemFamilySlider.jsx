"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { useState, useRef } from "react";
import { renderPrice } from "@/utlis/priceRenderer";
import "./ItemFamilySlider.css";

/** Fires the global cart toast */
function fireCartToast(name, image, qty) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("cart:added", { detail: { name, image, qty: qty || 1 } })
    );
}

/** Build product URL slug — mirrors PHP/JS logic */
function slugify(str) {
    return (str || "")
        .replace(/[^a-zA-Z0-9\s]/g, " Description ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .join("-")
        .toLowerCase();
}

function cleanName(str) {
    const wordsToRemove = ["&", "amp", ";"];
    let s = (str || "").replace(/[^a-zA-Z0-9\s]/g, " ");
    wordsToRemove.forEach((w) => {
        s = s.replace(new RegExp(`\\b${w}\\b`, "gi"), "");
    });
    return s.replace(/\s+/g, " ").trim();
}

function getProductUrl(locale, elm) {
    const cat = cleanName(elm.category_name || "").split(" ").join("-").toLowerCase();
    let sub = "";
    if (elm.subcategory?.subcategory_name) {
        sub = cleanName(elm.subcategory.subcategory_name).split(" ").join("-").toLowerCase();
    } else {
        if (cat === "gift-sets") sub = "gift-sets";
        else if (cat === "hair-mist") sub = "hair-mist";
        else if (cat === "extrait-de-parfum") sub = "extrait-de-parfum";
        else sub = "online-exclusive";
    }
    const prod = cleanName(elm.product_name || "").split(" ").join("-").toLowerCase();
    return `/${locale}/shop/${cat}/${sub}/${prod}`;
}

const INITIAL_SHOW = 6; // show first 6 (2 × 3 rows), expand on demand

export default function ItemFamilySlider({ product, itemFamilyProds }) {
    const { currency } = useMenu();
    const locale = useLocale();
    const { addProductToCart, isAddedToCartProducts } = useContextElement();
    const t = useTranslations();
    const tp = useTranslations("ProductDetails");
    const [showAll, setShowAll] = useState(false);
    const sliderRef = useRef(null);

    const scrollSlider = (dir) => {
        if (!sliderRef.current) return;
        const card = sliderRef.current.querySelector(".ifs-card");
        const step = card ? card.offsetWidth + 16 : 200;
        sliderRef.current.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    // Guard
    if (!itemFamilyProds || itemFamilyProds.length === 0) return null;

    // Filter out-of-stock
    const inStock = itemFamilyProds.filter((p) => p?.product_qty > 0);
    if (inStock.length === 0) return null;

    const visible = showAll ? inStock : inStock.slice(0, INITIAL_SHOW);
    const hasMore = inStock.length > INITIAL_SHOW;
    const familyName = product?.product_family ? he.decode(product.product_family) : "";

    return (
        <div className="ifs-panel">
            {/* Header */}
            <div className="ifs-header">
                <p className="ifs-eyebrow">You May Also Like</p>
                <h3 className="ifs-title">
                    {familyName
                        ? <>More from <em>{familyName}</em></>
                        : "Complete Your Collection"}
                </h3>
            </div>

            {/* Horizontal scroll slider — replaces old 2-col grid */}
            <div className="ifs-slider-wrap">
                {/* Prev arrow */}
                <button
                    className="ifs-arrow ifs-arrow--prev"
                    onClick={() => scrollSlider(-1)}
                    aria-label="Previous products"
                    type="button"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>

                <div className="ifs-slider" ref={sliderRef}>
                    {inStock.map((elm, i) => {
                        const imgs = Array.isArray(elm.images) ? elm.images : [];
                        const img0 = imgs[0]
                            ? `${process.env.NEXT_PUBLIC_API_URL}storage/${imgs[0]}`
                            : null;
                        const img1 = imgs[1]
                            ? `${process.env.NEXT_PUBLIC_API_URL}storage/${imgs[1]}`
                            : null;
                        const url = getProductUrl(locale, elm);
                        const name = he.decode(elm?.product_name || "");
                        const isAdded = isAddedToCartProducts(elm?.product_id);
                        const effectiveDiscount = elm.discount ??
                            (product?.discount?.apply_to === "group" ? product.discount : null);
                        const elmWithDiscount = effectiveDiscount ? { ...elm, discount: effectiveDiscount } : elm;
                        const hasDiscount = !!effectiveDiscount?.value;

                        return (
                            <div className="ifs-card" key={elm.product_id ?? i}>
                                <div className="ifs-card__img">
                                    <Link href={url} tabIndex={-1} aria-hidden="true">
                                        {img0 && (
                                            <Image src={img0} alt={name} fill
                                                sizes="(max-width:1024px) 40vw,200px"
                                                style={{ objectFit: "cover" }} loading="lazy"
                                            />
                                        )}
                                        {img1 && (
                                            <Image src={img1} alt={name} fill
                                                sizes="(max-width:1024px) 40vw,200px"
                                                style={{ objectFit: "cover" }} loading="lazy"
                                                className="ifs-img-secondary"
                                            />
                                        )}
                                    </Link>
                                    {hasDiscount && (
                                        <span className="ifs-badge">{effectiveDiscount.value}% Off</span>
                                    )}
                                    {!hasDiscount && elm?.label_name && (
                                        <span className="ifs-badge" style={{ background: elm.label_color || "#1A1A1A" }}>
                                            {elm.label_name}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className={`ifs-card__atc${isAdded ? " ifs-card__atc--added" : ""}`}
                                    onClick={() => {
                                        if (isAdded) return;
                                        addProductToCart({ ...elmWithDiscount, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name || "" });
                                        fireCartToast(name, img0, 1);
                                    }}
                                >
                                    {isAdded ? "✓ Added" : "Add to Bag"}
                                </button>
                                <div className="ifs-card__info">
                                    <p className="ifs-card__cat">{t(elm.category_name)}</p>
                                    <Link href={url} className="ifs-card__name" title={name}>{name}</Link>
                                    <div className="ifs-card__price">{renderPrice(elmWithDiscount, currency)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Next arrow */}
                <button
                    className="ifs-arrow ifs-arrow--next"
                    onClick={() => scrollSlider(1)}
                    aria-label="Next products"
                    type="button"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
        </div>
    );
}
