"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Pagination2 from "@/components/common/Pagination2";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { useShopFilter } from "@/context/ShopFilterContext";
import {
  removeSpecialCharactersAndAmp,
  sanitizeUrlParam,
} from "@/utlis/shop";
import ProductFilter from "../../shoplist/ProductFilter";
import PremiumProductCard from "@/components/shoplist/premium/PremiumProductCard";
import "@/components/shoplist/premium/premium-category.css";
import "@/components/shoplist/premium/skeleton.css";

function SkeletonCard() {
  return (
    <div className="pcs-card" aria-hidden="true">
      <div className="pcs-img-wrap">
        <div className="pcs-img shimmer" />
      </div>
      <div className="pcs-body">
        <div className="pcs-line pcs-line--name shimmer" />
        <div className="pcs-line pcs-line--name-short shimmer" />
        <div className="pcs-line pcs-line--price shimmer" />
      </div>
      <div className="pcs-actions">
        <div className="pcs-line pcs-line--atc shimmer" />
      </div>
    </div>
  );
}

function DiscountGrid({ title, onlyDiscounted = false }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const {
    rawProducts,
    setRawProducts,
    stockAvailability,
    setStockAvailability,
    selectedLabels,
    setSelectedLabels,
    selectedTags,
    setSelectedTags
  } = useShopFilter();

  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [selectedColView, setSelectedColView] = useState(3);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const t = useTranslations();

  const [isDDActive, setIsDDActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const ref = useRef(null);
  const gridRef = useRef(null);

  const availableViews = [2, 3, 4];

  const uniqueLabels = useMemo(() => {
    const labels = rawProducts.map(p => p.category_name).filter(Boolean);
    return [...new Set(labels)].sort();
  }, [rawProducts]);

  const uniqueSubcategories = useMemo(() => {
    const activeProducts = selectedLabels.length > 0
      ? rawProducts.filter(p => selectedLabels.includes(p.category_name))
      : rawProducts;

    const subcats = activeProducts
      .map(p => p.subcategory?.subcategory_name || p.subcategory_name || p.subcategory)
      .filter((s) => s && typeof s === 'string');
    return [...new Set(subcats)].sort();
  }, [rawProducts, selectedLabels]);

  const uniqueTags = useMemo(() => {
    const tags = rawProducts.flatMap(p => Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : [])).filter(Boolean);
    return [...new Set(tags)].sort();
  }, [rawProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsDDActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const sortItems = (items, option) => {
    switch (option) {
      case 'popularity':
        return [...items].sort((a, b) => (b.sales || 0) - (a.sales || 0));
      case 'date':
        return [...items].sort((a, b) => b.product_id - a.product_id);
      case 'price':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      default:
        return items;
    }
  };

  useEffect(() => {
    const getAllProducts = async () => {
      if (rawProducts.length > 0) {
        setLoading(false);
        const calculatedMax = Math.ceil(Math.max(...rawProducts.map(p => p.price)));
        setMaxPrice(calculatedMax);
        setPriceRange([0, calculatedMax]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 1, limit: 1000 }),
          }
        );
        const result = await response.json();
        const data = result.data || [];
        const norm = data.map((p) => ({ ...p, price: Number(p.price) }));
        setRawProducts(norm);

        const calculatedMax = norm.length > 0 ? Math.ceil(Math.max(...norm.map(p => p.price))) : 1000;
        setMaxPrice(calculatedMax);
        setPriceRange([0, calculatedMax]);
      } catch (error) {
        // console.error("Failed to fetch all products", error);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, [rawProducts.length, setRawProducts]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortOption, priceRange, selectedLabels, selectedSubcategories, selectedTags, stockAvailability]);

  const isSubcategoryFunc = (category, subcategory) => {
    if (subcategory) {
      const subName = typeof subcategory === 'string' ? subcategory : subcategory.subcategory_name;
      if (subName) return sanitizeUrlParam(subName);
    }

    const categorySlug = removeSpecialCharactersAndAmp(category || "").split(" ").join("-").toLowerCase();
    const categoryMap = {
      "gift-sets": "gift-sets",
      "hair-mist": "hair-mist",
      "extrait-de-parfum": "extrait-de-parfum",
      "xtrait-de-parfum": "extrait-de-parfum"
    };

    return categoryMap[categorySlug] || "online-exclusive";
  };

  const handleReset = () => {
    setPriceRange([0, maxPrice]);
    setStockAvailability('all');
    setSelectedLabels([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setSearchTerm('');
  };

  const filteredProducts = useMemo(() => {
    const [low, high] = priceRange;

    const filtered = rawProducts.filter((p) => {
      // "New Launch" items are never filtered out
      if (p.collection_name === 'New Launch') {
        return true;
      }

      // 1. Search Filter
      const matchesSearch = p.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Stock Filter
      if (stockAvailability === "in_stock" && p.product_qty <= 0) return false;

      // 3. Price Filter
      if (p.price < low || p.price > high) return false;

      // 4. Campaign/Promotional Filter
      if (onlyDiscounted) {
        if (!p.discount) return false;
      }

      // 5. Category/Label Filter
      if (selectedLabels.length > 0) {
        if (!selectedLabels.includes(p.category_name)) return false;
      }

      // 5b. Subcategory Filter
      if (selectedSubcategories.length > 0) {
        const subcatVal = p.subcategory?.subcategory_name || p.subcategory_name || p.subcategory;
        if (!selectedSubcategories.includes(subcatVal)) return false;
      }

      // 6. Tags Filter
      if (selectedTags.length > 0) {
        const pTags = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []);
        if (!pTags.some(t => selectedTags.includes(t))) return false;
      }

      return true;
    });

    return sortItems(filtered, sortOption);
  }, [rawProducts, priceRange, sortOption, onlyDiscounted, searchTerm, stockAvailability, selectedLabels, selectedSubcategories, selectedTags]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const currentProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  if (isMenuError) return <div className="container py-5 text-center">Error loading products</div>;

  return (
    <section className="container py-4" ref={gridRef}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="section-title fw-normal mb-0 text-uppercase h4 text-center text-md-start w-100">{title}</h2>

        <div className="shop-acs d-flex align-items-center justify-content-end gap-2 gap-md-3 position-relative w-100 w-md-auto" ref={ref}>
          <div className="search-field position-relative flex-grow-1 flex-md-grow-0">
            <input
              type="text"
              className="form-control border px-3 py-1"
              placeholder={t("Search Products")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                fontSize: '13px',
                width: '100%',
                maxWidth: '180px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #eee',
                borderRadius: 0
              }}
            />
            <svg
              className="position-absolute top-50 translate-middle-y"
              style={{ [locale === 'ar' ? 'left' : 'right']: '12px', opacity: 0.4 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <button
            className={`btn d-flex align-items-center text-uppercase fw-bold p-0 border-0 ${isDDActive ? 'text-dark' : 'text-secondary'}`}
            onClick={() => setIsDDActive(!isDDActive)}
            style={{ letterSpacing: '1px', fontSize: '13px', whiteSpace: 'nowrap' }}
            dir="ltr"
          >
            <svg className="me-1 me-md-2" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 5h16M4 10h12M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="d-none d-xs-inline">{t("Filter")}</span>
            {(selectedLabels.length > 0 || selectedTags.length > 0 || selectedSubcategories.length > 0 || stockAvailability !== 'all' || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
              <span className="ms-1 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px', fontSize: '10px' }}>
                {selectedLabels.length + selectedTags.length + selectedSubcategories.length + (stockAvailability !== 'all' ? 1 : 0) + (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0)}
              </span>
            )}
          </button>

          {isDDActive && (
            <div
              className="filter-popup position-absolute top-100 mt-3 p-4 bg-white shadow-xl rounded-4 animate__animated animate__fadeInUp animate__faster"
              style={{
                zIndex: 1000,
                width: '320px',
                maxWidth: 'calc(100vw - 30px)',
                maxHeight: '80vh',
                overflowY: 'auto',
                [locale === 'ar' ? 'left' : 'right']: 0,
                border: '1px solid #f0f0f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
              }}
            >
              <ProductFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
                currency={currency}
                uniqueCategories={uniqueLabels}
                selectedCategories={selectedLabels}
                setSelectedCategories={setSelectedLabels}
                uniqueSubcategories={uniqueSubcategories}
                selectedSubcategories={selectedSubcategories}
                setSelectedSubcategories={setSelectedSubcategories}
                availableTags={uniqueTags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                stockAvailability={stockAvailability}
                setStockAvailability={setStockAvailability}
                handleReset={handleReset}
                showSortBy={true}
                showPriceRange={true}
                showCategories={true}
                showSubcategories={true}
                showSize={true}
                showAvailability={true}
                showLabel={false}
                showOffers={false}
                showViewSelector={true}
                availableViews={availableViews}
                selectedColView={selectedColView}
                setSelectedColView={setSelectedColView}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className="pc-grid"
        style={{
          border: '1px solid var(--pc-border, #ebebeb)',
          ...(selectedColView === 2
            ? { gridTemplateColumns: 'repeat(2, 1fr)' }
            : selectedColView === 4
            ? { gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }
            : undefined)
        }}
      >
        {loading || isMenuLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : currentProducts.length === 0 ? (
          <div className="py-5 text-center w-100" style={{ gridColumn: '1 / -1' }}>
            <p className="text-secondary mb-0">{t("No products found") || "No products found."}</p>
          </div>
        ) : (
          currentProducts.map((elm, i) => (
            <PremiumProductCard
              key={elm.product_id || i}
              elm={elm}
              category={elm.category_name || "perfumes"}
              subcat={isSubcategoryFunc(elm.category_name, elm.subcategory)}
              priority={i < 4}
            />
          ))
        )}
      </div>

      {!loading && filteredProducts.length > 0 && (
        <p className="mt-4 mb-2 text-center fw-medium text-secondary" style={{ fontSize: '13px' }}>
          {t("Showing")} {filteredProducts.length} {t("items")}
        </p>
      )}

      {totalPages > 1 && (
        <div className="container-fluid px-0 px-sm-3 mt-4">
          <Pagination2
            totalPages={totalPages}
            currentPage={page}
            onPageChange={(p) => {
              setPage(p);
              gridRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </section>
  );
}

export default DiscountGrid;