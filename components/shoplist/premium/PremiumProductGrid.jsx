"use client";

/**
 * PremiumProductGrid — UK Reference Layout
 *
 * Layout:
 *   1. Page heading (h1, no banner)
 *   2. Sticky toolbar: [Filter btn] [spacer] [count] [sort select]
 *   3. Left slide-in filter drawer: Availability + Price range
 *   4. 2/3/4-col product grid with flat white cards
 *
 * Preserved verbatim:
 *   - fetchLiveStatus() API call & state hydration (from Style2.jsx)
 *   - Sort logic: popularity | date | price | price-desc
 *   - sortingOptions from productCategories
 */

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { sortingOptions } from "@/data/products/productCategories";
import PremiumProductCard from "./PremiumProductCard";
import PremiumBreadcrumb from "./PremiumBreadcrumb";
import "./premium-category.css";

/* ─── Helpers ────────────────────────────────────────────────── */

// "WARNING: If you change this logic, update the corresponding PHP/JS file."
function removeSpecialChars(str) {
  let s = str?.replace(/&amp;/g, "");
  s = s?.replace(/[^\w\s-]/g, "");
  s = s?.replace(/\s+/g, " ").trim();
  return s;
}

function slugify(str) {
  return removeSpecialChars(str)?.split(" ").join("-").toLowerCase();
}

/** Flatten subCategories + direct products into one flat array.
 *  Filters out dummy/invalid products (no name, price=0).
 */
function flatten(subCategories, products) {
  let items = [];
  if (products && products.length > 0) {
    items = products.map((p) => ({ ...p, _subcat: null }));
  } else if (subCategories && subCategories.length > 0) {
    items = subCategories.flatMap((sc) =>
      (sc.products || []).map((p) => ({
        ...p,
        _subcat: slugify(sc.name || ""),
      }))
    );
  }
  // Remove products with no name or price === 0 (advertisement/dummy slots)
  return items.filter(
    (p) => p.product_name && p.product_name.trim() !== "" && parseFloat(p.price) > 0
  );
}

function doSort(items, opt) {
  switch (opt) {
    case "popularity": return [...items].sort((a, b) => (b.sales || 0) - (a.sales || 0));
    case "date":       return [...items].sort((a, b) => b.product_id - a.product_id);
    case "price":      return [...items].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case "price-desc": return [...items].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    default:           return items;
  }
}

/* ─── Icons ──────────────────────────────────────────────────── */

