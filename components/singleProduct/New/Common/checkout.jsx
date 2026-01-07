import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { renderPrice } from "@/utlis/priceRenderer";

const Checkout = ({ product }) => {
    // const sizes = [product.size];
    // const [selectedSize, setSelectedSize] = useState(sizes[0]);
    const {
        isLoading: isMenuLoading,
        error: isMenuError,
        currency,
    } = useMenu();
    const { cartProducts, setCartProducts } = useContextElement();
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);
    const locale = useLocale();
    const t = useTranslations();
    let category = product?.category;
    let subcategory = product?.subcategory;

    const isIncludeCard = () => {
        const item = cartProducts.filter(
            (elm) => elm.product_id == product.product_id
        )[0];
        return item;
    };
    const setQuantityCartItem = (id, quantity) => {
        if (isIncludeCard()) {
            if (quantity >= 1 && quantity <= product.product_qty) {
                setError(null);
                const item = cartProducts.filter(
                    (elm) => elm.product_id == id
                )[0];
                const items = [...cartProducts];
                const itemIndex = items.indexOf(item);
                item.quantity = quantity;
                items[itemIndex] = item;
                setCartProducts(items);
            } else {
                setError("Quantity is more than available quantity");
            }
        } else {
            setQuantity(
                quantity <= product.product_qty && quantity >= 1
                    ? quantity
                    : product.product_qty
            );
            setError(null);
            if (quantity > product.product_qty) {
                setError("Quantity is more than available quantity");
            } else {
                setError(null);
            }
        }
    };
    const addToCart = () => {
        if (!isIncludeCard()) {
            const item = {
                ...product,
                category_name: capitalizeEachWord(
                    category.split("-").join(" ")
                ),
                subcategory_name: capitalizeEachWord(
                    subcategory.split("-").join(" ")
                ),
            };
            item.quantity = quantity;
            setCartProducts((pre) => [...pre, item]);
            document
                .getElementById("cartDrawerOverlay")
                .classList.add("page-overlay_visible");
            document
                .getElementById("cartDrawer")
                .classList.add("aside_visible");
        }
    };

    function cleanProductName(productName) {
        // Step 1: Remove any non-alphanumeric characters except for spaces
        const dynamicKey =
            productName.replace(/[^a-zA-Z0-9\s]/g, "") + " Description";

        // Step 2: Words to remove
        const wordsToRemove = [
            "&",
            " &",
            "& ",
            " & ",
            "amp",
            " amp",
            "amp ",
            " amp ",
            ";",
            " ;",
            "; ",
            " ; ",
        ];

        // Step 3: Remove the words from the dynamic key (case insensitive)
        let cleanString = dynamicKey;
        wordsToRemove.forEach((word) => {
            const regex = new RegExp(word, "gi"); // 'gi' for global and case-insensitive replacement
            cleanString = cleanString.replace(regex, "");
        });

        // Step 4: Replace multiple spaces with a single space
        cleanString = cleanString.replace(/\s+/g, " ").trim(); // Trim to remove leading/trailing spaces

        return cleanString;
    }

    function capitalizeEachWord(str) {
        return str
            .split(" ") // Split the sentence into words
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ) // Capitalize first letter of each word
            .join(" "); // Join the words back into a sentence
    }

    // const price = (elm) => {
    //     const currentUTC = new Date(); // Current UTC time
    //     const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000); // Add 4 hours for GST
    //     const current_date_time = currentGST
    //         .toISOString()
    //         .slice(0, 19)
    //         .replace("T", " ");
    //     if (elm?.discount) {
    //         if (
    //             new Date(current_date_time) >=
    //                 new Date(elm.discount.start_date) &&
    //             new Date(current_date_time) <= new Date(elm.discount.end_date)
    //         ) {
    //             return (
    //                 <>
    //                     <span className="money price price-old">
    //                         {currency.symbol}
    //                         {elm?.price}
    //                     </span>{" "}
    //                     <span className="money price price-sale">
    //                         {" "}
    //                         {currency.symbol}
    //                         {(
    //                             elm.price -
    //                             (elm.price / 100) * elm.discount.value
    //                         ).toFixed(2)}
    //                     </span>
    //                 </>
    //             );
    //         } else {
    //             return (
    //                 <span className="money price">
    //                     {elm?.price}
    //                     {currency.symbol}
    //                 </span>
    //             );
    //         }
    //     } else if (elm?.sale_price) {
    //         return (
    //             <>
    //                 <span className="money price price-sale">
    //                     {currency.symbol}
    //                     {elm.sale_price.toFixed(2)}
    //                 </span>
    //                 <span className="money price price-old">
    //                     {currency.symbol}
    //                     {elm?.price}
    //                 </span>{" "}
    //             </>
    //         );
    //     } else {
    //         return (
    //             <span className="money price">
    //                 {elm?.price}
    //                 {currency.symbol}
    //             </span>
    //         );
    //     }
    // };

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
  <div className="w-100 mt-3">
    <div
      className="d-flex justify-content-between align-items-center border-bottom pb-1"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <label
        htmlFor="size-select"
        className="text-muted me-2 mb-0 h6"
      >
        Size:
      </label>

      {/* CHANGED: This container will now hold one or more tags */}
      <div
        className="d-flex flex-wrap justify-content-end gap-2"
        style={{ maxWidth: "150px" }}
      >
        {/* CHANGED: Mapping over the product.tags array */}
        {product.tags.map((tag, index) => (
          <div
            // ADDED: A unique key is required for each item in a loop
            key={index}
            className="btn btn-sm"
            style={{
              backgroundColor: "rgba(250, 249, 247)",
              color: "#000",
              fontSize: "0.875rem",
              padding: "4px 8px",
              cursor: "default", // It looks like a button, but isn't clickable
            }}
          >
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
                {product.product_qty > 0 ? (
                    <div className="d-flex w-100 gap-2" style={{ height: 48 }}>
                        {/* Left Pill (Add to Cart → Already Added) */}
                        <motion.button
                            layout
                            type="button"
                            id="product-detail-top"
                            onClick={() => !isIncludeCard() && addToCart()}
                            className="btn btn-dark rounded-pill fw-semibold d-flex align-items-center justify-content-center shadow-sm"
                            disabled={!!isIncludeCard()}
                            style={{ height: 48, flexShrink: 0 }}
                            animate={{
                                width: !!isIncludeCard() ? "60%" : "100%", // now shrinks from right side
                            }}
                            transition={{
                                type: "tween", // simple interpolation, no physics
                                duration: 0.1, // adjust speed
                            }}
                        >
                            {!!isIncludeCard()
                                ? t("Already Added")
                                : t("Add to Cart")}
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
                                    transition={{
                                        type: "tween", // simple interpolation, no physics
                                        duration: 0.1, // adjust speed
                                    }}
                                    className="btn btn-dark rounded-pill fw-semibold d-flex align-items-center justify-content-between shadow-sm px-2 overflow-hidden"
                                    style={{ height: 48 }}
                                >
                                    <button
                                        aria-label="Decrease quantity"
                                        onClick={() =>
                                            setQuantityCartItem(
                                                product.product_id,
                                                Math.max(
                                                    1,
                                                    (isIncludeCard()
                                                        ?.quantity ?? 1) - 1
                                                )
                                            )
                                        }
                                        className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 34,
                                            height: 34,
                                            background:
                                                "rgba(255,255,255,0.12)",
                                            color: "#fff",
                                        }}
                                    >
                                        −
                                    </button>

                                    <span
                                        className="px-2 text-white"
                                        style={{
                                            minWidth: 36,
                                            textAlign: "center",
                                            userSelect: "none",
                                        }}
                                    >
                                        {isIncludeCard()?.quantity ?? 1}
                                    </span>

                                    <button
                                        aria-label="Increase quantity"
                                        onClick={() =>
                                            setQuantityCartItem(
                                                product.product_id,
                                                Math.min(
                                                    product.product_qty,
                                                    (isIncludeCard()
                                                        ?.quantity ?? 1) + 1
                                                )
                                            )
                                        }
                                        className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 34,
                                            height: 34,
                                            background:
                                                "rgba(255,255,255,0.12)",
                                            color: "#fff",
                                        }}
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
                        className="btn btn-dark text-white w-100 rounded-pill fw-semibold shadow-sm"
                        disabled
                        style={{ height: 48 }}
                    >
                        {t("Out of Stock")}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Checkout;
