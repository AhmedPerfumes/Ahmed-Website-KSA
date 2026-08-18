"use client";


import React, { useEffect, useState } from "react";
import he from "he";
import { useContextElement } from "@/context/Context";
// 1. Import useLocale to get the current language
import { useTranslations, useLocale } from "next-intl";
import "./Sticky.css";
import { useMenu } from "@/context/MenuContext";
import Image from "next/image";
import { renderPrice } from "@/utlis/priceRenderer";
import { toast } from 'react-toastify';
import { ShoppingCart } from "@mui/icons-material";

const Sticky = ({ image, product }) => {
    const [show, setShow] = useState(false);
    const { cartProducts, setCartProducts } = useContextElement();
    // 2. Initialize the translation hooks correctly
    const t = useTranslations("ProductDetails");
    const locale = useLocale();
    const { currency } = useMenu();
    const [quantity, setQuantity] = useState(1);
    
    let category = product?.category;
    let subcategory = product?.subcategory;
    const productName = locale === 'ar' ? product?.product_name_ar : product?.product_name;
    const isOutOfStock = product?.product_qty <= 0;

    const isIncludeCard = () => {
        if (!product?.product_id) return false;
        return cartProducts.some((elm) => elm.product_id == product.product_id);
    };

    const addToCart = () => {
        if (!isIncludeCard()) {
            const item = {
                ...product,
                product_name: productName, 
                category_name: capitalizeEachWord(
                    category?.split("-").join(" ") || ""
                ),
                subcategory_name: capitalizeEachWord(
                    subcategory?.split("-").join(" ") || ""
                ),
            };
            item.quantity = quantity;

            if (typeof window !== "undefined" && window.AhmedTracker) {
                window.AhmedTracker.track("add_to_cart", {
                    product_id: (product?.product_id || product?.id)?.toString(),
                    product_name: product?.product_name ? he.decode(product.product_name) : (productName || ""),
                    price: parseFloat(product?.sale_price || product?.price || 0),
                    quantity: quantity || 1,
                });
            }

            setCartProducts((pre) => [...pre, item]);
            toast.success("Added to Cart", { 
                position: "bottom-right", 
                autoClose: 5000, 
                hideProgressBar: false, 
                closeOnClick: true, 
                pauseOnHover: true, 
                draggable: true 
            });
        }
    };

    function capitalizeEachWord(str) {
        if (!str) return "";
        return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }

    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const target = document.getElementById("product-detail-top");
        if (!target) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShow(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    if (!show || !product) return null;

    return (
        <div className="sticky-container d-flex align-items-center position-fixed start-50 translate-middle-x shadow rounded-pill border bg-white">
            <Image
                width={100}
                height={100}
                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`}
                alt={`Thumbnail for ${productName}`}
                className="rounded-circle border img"
            />

            <div className="flex-grow-1 text-truncate">
                <p className="mb-0 fw-medium" title={productName}>
                    {productName}
                </p>
                <p className="mb-0 fw-bold">
                    {/* Price renders based on the prop passed down */}
                    {renderPrice(product, currency)}
                </p>
            </div>

            <button
                id="product-detail-sticky-btn"
                type="button"
                className={`btn d-flex align-items-center gap-2 rounded-pill fw-semibold ${isOutOfStock ? "btn-secondary" : "btn-dark"}`}
                aria-label={t('addToCartLabel', { name: productName })}
                disabled={isIncludeCard() || isOutOfStock}
                onClick={() => !isIncludeCard() && !isOutOfStock && addToCart()}
                style={(isIncludeCard() || isOutOfStock) ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
                onMouseEnter={(e) => {
                    if (!isOutOfStock && !isIncludeCard()) e.currentTarget.style.backgroundColor = "#27272a";
                }}
                onMouseLeave={(e) => {
                    if (!isOutOfStock && !isIncludeCard()) e.currentTarget.style.backgroundColor = "#000";
                }}
            >
                {!isOutOfStock && <ShoppingCart size={18} />}
                
                {isOutOfStock 
                    ? t("outOfStock") // Ensure "outOfStock" key exists in your en.json/ar.json
                    : (isIncludeCard() ? t("alreadyAdded") : t("addToCart"))
                }
            </button>
        </div>
    );
};

export default Sticky;