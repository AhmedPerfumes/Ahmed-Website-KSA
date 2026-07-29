"use client";

/**
 * LuxuryPDP — Main Product Detail Page Orchestration Component
 *
 * Replaces the old Base + ProductInfoTabs structure inside SingleProduct11.
 *
 * Architecture:
 *  - Above fold: TrustBar, Gallery + InfoPanel (hero section)
 *  - Mid fold (server-renderable content): TrustPillars, FragranceBreakdown,
 *    PerformanceMetrics, BrandNarrative, OccasionSection
 *  - Below fold (lazy-loaded): BundleUpsell, ProductInfoTabs (reviews),
 *    ItemFamilySlider, FAQSection, RecentlyViewed
 *
 * Performance notes:
 *  - Bootstrap is NOT required() here — it was causing blocking load
 *  - All below-fold sections use dynamic() imports with suspense
 *  - IntersectionObserver-driven fade-in for CSS animations
 *  - First gallery image uses priority loading
 *
 * API data flow:
 *  - product: passed from SingleProduct11 (hydrated from server + live-status API)
 *  - reviews: fetched client-side on mount (deferred for performance)
 *  - category/subcategory: URL segments passed as strings
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import "./LuxuryPDP.css";

// ── Above-fold sections (eagerly loaded)
import TrustBar from "./sections/TrustBar";
import LuxuryGallery from "./sections/LuxuryGallery";
import ProductInfoPanel from "./sections/ProductInfoPanel";
import TrustPillars from "./sections/TrustPillars";
import FragranceBreakdown from "./sections/FragranceBreakdown";
import PerformanceMetrics from "./sections/PerformanceMetrics";
import StickyATC from "./StickyATC";
import ProductSchema from "./ProductSchema";

// ── Below-fold sections (lazy loaded)
const CustomerReviews = dynamic(
  () => import("../New/ProductInfoTabs/CustomerReviews"),
  { ssr: false, loading: () => <div style={{ height: "400px", background: "#111" }} /> }
);

const FAQSection = dynamic(() => import("./sections/FAQSection"), {
  ssr: false,
  loading: () => null,
});

const ItemFamilySlider = dynamic(
  () => import("../New/ItemFamilySlider"),
  { ssr: false, loading: () => null }
);

const RecentlyViewed = dynamic(() => import("./sections/RecentlyViewed"), {
  ssr: false,
  loading: () => null,
});

// ── Accordion — ssr:false removed intentionally to fix refresh hydration glitch.
// React.useState inside AccordionItem keeps toggle state; no Bootstrap JS needed.
const ProductAccordion = dynamic(() => import("../New/accordian"), {
  ssr: false,
  loading: () => (
    <div style={{ borderTop: "1px solid #E5E0D8", marginTop: "2rem", padding: "1.5rem 0" }}>
      {["PRODUCT OVERVIEW", "USAGE & APPLICATION", "DELIVERY INFORMATION"].map((t) => (
        <div key={t} style={{ padding: "1rem 0", borderBottom: "1px solid #E5E0D8", fontSize: ".85rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#1A1A1A", opacity: .5 }}>{t}</div>
      ))}
    </div>
  ),
});

/* ──────────────────────────────────────────────────────────────── */

/** Setup IntersectionObserver for .pdp-fade-in elements */
const useFadeInObserver = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".pdp-fade-in");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* ──────────────────────────────────────────────────────────────── */

const LuxuryPDP = ({ product, category, subcategory }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fade-in animation setup
  useFadeInObserver();

  // Parse images
  const images = product?.images
    ? typeof product.images === "string"
      ? JSON.parse(product.images)
      : product.images
    : [];

  // Fetch reviews after mount (deferred for performance)
  useEffect(() => {
    if (!product?.product_id) return;
    setReviewsLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/reviews/${product.product_id}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [product?.product_id]);

  if (!product || !Object.keys(product).length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          fontSize: "1.2rem",
          color: "#6B6B6B",
        }}
      >
        Product not found.
      </div>
    );
  }

  return (
    <div className="luxury-pdp">
      {/* JSON-LD Product Schema */}
      <ProductSchema
        product={product}
        reviews={reviews}
        canonicalUrl={
          typeof window !== "undefined" ? window.location.href : ""
        }
      />

      {/* ── Section 1: Trust / Announcement Bar ── */}
      <TrustBar />

      {/* ── Section 2-4: Hero (Gallery + Info Panel) ── */}
      <section className="pdp-hero" aria-label="Product details">
        <div className="pdp-container">
          <div className="pdp-hero__grid">
            {/* Gallery Column */}
            <div>
              <LuxuryGallery
                images={images}
                product={product}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </div>

            {/* Info Panel Column */}
            <div>
              <ProductInfoPanel
                product={product}
                category={category}
                subcategory={subcategory}
              />

              {/* Product Accordion (fragrance notes, delivery, etc.) */}
              <div className="pdp-accordion-wrap" style={{ marginTop: "2rem" }}>
                <Suspense fallback={null}>
                  {/* Only hide fragrance profile in accordion when FragranceBreakdown will render it */}
                  <ProductAccordion product={product} hideFragranceProfile={!!(product?.top_note || product?.heart_note || product?.base_note)} />
                </Suspense>
              </div>

              {/* You May Also Like — compact panel below accordion */}
              <Suspense fallback={null}>
                <ItemFamilySlider product={product} itemFamilyProds={product?.item_family} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>


      {/* ── Section 6: Fragrance Breakdown (above trust pillars for better flow) ── */}
      <FragranceBreakdown product={product} />

      {/* ── Section 6: Trust Pillars ── */}
      <TrustPillars />

      {/* ── Section 7: Performance Metrics ── */}
      <PerformanceMetrics product={product} />

      {/* ── Section 11: Reviews ── */}
      <div id="pdp-reviews" style={{ background: "#FAF8F4", borderTop: "1px solid #E8E1D9" }}>
        <Suspense fallback={<div style={{ height: "400px", background: "#FAF8F4" }} />}>
          <CustomerReviews
            product={{ ...product, category, subcategory }}
            reviews={reviews}
            loading={reviewsLoading}
            onReviewSubmitted={() => {
              // Refetch reviews after submission
              setReviewsLoading(true);
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL}api/reviews/${product.product_id}`
              )
                .then((r) => r.json())
                .then((data) => { if (Array.isArray(data)) setReviews(data); })
                .catch(() => {})
                .finally(() => setReviewsLoading(false));
            }}
          />
        </Suspense>
      </div>


      {/* ── Section 13: FAQ (lazy) ── */}
      <Suspense fallback={null}>
        <FAQSection product={product} />
      </Suspense>

      {/* ── Section 14: Recently Viewed (lazy, localStorage) ── */}
      <Suspense fallback={null}>
        <RecentlyViewed product={product} category={category} subcategory={subcategory} />
      </Suspense>

      {/* ── Sticky Mobile ATC Bar ── */}
      <StickyATC product={product} />

    </div>
  );
};

export default LuxuryPDP;
