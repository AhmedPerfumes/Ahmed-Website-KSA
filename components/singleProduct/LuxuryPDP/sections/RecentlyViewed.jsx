"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

/**
 * RecentlyViewed — Section 14
 *
 * Reads from localStorage key "ahmed_recently_viewed".
 * This component also WRITES the current product to the list on mount.
 *
 * localStorage item format:
 *   [{ product_id, product_name, slug, category, subcategory, image, price }]
 *
 * Max 10 items stored. Current product is excluded from display.
 * Purely client-side — no SSR, no API call.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const STORAGE_KEY = "ahmed_recently_viewed";
const MAX_ITEMS = 10;

const RecentlyViewed = ({ product }) => {
  const locale = useLocale();
  const [viewed, setViewed] = useState([]);

  useEffect(() => {
    if (!product?.product_id) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      // Remove duplicates of current product
      const filtered = existing.filter(
        (item) => item.product_id !== product.product_id
      );

      // Persist current product to the list
      const images = product?.images
        ? (typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images)
        : [];

      const entry = {
        product_id: product.product_id,
        product_name: product.product_name,
        slug: product.slug || product.product_name?.toLowerCase().replace(/ /g, "-"),
        category: product.category,
        subcategory: product.subcategory,
        image: images[0] || null,
        price: product.price,
        discount: product.discount || null,
      };

      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Display: everything except current product
      setViewed(filtered.slice(0, 8));
    } catch (_) {
      // localStorage unavailable — fail silently
    }
  }, [product?.product_id]);

  if (viewed.length === 0) return null;

  return (
    <section className="pdp-recent" aria-labelledby="recent-heading">
      <div className="pdp-container">
        <header className="pdp-section-header" style={{ textAlign: "left" }}>
          <span className="pdp-section-eyebrow">Continue Browsing</span>
          <h2 className="pdp-section-title" id="recent-heading">
            Recently Viewed
          </h2>
        </header>

        <div className="pdp-recent__slider" role="list">
          {viewed.map((item, idx) => {
            const href = `/${locale}/shop/${item.category}/${item.subcategory}/${item.slug}`;
            return (
              <Link
                key={idx}
                href={href}
                className="pdp-recent-card"
                role="listitem"
                aria-label={item.product_name}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "3/4",
                    borderRadius: "6px",
                    overflow: "hidden",
                    marginBottom: "0.5rem",
                    background: "#F2EDE6",
                  }}
                >
                  {item.image ? (
                    <Image
                      src={`${API_URL}storage/${item.image}`}
                      alt={item.product_name || "Recently viewed product"}
                      fill
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <Image
                      src="/assets/images/general_product.png"
                      alt={item.product_name || "Product"}
                      fill
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <p className="pdp-recent-card__name">{item.product_name}</p>
                <p className="pdp-recent-card__price">
                  {item.price ? `SAR ${parseFloat(item.price).toFixed(2)}` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
