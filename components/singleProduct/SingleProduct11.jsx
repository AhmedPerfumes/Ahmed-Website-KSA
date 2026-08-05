"use client";
import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import LuxuryPDP from "./LuxuryPDP/LuxuryPDP";

/**
 * SingleProduct11 — Product Detail Page Shell
 *
 * Responsibilities:
 *  1. Receive SSR-hydrated product data from the page route
 *  2. Run live-status API poll to refresh stock / price / discount
 *  3. Render <LuxuryPDP /> with the up-to-date product object
 *
 * All visual/UX logic lives in LuxuryPDP and its section components.
 */
export default function SingleProduct11({ category, subcategory, product: initialProduct }) {
  const locale = useLocale();
  const [product, setProduct] = useState(initialProduct);

  // Sync if route changes (next-intl page transitions)
  useEffect(() => {
    if (initialProduct?.product_id !== product?.product_id) {
      setProduct(initialProduct);
    }

    // Live-status hydration: refresh price, stock, discount from server
    const fetchLiveStatus = async () => {
      if (!initialProduct?.product_id) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/products/live-status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_ids: [initialProduct.product_id] }),
          }
        );
        if (!response.ok) return;
        const liveData = await response.json();
        if (Array.isArray(liveData) && liveData.length > 0) {
          const liveItem = liveData[0];
          setProduct((prev) => ({
            ...prev,
            product_qty: liveItem.product_qty,
            price: liveItem.price,
            sale_price: liveItem.sale_price,
            // Preserve SSR discount if live-status returns null — live-status
            // endpoint may not JOIN the discounts table, so null would wipe the
            // group discount that ItemFamilySlider needs.
            discount: liveItem.discount ?? prev.discount,
            maximum_order_quantity: liveItem.maximum_order_quantity,
          }));
        }
      } catch (err) {
        console.error("Live product hydration failed", err);
      }
    };

    fetchLiveStatus();
  }, [initialProduct?.product_id]);

  if (!product || !Object.keys(product).length) {
    return (
      <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">
        No Product Found
      </h2>
    );
  }

  return (
    <LuxuryPDP
      product={product}
      category={category}
      subcategory={subcategory}
    />
  );
}
