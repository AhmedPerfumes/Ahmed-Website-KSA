"use client";

import React from "react";
import { useLocale } from "next-intl";

/**
 * OccasionSection — Section 9
 *
 * Displays occasion chips derived from:
 *   1. product.occasion (free-text, split by comma/slash)
 *   2. product.fragrance_category (e.g., "Oriental", "Floral")
 *   3. product.category as a fallback context
 *
 * Visual: scrollable chip row, no JS interaction required.
 * Conditionally rendered — returns null if no occasion data.
 *
 * API fields: product.occasion, product.fragrance_category, product.subcategory
 */

const OCCASION_ICONS = {
  day:      "☀️",
  morning:  "🌅",
  daily:    "🗓️",
  evening:  "🌙",
  night:    "✨",
  formal:   "👔",
  office:   "💼",
  work:     "💼",
  casual:   "👟",
  outdoor:  "🌿",
  wedding:  "💍",
  gift:     "🎁",
  travel:   "✈️",
  seasonal: "🍂",
  winter:   "❄️",
  summer:   "🌊",
  romantic: "🌹",
  all:      "⭐",
  default:  "🌸",
};

const getChipIcon = (label = "") => {
  const lower = label.toLowerCase();
  for (const [key, icon] of Object.entries(OCCASION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return OCCASION_ICONS.default;
};

const OccasionSection = ({ product }) => {
  const locale = useLocale();

  const occasion = product?.occasion || "";
  const fragranceCategory = product?.fragrance_category || "";

  // Parse occasion text into chip array
  const rawChips = occasion
    ? occasion.split(/[,\/|&]/).map((s) => s.trim()).filter(Boolean)
    : [];

  // Add fragrance category as a chip if not already in list
  if (fragranceCategory && !rawChips.some((c) => c.toLowerCase() === fragranceCategory.toLowerCase())) {
    rawChips.unshift(fragranceCategory);
  }

  if (rawChips.length === 0) return null;

  return (
    <section className="pdp-occasion pdp-fade-in" aria-labelledby="occasion-heading">
      <div className="pdp-container">
        <header className="pdp-section-header">
          <span className="pdp-section-eyebrow">Perfect For</span>
          <h2 className="pdp-section-title" id="occasion-heading">
            When to Wear It
          </h2>
        </header>

        <div
          className="pdp-occasion__chips"
          role="list"
          aria-label="Recommended occasions"
        >
          {rawChips.map((chip, idx) => (
            <div
              key={idx}
              className="pdp-occasion__chip"
              role="listitem"
            >
              <span className="pdp-occasion__chip-icon" aria-hidden="true">
                {getChipIcon(chip)}
              </span>
              {chip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionSection;
