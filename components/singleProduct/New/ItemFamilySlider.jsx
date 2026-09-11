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

/**
 * CardCTA — switches between:
 *   • Gold "+ Add" button  (pre-cart)
 *   • Dark pill stepper [🗑/−] [qty] [+]  (in-cart, matching PDP theme)
 */
function CardCTA({ elm, elmWithDiscount, img0, name }) {
    const { cartProducts, setCartProducts } = useContextElement();

    const cartItem = cartProducts.find(
        (c) => c.product_id == elm?.product_id && !c.is_gift
    );
    const isInCart = !!cartItem;
    const qty = cartItem?.quantity ?? 0;

    const maxQty = elm?.product_qty ?? 99;

    const addToCart = () => {
        if (isInCart) return;
        const item = {
            ...elmWithDiscount,
            category_name: elm.category_name,
            subcategory_name: elm.subcategory?.subcategory_name || "",
            quantity: 1,
        };
        setCartProducts((prev) => [...prev, item]);
        fireCartToast(name, img0, 1);
    };

    const increase = () => {
        if (qty >= maxQty) return;
        setCartProducts((prev) =>
            prev.map((c) =>
                c.product_id == elm?.product_id && !c.is_gift
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            )
        );
    };

    const decrease = () => {
        if (qty <= 1) {
            // Remove from cart
            setCartProducts((prev) =>
                prev.filter((c) => !(c.product_id == elm?.product_id && !c.is_gift))
            );
        } else {
            setCartProducts((prev) =>
                prev.map((c) =>
                    c.product_id == elm?.product_id && !c.is_gift
                        ? { ...c, quantity: c.quantity - 1 }
                        : c
                )
            );
        }
    };

    if (!isInCart) {
        return (
            <button className="ifs-cta ifs-cta--add" onClick={addToCart} type="button">
                + Add
            </button>
        );
    }

    return (
        <div className="ifs-cta ifs-cta--stepper" role="group" aria-label="Update quantity">
            <button
                className="ifs-cta__btn"
                onClick={decrease}
                aria-label={qty === 1 ? "Remove from cart" : "Decrease quantity"}
                type="button"
            >
                {qty === 1 ? (
                    /* Trash icon when qty = 1 (next decrease removes) */
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                ) : "−"}
            </button>
            <span className="ifs-cta__num" aria-live="polite">{qty}</span>
            <button
                className="ifs-cta__btn"
                onClick={increase}
                disabled={qty >= maxQty}
                aria-label="Increase quantity"
                type="button"
            >
                +
            </button>
        </div>
    );
}

export default function ItemFamilySlider({ product, itemFamilyProds }) {
    const { currency } = useMenu();
    const locale = useLocale();
    const t = useTranslations();
    const sliderRef = useRef(null);

    // Arrow visibility — smart logic
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);

    const updateArrows = useCallback(() => {
        const el = sliderRef.current;
        if (!el) return;
        const overflow = el.scrollWidth > el.clientWidth + 4;
        setHasOverflow(overflow);
        setCanScrollPrev(el.scrollLeft > 4);
        setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
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

    if (!itemFamilyProds || itemFamilyProds.length === 0) return null;
    const inStock = itemFamilyProds.filter((p) => p?.product_qty > 0);
    if (inStock.length === 0) return null;

    const familyName = product?.product_family ? he.decode(product.product_family) : "";

    return (
        <div className="ifs-panel">
            <div className="ifs-header">
                <p className="ifs-eyebrow">You May Also Like</p>
                <h3 className="ifs-title">
                    {familyName
                        ? <>More from <em>{familyName}</em></>
                        : "Complete Your Collection"}
                </h3>
            </div>

            <div className="ifs-slider-wrap">
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
                        const effectiveDiscount = elm.discount ??
                            (product?.discount?.apply_to === "group" ? product.discount : null);
                        const elmWithDiscount = effectiveDiscount ? { ...elm, discount: effectiveDiscount } : elm;
                        const hasDiscount = !!effectiveDiscount?.value;

                        return (
                            <div className="ifs-card" key={elm.product_id ?? i}>
                                {/* Image */}
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

                                {/* Info */}
                                <div className="ifs-card__info">
                                    <p className="ifs-card__cat">{t(elm.category_name)}</p>
                                    <Link href={url} className="ifs-card__name" title={name}>{name}</Link>
                                    <div className="ifs-card__price">{renderPrice(elmWithDiscount, currency)}</div>

                                    {/* Always-visible CTA — switches to qty stepper when in cart */}
                                    <CardCTA
                                        elm={elm}
                                        elmWithDiscount={elmWithDiscount}
                                        img0={img0}
                                        name={name}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

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
