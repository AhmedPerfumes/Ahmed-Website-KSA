import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Slider from "rc-slider";

export default function ProductFilter({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  priceRange,
  setPriceRange,
  maxPrice = 1000,
  currency = { symbol: "$" },
  uniqueCategories = [],
  selectedCategories = [],
  setSelectedCategories,
  uniqueSubcategories = [],
  selectedSubcategories = [],
  setSelectedSubcategories,
  availableLabels = [],
  selectedLabels = [],
  setSelectedLabels,
  availableTags = [],
  selectedTags = [],
  setSelectedTags,
  stockAvailability,
  setStockAvailability,
  promotionalOnly,
  setPromotionalOnly,
  handleReset,
  showSortBy = true,
  showPriceRange = true,
  showCategories = true,
  showSubcategories = true,
  showLabel = true,
  showSize = true,
  showAvailability = true,
  showOffers = true,
  showViewSelector = false,
  availableViews = [],
  selectedColView = 3,
  setSelectedColView,
}) {
  const t = useTranslations();

  useEffect(() => {
    if (selectedSubcategories.length > 0 && uniqueSubcategories.length > 0) {
      const validSubcats = selectedSubcategories.filter(s => uniqueSubcategories.includes(s));
      if (validSubcats.length !== selectedSubcategories.length) {
        setSelectedSubcategories(validSubcats);
      }
    }
  }, [uniqueSubcategories, selectedSubcategories, setSelectedSubcategories]);

  const [collapsedSections, setCollapsedSections] = useState({
    sortBy: false,
    priceRange: false,
    categories: false,
    subcategories: false,
    labels: false,
    size: true,
    availability: false,
    promotional: true,
    viewSelector: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (array, setArray, value) => {
    setArray((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const renderSectionHeader = (title, key) => {
    const isCollapsed = collapsedSections[key];
    return (
      <div
        className="d-flex justify-content-between align-items-center cursor-pointer mb-3 select-none"
        onClick={() => toggleSection(key)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <span
          className="text-uppercase fw-bold text-secondary mb-0 transition-colors"
          style={{ fontSize: "10px", letterSpacing: "1.5px", transition: "color 0.2s ease" }}
        >
          {title}
        </span>
        <svg
          className="transition-transform duration-200 text-secondary"
          style={{
            transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            opacity: 0.6,
          }}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 4 5 7 8 4" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: "1px" }}>
          {t("Filters")}
        </h6>
        <button
          className="btn btn-link p-0 text-decoration-none text-primary fw-medium"
          style={{ fontSize: "12px" }}
          onClick={handleReset}
        >
          {t("Reset All")}
        </button>
      </div>

      {/* View Selector */}
      {showViewSelector && availableViews && availableViews.length > 0 && (
        <div className="mb-4 border-bottom pb-3 d-none d-md-block">
          {renderSectionHeader(t("View"), "viewSelector")}
          {!collapsedSections.viewSelector && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex align-items-center gap-2">
                {availableViews.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColView(c)}
                    className={`flex-grow-1 py-2 rounded-3 border transition-all justify-content-center ${
                      selectedColView === c ? "bg-dark border-dark" : "bg-light border-light"
                    } ${c === 4 ? "d-none d-lg-flex" : "d-flex"}`}
                    aria-label={`View ${c} columns`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={selectedColView === c ? "#fff" : "#666"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {Array.from({ length: c }).map((_, idx) => {
                        const spacing = 16 / (c + 1);
                        const x = 4 + spacing * (idx + 1);
                        return <line key={idx} x1={x} y1="5" x2={x} y2="19" />;
                      })}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sorting */}
      {showSortBy && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Sort By"), "sortBy")}
          {!collapsedSections.sortBy && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <select
                className="form-select border rounded-3 fs-sm py-2 px-3"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ fontSize: "14px", cursor: "pointer" }}
              >
                <option value="popularity">{t("Most Popular")}</option>
                <option value="date">{t("New Arrivals")}</option>
                <option value="price">{t("Price: Low to High")}</option>
                <option value="price-desc">{t("Price: High to Low")}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      {showPriceRange && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Price Range"), "priceRange")}
          {!collapsedSections.priceRange && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="px-2 pt-2">
                <Slider
                  range
                  max={maxPrice}
                  min={0}
                  value={priceRange}
                  onChange={setPriceRange}
                />
              </div>
              <div className="d-flex justify-content-between mt-3 pt-1 fw-medium" style={{ fontSize: "12px" }}>
                <span>
                  {priceRange[0]}
                  {currency?.symbol}
                </span>
                <span>
                  {priceRange[1]}
                  {currency?.symbol}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {showCategories && uniqueCategories.length > 0 && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Categories"), "categories")}
          {!collapsedSections.categories && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex flex-wrap gap-2">
                {uniqueCategories.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}
                    className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                      selectedCategories.includes(c) ? "btn-dark" : "btn-light"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subcategories */}
      {showSubcategories && uniqueSubcategories.length > 0 && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Subcategories") || "Subcategories", "subcategories")}
          {!collapsedSections.subcategories && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex flex-wrap gap-2">
                {uniqueSubcategories.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFilter(selectedSubcategories, setSelectedSubcategories, sc)}
                    className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                      selectedSubcategories.includes(sc) ? "btn-dark" : "btn-light"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Label */}
      {showLabel && availableLabels.length > 0 && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Label") || "Label", "labels")}
          {!collapsedSections.labels && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex flex-wrap gap-2">
                {availableLabels.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFilter(selectedLabels, setSelectedLabels, l.label_name)}
                    className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                      selectedLabels.includes(l.label_name) ? "btn-dark" : "btn-light"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {l.label_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Size (Tags) */}
      {showSize && availableTags.length > 0 && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Size"), "size")}
          {!collapsedSections.size && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex flex-wrap gap-2">
                {availableTags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFilter(selectedTags, setSelectedTags, tag)}
                    className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                      selectedTags.includes(tag) ? "btn-dark" : "btn-light"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Availability */}
      {showAvailability && (
        <div className="mb-4 border-bottom pb-3">
          {renderSectionHeader(t("Availability"), "availability")}
          {!collapsedSections.availability && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="d-flex gap-2">
                {["all", "in_stock"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setStockAvailability(val)}
                    className={`btn btn-sm rounded-pill px-3 py-1 border flex-grow-1 transition-all ${
                      stockAvailability === val ? "btn-dark" : "btn-light"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {val === "all" ? t("All Items") : t("In Stock")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promotional / Offers */}
      {showOffers && (
        <div className="mb-0">
          {renderSectionHeader(t("Offers Only"), "promotional")}
          {!collapsedSections.promotional && (
            <div className="animate__animated animate__fadeIn animate__faster">
              <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                <span className="text-secondary" style={{ fontSize: "12px" }}>
                  {t("Show promotional items only")}
                </span>
                <input
                  className="form-check-input ms-0"
                  type="checkbox"
                  role="switch"
                  checked={promotionalOnly}
                  onChange={(e) => setPromotionalOnly(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
