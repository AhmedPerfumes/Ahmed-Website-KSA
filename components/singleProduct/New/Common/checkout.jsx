import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { renderPrice } from "@/utlis/priceRenderer";
import TamaraWidget from "@/components/TamaraWidget";
import { toast } from 'react-toastify';

const Checkout = ({ product }) => {
    // const sizes = [product.size];
    // const [selectedSize, setSelectedSize] = useState(sizes[0]);
    const { currency, } = useMenu();
    const { cartProducts, setCartProducts, removeProduct } = useContextElement();
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);
    const locale = useLocale();
    const t = useTranslations();

    let category = product?.category;
    let subcategory = product?.subcategory;

    const isIncludeCard = () => {
        const item = cartProducts.filter((elm) => elm.product_id == product.product_id)[0];
        return item;
    };
    const currentItem = isIncludeCard();
    const currentQuantity = currentItem ? currentItem.quantity : quantity;


    // useEffect(() => {
    // const tamaraPromoScript = document.createElement("script");
    // tamaraPromoScript.src = "https://cdn-sandbox.tamara.co/widget-v2/tamara-widget.js";
    // tamaraPromoScript.async = true;
    // document.body.appendChild(tamaraPromoScript);

    // return () => {
    //     document.body.removeChild(tamaraPromoScript);
    // };
    // }, []);

    // useEffect(() => {
    // window.tamaraSettings = {
    //     lang: "en",
    //     country: "AE",
    //     publicKey: "258c1cec-32f2-4290-9fde-83b3018848e9",
    // };

    // const tamaraPromoScript = document.createElement("script");
    // tamaraPromoScript.src = "https://cdn-sandbox.tamara.co/widget-v2/tamara-widget.js";
    // tamaraPromoScript.async = true;
    // document.body.appendChild(tamaraPromoScript);

    // return () => {
    //     document.body.removeChild(tamaraPromoScript);
    // };
    // }, []);

    // const setQuantityCartItem = (id, quantity) => {
    //     if (isIncludeCard()) {
    //         if (quantity >= 1 && quantity <= product.product_qty) {
    //             setError(null);
    //             const item = cartProducts.filter(
    //                 (elm) => elm.product_id == id
    //             )[0];
    //             const items = [...cartProducts];
    //             const itemIndex = items.indexOf(item);
    //             item.quantity = quantity;
    //             items[itemIndex] = item;
    //             setCartProducts(items);
    //         } else {
    //             setError("Quantity is more than available quantity");
    //         }
    //     } else {
    //         setQuantity(
    //             quantity <= product.product_qty && quantity >= 1
    //                 ? quantity
    //                 : product.product_qty
    //         );
    //         setError(null);
    //         if (quantity > product.product_qty) {
    //             setError("Quantity is more than available quantity");
    //         } else {
    //             setError(null);
    //         }
    //     }
    // };

    // const setQuantityCartItem = (id, quantity) => {
    //     // First check: within product stock
    //     const withinStock = quantity >= 1 && quantity <= product.product_qty;

    //     // Second check: max 6 per product
    //     const withinLimit = quantity <= 6;

    //     if (isIncludeCard()) {
    //         if (withinStock && withinLimit) {
    //         setError(null);

    //         const items = [...cartProducts];
    //         const itemIndex = items.findIndex((elm) => elm.product_id == id);

    //         if (itemIndex !== -1) {
    //             items[itemIndex] = {
    //             ...items[itemIndex],
    //             quantity
    //             };
    //         }

    //         setCartProducts(items);
    //         } else {
    //         setError(
    //             !withinStock
    //             ? "Quantity is more than available quantity"
    //             : "Maximum allowed quantity is 6"
    //         );
    //         }
    //     } else {
    //         const validQty = withinStock && withinLimit ? quantity : Math.min(product.product_qty, 6);

    //         setQuantity(validQty);

    //         setError(
    //         !withinStock
    //             ? "Quantity is more than available quantity"
    //             : "Maximum allowed quantity is 6"
    //         );
    //     }
    // };

    const setQuantityCartItem = (id, quantity, maxOrderQty) => {
        const qty = Number(quantity);
        const stock = Number(product.product_qty);
        const maxOrder = Number(maxOrderQty);
        
        const limit = (maxOrder && maxOrder > 0) ? maxOrder : stock;

        const isValid = qty <= stock && qty <= limit;

        if (isIncludeCard()) {
            if (isValid) {
                setError(null);

                const items = [...cartProducts];
                const itemIndex = items.findIndex((elm) => elm.product_id == id);

                if (itemIndex !== -1) {
                    items[itemIndex] = { ...items[itemIndex], quantity, };
                }
                setCartProducts(items);
            } else {
                // FAILURE: Show specific error
                const errorMsg = qty > stock ? "Quantity is more than available quantity" : `Maximum allowed quantity is ${limit}`;
                setError(errorMsg);
            }
        } else {
            if (isValid) {
                setQuantity(qty);
                setError(null); // Clear error if valid
            } else {
                // Cap the value to the max allowed so user doesn't get stuck
                const errorMsg = qty > stock ? "Quantity is more than available quantity" : `Maximum allowed quantity is ${limit}`;
                setError(errorMsg);
            }
        }
    };


    const addToCart = () => {
        if (!isIncludeCard()) {
            const item = {
                ...product,
                category_name: capitalizeEachWord(category.split("-").join(" ")),
                subcategory_name: capitalizeEachWord(subcategory.split("-").join(" ")),
            };
            item.quantity = quantity;
            setCartProducts((pre) => [...pre, item]);
            setError(null)
            toast.success("Added to Cart", { position: "bottom-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, });
            // document.getElementById("cartDrawerOverlay").classList.add("page-overlay_visible");
            // document.getElementById("cartDrawer").classList.add("aside_visible");
        }
    };

    // function cleanProductName(productName) {
    //     // Step 1: Remove any non-alphanumeric characters except for spaces
    //     const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, "") + " Description";

    //     // Step 2: Words to remove
    //     const wordsToRemove = [ "&", " &", "& ", " & ", "amp", " amp", "amp ", " amp ", ";", " ;", "; ", " ; ",];

    //     // Step 3: Remove the words from the dynamic key (case insensitive)
    //     let cleanString = dynamicKey;
    //     wordsToRemove.forEach((word) => {
    //         const regex = new RegExp(word, "gi"); // 'gi' for global and case-insensitive replacement
    //         cleanString = cleanString.replace(regex, "");
    //     });

    //     // Step 4: Replace multiple spaces with a single space
    //     cleanString = cleanString.replace(/\s+/g, " ").trim(); // Trim to remove leading/trailing spaces

    //     return cleanString;
    // }

    function capitalizeEachWord(str) {
        return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }

    // const price = (elm) => {
    //     const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // GST offset
    //     const start = new Date(elm?.discount?.start_date);
    //     const end = new Date(elm?.discount?.end_date);

    //     if (elm?.discount && now >= start && now <= end) {
    //         const { discount_type, value } = elm.discount;

    //         if (discount_type === "percent") {
    //             return ((elm.price - (elm.price * value) / 100).toFixed(2));
    //         } else if (discount_type === "amount") {
    //             return parseFloat(elm.discount.final_price).toFixed(2);
    //         }
    //     }

    //     // Default fallback
    //     return parseFloat(elm.price).toFixed(2);
    // };

    const tabbyPrice = (elm) => {
        const currentUTC = new Date();
        const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
        const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
        
        let finalPrice = elm?.price;

        if (elm?.discount) {
            if ( new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
                finalPrice = (elm.price - (elm.price / 100) * elm.discount.value).toFixed(2);
            }
        } else if (elm?.sale_price) {
            finalPrice = (elm.price - (elm.price / 100) * elm.sale_price).toFixed(2);
        }
        
        return finalPrice;
    };

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10;

        // 1. Define render function with safety checks
        const renderTabbyWidget = () => {
            // Check if element exists AND if TabbyPromo is a valid constructor
            if (window.TabbyPromo && typeof window.TabbyPromo === 'function') {
                try {
                    const tabbyNode = document.getElementById("TabbyPromo");
                    if (tabbyNode) tabbyNode.innerHTML = "";

                    const unitPrice = parseFloat(tabbyPrice(product));
                    const totalPrice = (unitPrice * currentQuantity).toFixed(2);

                    new window.TabbyPromo({
                        selector: "#TabbyPromo",
                        currency: "SAR",
                        price: totalPrice,
                        lang: locale,
                        source: "product",
                        publicKey: 'pk_test_019228fd-8e52-3ecd-f813-bf11dc8e2118',
                        merchantCode: "assaaste",
                    });
                } catch (err) {
                    console.error("Tabby Widget Error:", err);
                }
            } else {
                // If script exists but global isn't ready, retry briefly
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(renderTabbyWidget, 500);
                }
            }
        };

        // 2. Load Script if not present
        const scriptId = "tabby-promo-script";
        if (!document.getElementById(scriptId)) {
            const tabbyPromoScript = document.createElement("script");
            tabbyPromoScript.src = "https://checkout.tabby.ai/tabby-promo.js";
            tabbyPromoScript.id = scriptId;
            tabbyPromoScript.async = true;
            document.body.appendChild(tabbyPromoScript);

            tabbyPromoScript.onload = () => {
                renderTabbyWidget();
            };
        } else {
            // Script tag exists, attempt render immediately (will retry if not ready)
            renderTabbyWidget();
        }

    // Dependency array
    }, [currentQuantity, locale, cartProducts]);

    return (
        <div>
            {/* Price */}
            {/* <div className="d-flex justify-content-between align-items-center mt-3">
                <p
                    className="fw-bolder text-dark mb-0"
                    style={{ fontSize: "1.5rem" }}
                >
                    {product?.price || "0.00"} د.إ
                </p>
            </div> */}
            <div className="product-single__price">{renderPrice(product, currency)}</div>
            {/* Size Selector */}
            {/* <div className="w-100 mt-3">
                <div
                    className="d-flex justify-content-between border-bottom pb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                >
                    <label
                        htmlFor="size-select"
                        className="text-muted me-2 mb-0 h6"
                    >
                        Size:
                    </label>

                    <div
                        className="position-relative w-100"
                        style={{ maxWidth: "100px" }}
                    >
                        {sizes.length > 1 ? (
                            <div className="dropdown w-100">
                                <button
                                    className="btn btn-sm dropdown-toggle w-100 text-start"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{
                                        backgroundColor: "rgba(250, 249, 247)", // glassy effect
                                        backdropFilter: "blur(6px)",
                                        color: "#000",
                                        fontSize: "0.875rem",
                                        padding: "4px 8px",
                                    }}
                                >
                                    {selectedSize}
                                </button>

                                <ul
                                    className="dropdown-menu w-100"
                                    style={{
                                        fontSize: "0.875rem",
                                        minWidth: "100px",
                                    }}
                                >
                                    {sizes.map((size) => (
                                        <li key={size}>
                                            <button
                                                className="dropdown-item"
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSize(size)
                                                }
                                            >
                                                {size}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div
                                className="btn btn-sm w-100 text-start"
                                style={{
                                    backgroundColor: "rgba(250, 249, 247)", // glassy effect
                                    backdropFilter: "blur(6px)",
                                    color: "#000",
                                    fontSize: "0.875rem",
                                    padding: "4px 8px",
                                    cursor: "default", // Prevent pointer cursor
                                }}
                            >
                                {selectedSize}
                            </div>
                        )}
                    </div>
                </div>
            </div> */}
            {/* CHANGED: Condition now checks for a non-empty 'tags' array */}
            {product?.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="w-100 mb-3">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1" style={{ fontFamily: "Georgia, serif" }} >
                        <label htmlFor="size-select" className="text-muted me-2 mb-0 h6" >
                            Size:
                        </label>

                        {/* CHANGED: This container will now hold one or more tags */}
                        <div className="d-flex flex-wrap justify-content-end gap-2" style={{ maxWidth: "150px" }} >
                            {/* CHANGED: Mapping over the product.tags array */}
                            {product.tags.map((tag, index) => (
                                <div key={index} className="btn btn-sm" style={{ backgroundColor: "rgba(250, 249, 247)", color: "#000", fontSize: "0.875rem", padding: "4px 8px", cursor: "default", }} >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Add to Cart Button */}
            {/* <button
                type="submit"
                onClick={() => addToCart()}
                id="product-detail-top"
                className={`btn w-100 mt-4 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2 
        ${product.product_qty > 0 ? "btn-dark" : "btn-dark text-white"}`}
                disabled={product.product_qty <= 0}
            >
                {product.product_qty > 0
                    ? isIncludeCard()
                        ? t("Already Added")
                        : t("Add to Cart")
                    : t("Out of Stock")}
            </button> */}
            {/* Cart Actions (drop-in replacement for your "new" block) */}
            <div className="mt-4">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div 
                                className="alert alert-danger d-flex align-items-center py-2 px-3 mb-0" 
                                role="alert"
                                style={{ fontSize: "0.9rem", borderRadius: "8px" }}
                            >
                                {/* Warning Icon */}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    fill="currentColor" 
                                    className="bi bi-exclamation-circle-fill me-2 flex-shrink-0" 
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                                </svg>
                                {/* Error Text */}
                                <div>{error}</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* <tamara-widget type="tamara-summary" lang="en" amount={price(product)} inline-type='2' inline-variant='outlined' config='{"theme":"light","badgePosition":"","showExtraContent":"","hidePayInX":false}'></tamara-widget> */}
                {product.product_qty > 0 ? (
                    <div className="d-flex w-100 gap-2 mt-3" style={{ height: 48 }}>
                        {/* Left Pill (Add to Cart → Already Added) */}
                        <motion.button 
                            layout
                            type="button"
                            id="product-detail-top"
                            onClick={() => !isIncludeCard() && addToCart()}
                            className="btn btn-dark rounded-pill fw-semibold d-flex align-items-center justify-content-center shadow-sm"
                            disabled={!!isIncludeCard()}
                            style={{ height: 48, flexShrink: 0 }}
                            animate={{ width: !!isIncludeCard() ? "60%" : "100%", }}
                            transition={{ type: "tween", duration: 0.1, }}
                        >
                            {!!isIncludeCard() ? t("Already Added") : t("Add to Cart")}
                        </motion.button>

                        {/* Right Pill (Quantity Selector) */}
                        <AnimatePresence>
                            {!!isIncludeCard() && (
                                <motion.div
                                    key="qty"
                                    layout
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "40%", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "tween", duration: 0.1, }}
                                    className="btn btn-dark rounded-pill fw-semibold d-flex align-items-center justify-content-between shadow-sm px-2 overflow-hidden"
                                    style={{ height: 48 }}
                                >
                                    <button
                                        aria-label="Decrease quantity"
                                        onClick={() => {
                                            const currentQty = isIncludeCard()?.quantity ?? 1;
                                            if(currentQty > 1) {
                                                setQuantityCartItem(product.product_id, currentQty - 1, product?.maximum_order_quantity )
                                            } else {
                                                removeProduct(product.product_id)
                                            }
                                        }}
                                        className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                                        style={{ width: 34, height: 34, background: "rgba(255,255,255,0.12)", color: "#fff", }}
                                    >
                                        −
                                    </button>

                                    <span className="px-2 text-white" style={{ minWidth: 36, textAlign: "center", userSelect: "none", }} >
                                        {isIncludeCard()?.quantity ?? 1}
                                    </span>

                                    <button
                                        aria-label="Increase quantity"
                                        onClick={() => setQuantityCartItem(product.product_id, (isIncludeCard() ?.quantity ?? 1) + 1 , product?.maximum_order_quantity )}
                                        className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                                        style={{ width: 34, height: 34, background: "rgba(255,255,255,0.12)", color: "#fff", }}
                                    >
                                        +
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button
                        type="button"
                        id="product-detail-top"
                        className="btn btn-dark text-white w-100 rounded-pill fw-semibold shadow-sm"
                        disabled
                        style={{ height: 48 }}
                    >
                        {t("Out of Stock")}
                    </button>
                )}

                <div className="my-3" id="TabbyPromo"></div>
                <TamaraWidget inlineType="6" inlineVariant='outlined' locale={locale}/>
            </div>
        </div>
    );
};

export default Checkout;
