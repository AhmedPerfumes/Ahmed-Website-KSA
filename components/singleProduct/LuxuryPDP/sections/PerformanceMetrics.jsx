"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/**
 * PerformanceMetrics — Section 7
 *
 * Displays longevity, projection (mapped from occasion/additional_details),
 * and sillage as animated progress bars.
 *
 * Bar fills animate to width% when section scrolls into view
 * using IntersectionObserver — no heavy JS, pure CSS transitions.
 *
 * API fields: product.longevity, product.sillage, product.occasion,
 *             product.additional_details, product.olfactory_family
 *
 * Note: If the API doesn't return numeric performance scores, we display
 * the text value with an estimated bar width based on text keywords.
 */

const PERFORMANCE_MAP = {
  longevity: {
    label: "Longevity",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    keywords: {
      "2-4": 25, "4-6": 45, "6-8": 60, "8-10": 75, "8-12": 80, "10-12": 85, "12+": 95, "24": 100,
      "moderate": 50, "long": 75, "very long": 90, "excellent": 95, "good": 65,
    },
  },
  sillage: {
    label: "Sillage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12C7 7 12 5 17 7s7 8 2 12" /><path d="M6 12c3-3 6-4 9-2s4 5 1 7" />
      </svg>
    ),
    keywords: {
      "soft": 25, "light": 30, "moderate": 50, "medium": 55, "strong": 75, "heavy": 85,
      "very strong": 90, "enormous": 95, "beast mode": 100,
    },
  },
  occasion: {
    label: "Versatility",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    keywords: {
      "casual": 45, "daily": 50, "office": 55, "work": 55, "evening": 70,
      "formal": 75, "special": 80, "all": 90, "all occasions": 90, "all-occasion": 90,
    },
  },
};

/** Estimate bar fill % from a text value */
const estimateFill = (text = "", keywordMap = {}) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  for (const [keyword, pct] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) return pct;
  }
  return 55; // neutral fallback
};

const MetricBar = ({ label, icon, value, fillRef }) => {
  if (!value) return null;

  return (
    <div className="pdp-metric-card">
      <div className="pdp-metric-card__header">
        <div className="pdp-metric-card__icon">{icon}</div>
        <span className="pdp-metric-card__label">{label}</span>
      </div>
      <p className="pdp-metric-card__value">{value}</p>
      <div className="pdp-metric-bar" role="progressbar" aria-label={label}>
        <div className="pdp-metric-bar__fill" ref={fillRef} />
      </div>
    </div>
  );
};

const PerformanceMetrics = ({ product }) => {
  const t = useTranslations("ProductDetails");

  const longevityRef = useRef(null);
  const sillageRef = useRef(null);
  const occasionRef = useRef(null);
  const sectionRef = useRef(null);

  const metrics = [
    {
      key: "longevity",
      value: product?.longevity,
      ref: longevityRef,
      fill: estimateFill(product?.longevity, PERFORMANCE_MAP.longevity.keywords),
      label: t("highlights.longevity"),
      icon: PERFORMANCE_MAP.longevity.icon,
    },
    {
      key: "sillage",
      value: product?.sillage,
      ref: sillageRef,
      fill: estimateFill(product?.sillage, PERFORMANCE_MAP.sillage.keywords),
      label: t("summary.sillage"),
      icon: PERFORMANCE_MAP.sillage.icon,
    },
    {
      key: "occasion",
      value: product?.occasion,
      ref: occasionRef,
      fill: estimateFill(product?.occasion, PERFORMANCE_MAP.occasion.keywords),
      label: t("highlights.occasion"),
      icon: PERFORMANCE_MAP.occasion.icon,
    },
  ].filter((m) => m.value);

  // Animate bars on scroll into view
  useEffect(() => {
    if (metrics.length === 0 || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            metrics.forEach((m) => {
              if (m.ref.current) {
                m.ref.current.style.width = `${m.fill}%`;
              }
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (metrics.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="pdp-metrics pdp-fade-in"
      aria-labelledby="metrics-heading"
    >
      <div className="pdp-container">
        <header className="pdp-section-header">
          <span className="pdp-section-eyebrow">Fragrance Character</span>
          <h2 className="pdp-section-title" id="metrics-heading">
            Performance Profile
          </h2>
        </header>

        <div className="pdp-metrics__grid">
          {metrics.map((m) => (
            <MetricBar
              key={m.key}
              label={m.label}
              icon={m.icon}
              value={m.value}
              fillRef={m.ref}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceMetrics;
