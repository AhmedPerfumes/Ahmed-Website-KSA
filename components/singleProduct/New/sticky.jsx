"use client";

// import { ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
// 1. Import useLocale to get the current language
import { useTranslations, useLocale } from "next-intl";
import "./Sticky.css";
import { useMenu } from "@/context/MenuContext";
import Image from "next/image";
import { renderPrice } from "@/utlis/priceRenderer";
import { ShoppingCart } from "@mui/icons-material";

const Sticky = ({ image, name, price, product }) => {
    const [show, setShow] = useState(false);
    const { cartProducts, setCartProducts } = useContextElement();
    // 2. Initialize the translation hooks correctly
    const t = useTranslations("ProductDetails");
    const locale = useLocale();

    let category = product?.category;
    let subcategory = product?.subcategory;
    const [quantity, setQuantity] = useState(1);
    const { currency } = useMenu();

    // 3. Create a variable for the translated product name
    const productName = locale === 'ar' ? product?.product_name_ar : product?.product_name;

    const isIncludeCard = () => {
        const item = cartProducts.filter(
            (elm) => elm.product_id == product.product_id
        )[0];
        return item;
    };

    const addToCart = () => {
        if (!isIncludeCard()) {
            const item = {
                ...product,
                // 4. Add the translated name to the cart item
                product_name: productName, 
                category_name: capitalizeEachWord(
                    category.split("-").join(" ")
                ),
                subcategory_name: capitalizeEachWord(
                    subcategory.split("-").join(" ")
                ),
            };
            item.quantity = quantity;
            setCartProducts((pre) => [...pre, item]);
            document.getElementById("cartDrawerOverlay").classList.add("page-overlay_visible");
            document.getElementById("cartDrawer").classList.add("aside_visible");
        }
    };

    function capitalizeEachWord(str) {
        // This function remains the same
        return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }

    useEffect(() => {
        // This observer logic remains the same
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

    if (!show) return null;

    return (
        <div className="sticky-container d-flex align-items-center position-fixed start-50 translate-middle-x shadow rounded-pill border bg-white">
            <Image
                width={100}
                height={100}
                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`}
                // 5. Use the translated name in the alt text
                alt={`Thumbnail for ${productName}`}
                className="rounded-circle border img"
            />

            <div className="flex-grow-1 text-truncate">
                {/* 6. Use the translated name for display and title */}
                <p className="mb-0 fw-medium" title={productName}>
                    {productName}
                </p>
                <p className="mb-0 fw-bold">
                    {renderPrice(product, currency)}
                </p>
            </div>

            <button
                id="product-detail-top"
                type="button"
                className="btn btn-dark d-flex align-items-center gap-2 rounded-pill fw-semibold"
                // 7. Use the translated name in the aria-label
                aria-label={t('addToCartLabel', { name: productName })}
                disabled={!!isIncludeCard()}
                onClick={() => !isIncludeCard() && addToCart()}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#27272a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#000")}
            >
                <ShoppingCart size={18} />
                {/* 8. Use translation keys for button text */}
                {isIncludeCard() ? t("alreadyAdded") : t("addToCart")}
            </button>
        </div>
    );
};

export default Sticky;