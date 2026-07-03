"use client";

import React from "react";
import { useLocale } from "next-intl";

/**
 * BrandNarrative — Section 8
 *
 * Full-width dark background with product story / brand quote.
 * Uses product.story or product.story_ar (locale-aware).
 * Conditionally rendered — returns null if no story.
 *
 * API fields: product.story, product.story_ar
 */

const BrandNarrative = ({ product }) => {
  const locale = useLocale();
  const isAr = locale === "ar";

  const story = isAr
    ? product?.story_ar || product?.story
    : product?.story;

  if (!story) return null;

  return (
    <section className="pdp-narrative pdp-fade-in" aria-labelledby="narrative-heading">
      <div className="pdp-container">
        <div className="pdp-narrative__inner">
          <header style={{ marginBottom: "2rem" }}>
            <span className="pdp-section-eyebrow" style={{ color: "#C9A96E" }}>
              The Story Behind
            </span>
          </header>

          <blockquote
            className="pdp-narrative__quote"
            id="narrative-heading"
            itemProp="description"
          >
            {story}
          </blockquote>

          <p className="pdp-narrative__source">
            Ahmed Al Maghribi Perfumes
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandNarrative;