function IconFilter() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M1 1h14M4 6h8M6.5 11h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", paddingTop: "130%", background: "#f0f0f0", animation: "pc-shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ padding: "1rem 0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ height: 10, width: "60%", background: "#f0f0f0", borderRadius: 4, animation: "pc-shimmer 1.4s ease-in-out 0.1s infinite" }} />
        <div style={{ height: 13, width: "85%", background: "#f0f0f0", borderRadius: 4, animation: "pc-shimmer 1.4s ease-in-out 0.2s infinite" }} />
        <div style={{ height: 11, width: "40%", background: "#f0f0f0", borderRadius: 4, animation: "pc-shimmer 1.4s ease-in-out 0.3s infinite" }} />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function PremiumProductGrid({ subCategories, products, categoryLabel, categoryLabelAr, breadcrumbItems }) {
  const pathname     = usePathname();
  const locale       = useLocale();
  const pathCategory = pathname.split("/")[3] || "";
  const pathSubcat   = pathname.split("/")[4] || null;
  const t            = useTranslations();

  /* Pick the correct heading for the active locale */
  const displayLabel = (locale === "ar" && categoryLabelAr) ? categoryLabelAr : categoryLabel;

  /* Flatten + initial sort */
  const initialFlat = useMemo(
    () => doSort(flatten(subCategories, products), "popularity"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* Price bounds from data */
  const priceMin0 = useMemo(() =>
    initialFlat.length === 0 ? 0 : Math.floor(Math.min(...initialFlat.map((p) => parseFloat(p.price) || 0))),
    [initialFlat]
  );
  const priceMax0 = useMemo(() =>
    initialFlat.length === 0 ? 9999 : Math.ceil(Math.max(...initialFlat.map((p) => parseFloat(p.price) || 0))),
    [initialFlat]
  );

  /* State */
  const [allProducts,    setAllProducts]    = useState(initialFlat);
  const [sortOpt,        setSortOpt]        = useState("popularity");
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [wantInStock,    setWantInStock]    = useState(true);
  const [wantOutOfStock, setWantOutOfStock] = useState(true);
  const [pMin,           setPMin]           = useState(0);
  const [pMax,           setPMax]           = useState(99999);

  /* Sync price range once bounds are known */
  useEffect(() => { setPMin(priceMin0); setPMax(priceMax0); }, [priceMin0, priceMax0]);

  /* Live-status hydration — verbatim from Style2.jsx */
  useEffect(() => {
    if (!allProducts.length) return;
    const fetchLiveStatus = async () => {
      try {
        const ids = allProducts.map((p) => p.product_id);
        if (!ids.length) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/products/live-status`,
          {
            method: "POST",
            header: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_ids: ids }),
          }
        );
        if (!res.ok) return;
        const live = await res.json();
        setAllProducts((prev) =>
          prev.map((p) => {
            const l = live.find((x) => x.product_id === p.product_id);
            return l
              ? { ...p, product_qty: l.product_qty, price: l.price, sale_price: l.sale_price, discount: l.discount, maximum_order_quantity: l.maximum_order_quantity }
              : p;
          })
        );
      } catch (e) {
        console.error("live-status hydration failed", e);
      }
    };
    fetchLiveStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sort */
  const handleSort = useCallback((val) => {
    setSortOpt(val);
    setAllProducts((prev) => doSort(prev, val));
  }, []);

  /* Derived counts for filter labels */
  const inStockCount  = useMemo(() => allProducts.filter((p) => p.product_qty > 0).length, [allProducts]);
  const oosCount      = useMemo(() => allProducts.filter((p) => p.product_qty <= 0).length, [allProducts]);

  /* Filtered list */
  const displayed = useMemo(() => {
    return allProducts.filter((p) => {
      const inStock = p.product_qty > 0;
      if (!wantInStock && inStock)    return false;
      if (!wantOutOfStock && !inStock) return false;
      const price = parseFloat(p.price) || 0;
      if (price < pMin || price > pMax) return false;
      return true;
    });
  }, [allProducts, wantInStock, wantOutOfStock, pMin, pMax]);

  /* Active filter count badge */
  const activeFilters = useMemo(() => {
    let n = 0;
    if (!wantInStock || !wantOutOfStock) n++;
    if (pMin > priceMin0 || pMax < priceMax0) n++;
    return n;
  }, [wantInStock, wantOutOfStock, pMin, pMax, priceMin0, priceMax0]);

  /* Subcat for URL */
  function getSubcat(p) {
    if (pathSubcat) return pathSubcat;
    if (p._subcat)  return p._subcat;
    return pathCategory;
  }

  /* Price slider */
  function handleRangeMin(e) { setPMin(Math.min(Number(e.target.value), pMax - 1)); }
  function handleRangeMax(e) { setPMax(Math.max(Number(e.target.value), pMin + 1)); }

  const fillLeft  = priceMax0 > priceMin0 ? ((pMin - priceMin0) / (priceMax0 - priceMin0)) * 100 : 0;
  const fillRight = priceMax0 > priceMin0 ? ((pMax - priceMin0) / (priceMax0 - priceMin0)) * 100 : 100;

  /* Keyboard close + body lock */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* Reset all filters */
  const clearFilters = useCallback(() => {
    setWantInStock(true);
    setWantOutOfStock(true);
    setPMin(priceMin0);
    setPMax(priceMax0);
  }, [priceMin0, priceMax0]);

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="pc-root">

      {/* Breadcrumb */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <PremiumBreadcrumb items={breadcrumbItems} />
      )}

      {/* H1 Heading — no banner */}
      {displayLabel && (
        <div className="pc-heading-wrap">
          <h1 className="pc-heading">{displayLabel}</h1>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`pc-overlay${drawerOpen ? " pc-overlay--on" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Filter Drawer */}
      <aside
        id="pc-drawer"
        className={`pc-drawer${drawerOpen ? " pc-drawer--open" : ""}`}
        aria-label="Product filters"
        aria-modal="true"
        role="dialog"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="pc-drawer__head">
          <span className="pc-drawer__title">
            {locale === "ar" ? "تصفية" : "FILTER"}
          </span>
          <button
            className="pc-drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
          >
            <IconClose />
          </button>
        </div>

        {/* Availability */}
        <div className="pc-filter-section">
          <span className="pc-filter-section__title">
            {locale === "ar" ? "التوفر" : "Availability"}
          </span>
          <label className="pc-avail-label">
            <input
              type="checkbox"
              className="pc-avail-check"
              checked={wantInStock}
              onChange={(e) => setWantInStock(e.target.checked)}
            />
            {locale === "ar" ? "متوفر" : "In stock"} <em>({inStockCount})</em>
          </label>
          <label className="pc-avail-label">
            <input
              type="checkbox"
              className="pc-avail-check"
              checked={wantOutOfStock}
              onChange={(e) => setWantOutOfStock(e.target.checked)}
            />
            {locale === "ar" ? "نفذت الكمية" : "Out of stock"} <em>({oosCount})</em>
          </label>
        </div>

        {/* Price */}
        <div className="pc-filter-section">
          <span className="pc-filter-section__title">
            {locale === "ar" ? "السعر" : "Price"}
          </span>
          <div className="pc-price-range">
            <div className="pc-range-bg" />
            <div
              className="pc-range-fill"
              style={{ left: `${fillLeft}%`, right: `${100 - fillRight}%` }}
            />
            <input
              type="range"
              className="pc-range-input"
              min={priceMin0}
              max={priceMax0}
              step={1}
              value={pMin}
              onChange={handleRangeMin}
              aria-label="Minimum price"
            />
            <input
              type="range"
              className="pc-range-input"
              min={priceMin0}
              max={priceMax0}
              step={1}
              value={pMax}
              onChange={handleRangeMax}
              aria-label="Maximum price"
            />
          </div>
          <p className="pc-price-display">
            {locale === "ar" ? "ر.س" : "SAR"}:{" "}
            <strong>{pMin}</strong>
            {" "}&ndash;{" "}
            {locale === "ar" ? "ر.س" : "SAR"} <strong>{pMax}</strong>
          </p>
        </div>

        {/* Clear filters */}
        {activeFilters > 0 && (
          <div className="pc-filter-section">
            <button className="pc-clear-btn" onClick={clearFilters}>
              {locale === "ar" ? "مسح جميع التصفيات" : "Clear all filters"}
            </button>
          </div>
        )}
      </aside>

      {/* Toolbar */}
      <div className="pc-toolbar" role="toolbar" aria-label="Filters and sorting">
        <div className="pc-toolbar__inner">
          {/* Filter button */}
          <button
            className="pc-filter-btn"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="pc-drawer"
          >
            <IconFilter />
            <span>{locale === "ar" ? "تصفية" : "Filter"}</span>
            {activeFilters > 0 && (
              <span className="pc-filter-btn__count">{activeFilters}</span>
            )}
          </button>

          <div className="pc-toolbar__spacer" />

          {/* Count */}
          <span className="pc-toolbar__count" aria-live="polite">
            {displayed.length} {locale === "ar" ? "منتج" : (displayed.length === 1 ? "product" : "products")}
          </span>

          {/* Sort */}
          <select
            className="pc-sort-select"
            aria-label="Sort products"
            value={sortOpt}
            onChange={(e) => handleSort(e.target.value)}
          >
            {sortingOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="pc-grid-wrap">
        {/* Skeleton — shown while products data hasn't arrived (null) */}
        {products === null && !subCategories ? (
          <div className="pc-grid" role="list" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="pc-grid" role="list" aria-label="Products">
            {displayed.length === 0 ? (
              <div className="pc-empty" role="status">
                <p className="pc-empty__title">
                  {locale === "ar" ? "لا توجد منتجات تطابق التصفية" : "No products match your filters"}
                </p>
                <p className="pc-empty__sub">
                  {locale === "ar" ? "جرّب تعديل أو مسح التصفيات" : "Try adjusting or clearing your selection."}
                </p>
                {activeFilters > 0 && (
                  <button className="pc-empty__reset" onClick={clearFilters}>
                    {locale === "ar" ? "مسح التصفيات" : "Clear filters"}
                  </button>
                )}
              </div>
            ) : (
              displayed.map((elm, i) => (
                <div key={elm.product_id ?? i} role="listitem">
                  <PremiumProductCard
                    elm={elm}
                    category={pathCategory}
                    subcat={getSubcat(elm)}
                    priority={i < 4}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pc-shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

    </div>
  );
}
