"use client";

/**
 * PremiumShopGrid — All-products shop page
 *
 * Same premium design as PremiumProductGrid (category page) but:
 *   - Fetches from api/allProducts (all categories, paginated)
 *   - Infinite scroll (loads more as user approaches bottom)
 *   - Supports ?q= search param
 *   - Sort + Availability + Price filter in slide-in drawer
 */

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocale } from "next-intl";
import { sortingOptions } from "@/data/products/productCategories";
import PremiumProductCard from "./PremiumProductCard";
import PremiumBreadcrumb from "./PremiumBreadcrumb";
import "./premium-category.css";

/* ─── Helpers ────────────────────────────────────────────────── */

function removeSpecialChars(str) {
  let s = str?.replace(/&amp;/g, "");
  s = s?.replace(/[^\w\s-]/g, "");
  s = s?.replace(/\s+/g, " ").trim();
  return s;
}

function slugify(str) {
  return removeSpecialChars(str)?.split(" ").join("-").toLowerCase();
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

/* Build subcategory slug for product URL — mirrors Shop1 logic */
function getSubcatSlug(elm) {
  if (elm.subcategory?.subcategory_name) return slugify(elm.subcategory.subcategory_name);
  const cat = slugify(elm.category_name || "");
  if (cat === "gift-sets") return "gift-sets";
  if (cat === "hair-mist") return "hair-mist";
  return "extrait-de-parfum";
}

/* ─── Skeleton card ─────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", paddingTop: "130%", background: "#f0f0f0", animation: "sg-shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ padding: "1rem 0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ height: 10, width: "60%", background: "#f0f0f0", borderRadius: 4, animation: "sg-shimmer 1.4s ease-in-out 0.1s infinite" }} />
        <div style={{ height: 13, width: "85%", background: "#f0f0f0", borderRadius: 4, animation: "sg-shimmer 1.4s ease-in-out 0.2s infinite" }} />
        <div style={{ height: 11, width: "40%", background: "#f0f0f0", borderRadius: 4, animation: "sg-shimmer 1.4s ease-in-out 0.3s infinite" }} />
      </div>
    </div>
  );
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

/* ─── Constants ──────────────────────────────────────────────── */

const DISPLAY_STEP  = 24;  // how many more cards to reveal on each scroll
const SCROLL_OFFSET = 800;

/* ─── Component ──────────────────────────────────────────────── */

export default function PremiumShopGrid({ search }) {
  const locale = useLocale();

  /* Fetch state — we load ALL products in one request so sort/filter is accurate */
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [loadError,    setLoadError]    = useState(false);
  const [totalCount,   setTotalCount]   = useState(null);

  /* Display state — how many filtered products are currently shown (virtual scroll) */
  const [visibleCount, setVisibleCount] = useState(DISPLAY_STEP);

  /* Filter / sort state */
  const [sortOpt,        setSortOpt]        = useState("popularity");
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [wantInStock,    setWantInStock]    = useState(true);
  const [wantOutOfStock, setWantOutOfStock] = useState(true);
  const [priceMin0,      setPriceMin0]      = useState(0);
  const [priceMax0,      setPriceMax0]      = useState(9999);
  const [pMin,           setPMin]           = useState(0);
  const [pMax,           setPMax]           = useState(9999);

  /* ── Fetch ALL products once ───────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        // Request a very high limit so the backend returns all products in one shot.
        // For 173 products this is ~50-100 KB — negligible.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/allProducts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: 1,
            limit: 2000,
            search: search ? search.split("-").join(" ") : "",
          }),
        });
        const json = await res.json();
        if (cancelled) return;

        const items = (json.data || []).filter(
          (p) => p.product_name && parseFloat(p.price) > 0
        );

        // Initialise price range from the full dataset
        if (items.length > 0) {
          const prices = items.map((p) => parseFloat(p.price) || 0);
          const mn = Math.floor(Math.min(...prices));
          const mx = Math.ceil(Math.max(...prices));
          setPriceMin0(mn); setPriceMax0(mx);
          setPMin(mn);      setPMax(mx);
        }

        setAllProducts(doSort(items, "popularity")); // default sort
        if (json.total) setTotalCount(json.total);
      } catch (e) {
        console.error("PremiumShopGrid fetch error", e);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
    // Only re-fetch when the search term changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ── Sort ───────────────────────────────────────────────────── */
  const handleSort = useCallback((val) => {
    if (val === sortOpt) return;
    setSortOpt(val);
    setAllProducts((prev) => doSort(prev, val));
    setVisibleCount(DISPLAY_STEP); // reset display window to top
  }, [sortOpt]);

  /* ── Filtered + sorted list (full) ────────────────────────────── */
  const products = useMemo(() => allProducts.filter((p) => {
    const inStock = p.product_qty > 0;
    if (!wantInStock    && inStock)  return false;
    if (!wantOutOfStock && !inStock) return false;
    const price = parseFloat(p.price) || 0;
    if (price < pMin || price > pMax) return false;
    return true;
  }), [allProducts, wantInStock, wantOutOfStock, pMin, pMax]);

  /* ── Virtual-scroll display slice ──────────────────────────────── */
  const displayed = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMore   = visibleCount < products.length;

  /* ── Infinite scroll (display only — data is fully loaded) ───────── */
  useEffect(() => {
    const handleScroll = () => {
      if (
        !hasMore ||
        window.innerHeight + document.documentElement.scrollTop + SCROLL_OFFSET <
          document.documentElement.offsetHeight
      ) return;
      setVisibleCount((n) => n + DISPLAY_STEP);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  /* ── Price slider ────────────────────────────────────────────── */
  const fillLeft  = priceMax0 > priceMin0 ? ((pMin - priceMin0) / (priceMax0 - priceMin0)) * 100 : 0;
  const fillRight = priceMax0 > priceMin0 ? ((pMax - priceMin0) / (priceMax0 - priceMin0)) * 100 : 100;
  const handleRangeMin = (e) => setPMin(Math.min(Number(e.target.value), pMax - 1));
  const handleRangeMax = (e) => setPMax(Math.max(Number(e.target.value), pMin + 1));

  /* ── Derived counts (based on full dataset, unaffected by filters) ── */
  const inStockCount = useMemo(() => allProducts.filter((p) => p.product_qty > 0).length,  [allProducts]);
  const oosCount     = useMemo(() => allProducts.filter((p) => p.product_qty <= 0).length, [allProducts]);

  /* ── Active filter count ─────────────────────────────────────── */
  const activeFilters = useMemo(() => {
    let n = 0;
    if (!wantInStock || !wantOutOfStock) n++;
    if (pMin > priceMin0 || pMax < priceMax0) n++;
    return n;
  }, [wantInStock, wantOutOfStock, pMin, pMax, priceMin0, priceMax0]);

  /* ── Clear ───────────────────────────────────────────────────── */
  const clearFilters = useCallback(() => {
    setWantInStock(true); setWantOutOfStock(true);
    setPMin(priceMin0);   setPMax(priceMax0);
  }, [priceMin0, priceMax0]);

  /* ── Keyboard + body lock ────────────────────────────────────── */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="pc-root">

      {/* Breadcrumb */}
      <PremiumBreadcrumb
        items={[
          { label: search ? `Search: ${search.split("-").join(" ")}` : "Shop", labelAr: search ? `بحث: ${search.split("-").join(" ")}` : "المتجر" },
        ]}
      />

      {/* Heading */}
      <div className="pc-heading-wrap">
        <h1 className="pc-heading">
          {locale === "ar" ? "جميع المنتجات" : "All Products"}
          {search && (
            <span style={{ fontSize: "0.55em", fontWeight: 400, marginLeft: "0.75rem", letterSpacing: "0.05em", color: "#a67b30" }}>
              — {search.split("-").join(" ")}
            </span>
          )}
        </h1>
      </div>

      {/* Overlay */}
      <div className={`pc-overlay${drawerOpen ? " pc-overlay--on" : ""}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      {/* Filter Drawer */}
      <aside
        id="pc-shop-drawer"
        className={`pc-drawer${drawerOpen ? " pc-drawer--open" : ""}`}
        aria-label="Product filters" aria-modal="true" role="dialog"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="pc-drawer__head">
          <span className="pc-drawer__title">{locale === "ar" ? "تصفية" : "FILTER"}</span>
          <button className="pc-drawer__close" onClick={() => setDrawerOpen(false)} aria-label="Close filters"><IconClose /></button>
        </div>

        {/* Availability */}
        <div className="pc-filter-section">
          <span className="pc-filter-section__title">{locale === "ar" ? "التوفر" : "Availability"}</span>
          <label className="pc-avail-label">
            <input type="checkbox" className="pc-avail-check" checked={wantInStock} onChange={(e) => setWantInStock(e.target.checked)} />
            {locale === "ar" ? "متوفر" : "In stock"} <em>({inStockCount})</em>
          </label>
          <label className="pc-avail-label">
            <input type="checkbox" className="pc-avail-check" checked={wantOutOfStock} onChange={(e) => setWantOutOfStock(e.target.checked)} />
            {locale === "ar" ? "نفذت الكمية" : "Out of stock"} <em>({oosCount})</em>
          </label>
        </div>

        {/* Price */}
        <div className="pc-filter-section">
          <span className="pc-filter-section__title">{locale === "ar" ? "السعر" : "Price"}</span>
          <div className="pc-price-range">
            <div className="pc-range-bg" />
            <div className="pc-range-fill" style={{ left: `${fillLeft}%`, right: `${100 - fillRight}%` }} />
            <input type="range" className="pc-range-input" min={priceMin0} max={priceMax0} step={1} value={pMin} onChange={handleRangeMin} aria-label="Minimum price" />
            <input type="range" className="pc-range-input" min={priceMin0} max={priceMax0} step={1} value={pMax} onChange={handleRangeMax} aria-label="Maximum price" />
          </div>
          <p className="pc-price-display">
            {locale === "ar" ? "ر.س" : "SAR"}: <strong>{pMin}</strong> &ndash; {locale === "ar" ? "ر.س" : "SAR"} <strong>{pMax}</strong>
          </p>
        </div>

        {/* Clear */}
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
          <button className="pc-filter-btn" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="pc-shop-drawer">
            <IconFilter />
            <span>{locale === "ar" ? "تصفية" : "Filter"}</span>
            {activeFilters > 0 && <span className="pc-filter-btn__count">{activeFilters}</span>}
          </button>

          <div className="pc-toolbar__spacer" />

          <span className="pc-toolbar__count" aria-live="polite">
            {products.length}
            {allProducts.length > 0 && products.length !== allProducts.length
              ? ` / ${allProducts.length}`
              : totalCount ? ` / ${totalCount}` : ""}
            {" "}{locale === "ar" ? "منتج" : "products"}
          </span>

          <select className="pc-sort-select" aria-label="Sort products" value={sortOpt} onChange={(e) => handleSort(e.target.value)}>
            {sortingOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="pc-grid-wrap">
        {/* Skeleton on first load (no products fetched yet) */}
        {allProducts.length === 0 && loading ? (
          <div className="pc-grid" role="list" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="pc-grid" role="list" aria-label="Products">
            {displayed.length === 0 && !loading ? (
              <div className="pc-empty" role="status">
                <p className="pc-empty__title">{locale === "ar" ? "لا توجد منتجات" : "No products found"}</p>
                {activeFilters > 0 && <button className="pc-empty__reset" onClick={clearFilters}>{locale === "ar" ? "مسح التصفيات" : "Clear filters"}</button>}
              </div>
            ) : (
              displayed.map((elm, i) => (
                <div key={`${elm.product_id}-${i}`} role="listitem">
                  <PremiumProductCard
                    elm={elm}
                    category={slugify(elm.category_name || "perfumes")}
                    subcat={getSubcatSlug(elm)}
                    priority={i < 4}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* End of results — shown after virtual scroll exhausted or all filtered products displayed */}
        {!loading && !hasMore && products.length > 0 && (
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", padding: "1.5rem 0 3rem" }}>
            {locale === "ar" ? "تم عرض جميع المنتجات" : "All products shown"}
          </p>
        )}
      </div>

      <style>{`
        @keyframes sg-shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes sg-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
