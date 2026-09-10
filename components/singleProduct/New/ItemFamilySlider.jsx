"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { renderPrice } from "@/utlis/priceRenderer";
import "./ItemFamilySlider.css";

/** Fires the global cart toast */
function fireCartToast(name, image, qty) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("cart:added", { detail: { name, image, qty: qty || 1 } })
    );
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

export default function ItemFamilySlider({ product, itemFamilyProds }) {
    const { currency } = useMenu();
    const locale = useLocale();
    const { addProductToCart, isAddedToCartProducts } = useContextElement();
    const t = useTranslations();
    const sliderRef = useRef(null);

    // Arrow visibility state — smart logic
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);

    const updateArrows = useCallback(() => {
        const el = sliderRef.current;
        if (!el) return;
        const overflow = el.scrollWidth > el.clientWidth + 4; // 4px tolerance
        setHasOverflow(overflow);
        setCanScrollPrev(el.scrollLeft > 4);
        setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
        // Check on mount + resize
        updateArrows();
        el.addEventListener("scroll", updateArrows, { passive: true });
        const ro = new ResizeObserver(updateArrows);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            ro.disconnect();
        };
    }, [updateArrows]);

    const scrollSlider = (dir) => {
        const el = sliderRef.current;
        if (!el) return;
        const card = el.querySelector(".ifs-card");
        const step = card ? card.offsetWidth + 12 : 200;
        el.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    // Guards
    if (!itemFamilyProds || itemFamilyProds.length === 0) return null;
    const inStock = itemFamilyProds.filter((p) => p?.product_qty > 0);
    if (inStock.length === 0) return null;

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

            {/* Slider wrap — arrows only render when there IS overflow */}
            <div className="ifs-slider-wrap">

                {/* Prev arrow — only when overflow AND not at start */}
                {hasOverflow && (
                    <button
                        className={`ifs-arrow ifs-arrow--prev${canScrollPrev ? "" : " ifs-arrow--hidden"}`}
                        onClick={() => scrollSlider(-1)}
                        aria-label="Previous products"
                        aria-hidden={!canScrollPrev}
                        type="button"
                        tabIndex={canScrollPrev ? 0 : -1}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                )}

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
                                {/* Image container — ATC anchored here so it overlays image only */}
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

                                    {/* Badges */}
                                    {hasDiscount && (
                                        <span className="ifs-badge">{effectiveDiscount.value}% Off</span>
                                    )}
                                    {!hasDiscount && elm?.label_name && (
                                        <span className="ifs-badge" style={{ background: elm.label_color || "#1A1A1A" }}>
                                            {elm.label_name}
                                        </span>
                                    )}

                                    {/* ATC — slides up from bottom of image on hover */}
                                    <button
                                        className={`ifs-card__atc${isAdded ? " ifs-card__atc--added" : ""}`}
                                        onClick={() => {
                                            if (isAdded) return;
                                            addProductToCart({ ...elmWithDiscount, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name || "" });
                                            fireCartToast(name, img0, 1);
                                        }}
                                    >
                                        {isAdded ? "✓ Added" : "Add to Cart"}
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="ifs-card__info">
                                    <p className="ifs-card__cat">{t(elm.category_name)}</p>
                                    <Link href={url} className="ifs-card__name" title={name}>{name}</Link>
                                    <div className="ifs-card__price">{renderPrice(elmWithDiscount, currency)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Next arrow — only when overflow AND not at end */}
                {hasOverflow && (
                    <button
                        className={`ifs-arrow ifs-arrow--next${canScrollNext ? "" : " ifs-arrow--hidden"}`}
                        onClick={() => scrollSlider(1)}
                        aria-label="Next products"
                        aria-hidden={!canScrollNext}
                        type="button"
                        tabIndex={canScrollNext ? 0 : -1}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                )}
            </div>
        </div>
    );
}
