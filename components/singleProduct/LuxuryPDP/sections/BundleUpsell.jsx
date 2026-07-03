"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { renderPrice } from "@/utlis/priceRenderer";
import he from "he";

/**
 * BundleUpsell — Section 10
 *
 * AOV booster. Shows:
 *   A) If product.is_collection == 1: displays collection_items with
 *      bundle savings summary ("Buy together & save X%")
 *   B) If item_family products exist: shows complementary products
 *      from the same family as "Complete the Collection"
 *
 * Lazy loaded (see LuxuryPDP.jsx dynamic import).
 *
 * API fields:
 *   product.is_collection, product.collection_items[],
 *   product.item_family[], product.price, product.discount
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const BundleCard = ({ item, locale, currency, onAddToCart, isInCart }) => {
  const name = locale === "ar"
    ? he.decode(item?.name_ar || item?.name || "")
    : he.decode(item?.name || item?.product_name || "");

  const images = item?.images
    ? (typeof item.images === "string" ? JSON.parse(item.images) : item.images)
    : [];

  const imgSrc = images[0]
    ? `${API_URL}storage/${images[0]}`
    : "/assets/images/general_product.png";

  return (
    <div className="pdp-bundle-card">
      <div style={{ position: "relative", aspectRatio: "1/1" }}>
        <Image
          src={imgSrc}
          alt={name}
          fill
          loading="lazy"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="pdp-bundle-card__body">
        <p className="pdp-bundle-card__name">{name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="pdp-bundle-card__price">
            {renderPrice(item, currency)}
          </span>
        </div>
        {onAddToCart && (
          <button
            onClick={() => !isInCart && onAddToCart(item)}
            disabled={isInCart}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "6px",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "1.5px solid #1A1A1A",
              borderRadius: "100px",
              background: isInCart ? "#F2EDE6" : "transparent",
              color: isInCart ? "#9E7A42" : "#1A1A1A",
              cursor: isInCart ? "default" : "pointer",
            }}
          >
            {isInCart ? "✓ Added" : "Add"}
          </button>
        )}
      </div>
    </div>
  );
};

const BundleUpsell = ({ product }) => {
  const locale = useLocale();
  const t = useTranslations("ProductDetails");
  const { currency } = useMenu();
  const { cartProducts, setCartProducts, isAddedToCartProducts } = useContextElement();

  const isCollection = product?.is_collection == 1;
  const collectionItems = product?.collection_items || [];
  const familyItems = (product?.item_family || []).filter(
    (item) => item.product_id !== product?.product_id
  ).slice(0, 6);

  // Collection savings calculation
  const { savings, savingsPercent } = useMemo(() => {
    if (!isCollection || !collectionItems.length) return { savings: 0, savingsPercent: 0 };
    const now = new Date();
    const total = collectionItems.reduce((acc, item) => {
      if (!item.child_product_id) return acc;
      const d = item.discount;
      if (d && new Date(d.start_date) <= now && new Date(d.end_date) >= now) {
        if (d.discount_type === "percent") return acc + (item.price - (item.price * d.value / 100));
        if (d.discount_type === "amount" && d.final_price) return acc + parseFloat(d.final_price);
      }
      return acc + parseFloat(item.price || 0);
    }, 0);
    const bundlePrice = parseFloat(product?.price || 0);
    const saved = total - bundlePrice;
    const pct = total > 0 ? Math.round((saved / total) * 100) : 0;
    return { savings: saved, savingsPercent: pct };
  }, [product, isCollection, collectionItems]);

  const addToCart = (item) => {
    if (!isAddedToCartProducts(item.product_id)) {
      setCartProducts((prev) => [
        ...prev,
        {
          ...item,
          quantity: 1,
          category_name: item.category_name || "",
          subcategory_name: item.subcategory_name || "",
        },
      ]);
    }
  };

  // Decide which items to show
  const showCollection = isCollection && collectionItems.filter((i) => i.child_product_id).length > 0;
  const showFamily = !showCollection && familyItems.length > 1;

  if (!showCollection && !showFamily) return null;

  const items = showCollection
    ? collectionItems.filter((i) => i.child_product_id)
    : familyItems;

  const heading = showCollection
    ? t("accordion.whatIsIncluded")
    : t("discoverMore", { familyName: he.decode(product?.product_family || ""), bold: (c) => c });

  return (
    <section className="pdp-bundle pdp-fade-in" aria-labelledby="bundle-heading">
      <div className="pdp-container">
        <header className="pdp-section-header">
          <span className="pdp-section-eyebrow">
            {showCollection ? "What's Included" : "Complete the Collection"}
          </span>
          <h2 className="pdp-section-title" id="bundle-heading">
            {showCollection
              ? "Collection Contents"
              : "You May Also Love"}
          </h2>
          {showCollection && savingsPercent > 0 && (
            <p style={{ color: "#2A7A52", fontWeight: 600, marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Bundle & Save {savingsPercent}% · {currency?.symbol}
              {savings.toFixed(2)} off individual prices
            </p>
          )}
        </header>

        <div className="pdp-bundle__slider" role="list">
          {items.map((item, idx) => (
            <div key={idx} role="listitem">
              <BundleCard
                item={item}
                locale={locale}
                currency={currency}
                onAddToCart={showFamily ? addToCart : null}
                isInCart={showFamily ? isAddedToCartProducts(item.product_id) : false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BundleUpsell;
