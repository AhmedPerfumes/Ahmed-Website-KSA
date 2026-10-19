"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import "./storelocator.scss";
import StoreReviewsModal from "./StoreReviewsModal";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiStar,
  FiCrosshair,
  FiX,
  FiMessageSquare,
  FiMap,
  FiList,
  FiCheck,
} from "react-icons/fi";
import { COUNTRY_META, formatTelUri, calculateDistance } from "./utils";

const StoreLocatorMap = dynamic(() => import("./StoreLocatorMap"), {
  ssr: false,
  loading: () => (
    <div
      className="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded-4 border"
      style={{ minHeight: "560px" }}
    >
      <div className="spinner-border text-warning mb-2" role="status">
        <span className="visually-hidden">Loading map...</span>
      </div>
      <p className="text-muted small mb-0" style={{ fontFamily: "'Kanit', sans-serif" }}>
        Loading Stores Map...
      </p>
    </div>
  ),
});

export default function StoreLocator({ initialStores = [], locale }) {
  const routeParams = useParams();
  const currentLocale = locale || routeParams?.locale || "en";
  const isArabic = currentLocale === "ar";

  const [stores, setStores] = useState(initialStores);
  const [selectedCountry, setSelectedCountry] = useState("SA");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [reviewStore, setReviewStore] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mobileTab, setMobileTab] = useState("list"); // 'list' | 'map'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterDropdownRef = useRef(null);
  const storeListRef = useRef(null);
  const cardRefs = useRef({});

  // Sync if initialStores updates
  useEffect(() => {
    if (initialStores?.length) {
      setStores(initialStores);
    }
  }, [initialStores]);

  // Close filter dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Request browser geolocation
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });
        setSelectedCountry("ALL"); // Reset country to find nearest across all branches
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation notice:", err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Attempt silent geolocation check if already granted
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            handleLocateMe();
          }
        })
        .catch(() => { });
    }
  }, [handleLocateMe]);

  // Extract available countries and store counts dynamically
  const countryCounts = useMemo(() => {
    const counts = { ALL: stores.length };
    stores.forEach((s) => {
      const code = (s.countryCode || "OTHER").toUpperCase();
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [stores]);

  const availableCountries = useMemo(() => {
    const codes = Object.keys(countryCounts).filter((c) => c !== "ALL");
    codes.sort((a, b) => {
      if (a === "SA") return -1;
      if (b === "SA") return 1;
      return countryCounts[b] - countryCounts[a];
    });
    return ["ALL", ...codes];
  }, [countryCounts]);

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = stores.map((s) => {
      const sLat = Number(s.latlng?.latitude);
      const sLng = Number(s.latlng?.longitude);
      let distance = null;

      if (userLocation && !isNaN(sLat) && !isNaN(sLng) && sLat !== 0) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, sLat, sLng);
      }

      return {
        ...s,
        distance,
        normalizedCountry: (s.countryCode || "").toUpperCase(),
      };
    });

    // Filter by country
    if (selectedCountry !== "ALL") {
      result = result.filter((s) => s.normalizedCountry === selectedCountry);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const code = (s.storeCode || "").toLowerCase();
        const title = (s.title || "").toLowerCase();
        const phone = (s.googlePublishedTelephone || "").toLowerCase();
        return code.includes(query) || title.includes(query) || phone.includes(query);
      });
    }

    // Sort by distance if user location is available
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }, [stores, selectedCountry, searchQuery, userLocation]);

  // Proximity-ordered navigation from the card
  const [proximityAnchor, setProximityAnchor] = useState(null);

  // Proximity list: all filtered stores sorted by distance from proximityAnchor (or selectedStore)
  const activeAnchor = proximityAnchor || selectedStore;

  const proximityList = useMemo(() => {
    if (!activeAnchor || !filteredStores.length) return [];

    const aLat = Number(activeAnchor.latlng?.latitude);
    const aLng = Number(activeAnchor.latlng?.longitude);
    const anchorKey = activeAnchor.locationName || activeAnchor.storeCode;

    // Anchor store is always index 0
    const others = filteredStores.filter(
      (s) => (s.locationName || s.storeCode) !== anchorKey
    );

    others.sort((a, b) => {
      const aLat2 = Number(a.latlng?.latitude);
      const aLng2 = Number(a.latlng?.longitude);
      const bLat2 = Number(b.latlng?.latitude);
      const bLng2 = Number(b.latlng?.longitude);
      const distA =
        !isNaN(aLat) && !isNaN(aLng) && !isNaN(aLat2) && !isNaN(aLng2)
          ? calculateDistance(aLat, aLng, aLat2, aLng2)
          : Infinity;
      const distB =
        !isNaN(aLat) && !isNaN(aLng) && !isNaN(bLat2) && !isNaN(bLng2)
          ? calculateDistance(aLat, aLng, bLat2, bLng2)
          : Infinity;
      return distA - distB;
    });

    return [activeAnchor, ...others];
  }, [activeAnchor, filteredStores]);

  const currentProximityIndex = useMemo(() => {
    if (!selectedStore || !proximityList.length) return -1;
    const curKey = selectedStore.locationName || selectedStore.storeCode;
    return proximityList.findIndex(
      (s) => (s.locationName || s.storeCode) === curKey
    );
  }, [selectedStore, proximityList]);

  const distanceToAnchor = useMemo(() => {
    if (!activeAnchor || !selectedStore || currentProximityIndex <= 0) return null;
    const aLat = Number(activeAnchor.latlng?.latitude);
    const aLng = Number(activeAnchor.latlng?.longitude);
    const sLat = Number(selectedStore.latlng?.latitude);
    const sLng = Number(selectedStore.latlng?.longitude);
    if (isNaN(aLat) || isNaN(aLng) || isNaN(sLat) || isNaN(sLng)) return null;
    return calculateDistance(aLat, aLng, sLat, sLng);
  }, [activeAnchor, selectedStore, currentProximityIndex]);

  const hasPrevStore = currentProximityIndex > 0;
  const hasNextStore =
    currentProximityIndex >= 0 && currentProximityIndex < proximityList.length - 1;

  const handleNextClosestStore = () => {
    if (!hasNextStore) return;
    const nextStore = proximityList[currentProximityIndex + 1];
    setSelectedStore(nextStore);
    if (nextStore) {
      const key = nextStore.locationName || nextStore.storeCode;
      const el = cardRefs.current[key];
      if (el && storeListRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const handlePrevClosestStore = () => {
    if (!hasPrevStore) return;
    const prevStore = proximityList[currentProximityIndex - 1];
    setSelectedStore(prevStore);
    if (prevStore) {
      const key = prevStore.locationName || prevStore.storeCode;
      const el = cardRefs.current[key];
      if (el && storeListRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  // Select store and scroll card into view in list
  const handleSelectStore = (store) => {
    setProximityAnchor(store);
    setSelectedStore(store);
    if (store) {
      const key = store.locationName || store.storeCode;
      const el = cardRefs.current[key];
      if (el && storeListRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const selectedCountryMeta = COUNTRY_META[selectedCountry] || {};
  const selectedCountryLabel =
    selectedCountry === "ALL"
      ? isArabic
        ? "جميع الدول"
        : "All Countries"
      : isArabic
      ? selectedCountryMeta.shortNameAr || selectedCountryMeta.nameAr || selectedCountry
      : selectedCountryMeta.shortName || selectedCountryMeta.name || selectedCountry;

  return (
    <div className="store-locator-root container-xl px-2 px-sm-3 px-md-4 my-2 my-md-4">
      {/* ─── BRAND HEADING & SUBHEADING ──────────────────────────── */}
      <div className="text-center mb-3 mb-md-4 px-2">
        <h1
          className="fw-bold mb-2"
          style={{
            letterSpacing: isArabic ? "0" : "0.2px",
            fontSize: "clamp(22px, 3.4vw, 32px)",
            color: "#181818",
            lineHeight: 1.3,
          }}
        >
          {isArabic
            ? "اعثر على أقرب فرع لأحمد المغربي للعطور"
            : "Find an Ahmed Al Maghribi Perfumes Store Near You"}
        </h1>
        <p
          className="text-muted mx-auto mb-0"
          style={{
            maxWidth: "680px",
            fontSize: "clamp(13px, 1.8vw, 15px)",
            lineHeight: 1.55,
            color: "#666",
          }}
        >
          {isArabic
            ? "اعثر على أقرب فرع لأحمد المغربي للعطور واستمتع بتجربة عطورنا المميزة عن قرب."
            : "Find your nearest Ahmed Al Maghribi Perfumes store and experience our signature fragrances in person."}
        </p>
      </div>

      {/* ─── SINGLE LINE CONTROL BAR ─────────────────────────── */}
      <div className="mb-3">
        <div className="single-line-control-bar">
          {/* Search Input Section */}
          <div className="bar-input-wrap">
            <FiSearch className="text-muted flex-shrink-0" size={16} />
            <input
              type="text"
              className="minimal-search-input"
              placeholder={isArabic ? "ابحث عن فرع، مول، أو مدينة..." : "Search store, mall, or city..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="btn btn-sm btn-link text-muted p-0 me-1"
                title="Clear search"
                style={{ lineHeight: 1 }}
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* Subtle Vertical Divider */}
          <div className="bar-divider" />

          {/* Actions: Filter Dropdown + Near Me */}
          <div className="bar-actions-wrap">
            {/* Single Filter Button with Dropdown Popover */}
            <div className="position-relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setFilterDropdownOpen((prev) => !prev)}
                className={`minimal-control-btn btn-filter ${selectedCountry !== "ALL" ? "active" : ""}`}
                title={isArabic ? "تصفية حسب الدولة" : "Filter by country"}
                aria-expanded={filterDropdownOpen}
              >
                {selectedCountry === "ALL" ? (
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>🌍</span>
                ) : selectedCountryMeta.flagUrl ? (
                  <Image
                    src={selectedCountryMeta.flagUrl}
                    alt={selectedCountryLabel}
                    width={18}
                    height={13}
                    className="rounded-1 shadow-2xs"
                    style={{ objectFit: "cover", display: "inline-block" }}
                  />
                ) : (
                  <span>📍</span>
                )}
                <span className="d-none d-sm-inline">{selectedCountryLabel}</span>
                <span className="d-sm-none">
                  {selectedCountry === "ALL"
                    ? isArabic
                      ? "تصفية"
                      : "Filter"
                    : isArabic
                    ? selectedCountryMeta.shortNameAr || selectedCountry
                    : selectedCountryMeta.shortName || selectedCountry}
                </span>
                <FiChevronDown
                  size={12}
                  style={{
                    transform: filterDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              {/* Filter Dropdown Popover */}
              {filterDropdownOpen && (
                <div className="minimal-dropdown-menu">
                  <div className="minimal-dropdown-header">
                    {isArabic ? "تصفية حسب الدولة" : "Filter by Country"}
                  </div>
                  {availableCountries.map((cCode) => {
                    const meta = COUNTRY_META[cCode] || {};
                    const label = cCode === "ALL"
                      ? isArabic
                        ? "جميع الفروع"
                        : "All Stores"
                      : (isArabic ? meta.nameAr || meta.name : meta.name) || cCode;
                    const count = countryCounts[cCode] || 0;
                    const isItemActive = selectedCountry === cCode;

                    return (
                      <button
                        key={cCode}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(cCode);
                          setSelectedStore(null);
                          setFilterDropdownOpen(false);
                        }}
                        className={`minimal-dropdown-item ${isItemActive ? "active" : ""}`}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {cCode === "ALL" ? (
                            <span style={{ fontSize: "14px", lineHeight: 1 }}>🌍</span>
                          ) : meta.flagUrl ? (
                            <Image
                              src={meta.flagUrl}
                              alt={label}
                              width={20}
                              height={14}
                              className="rounded-1 shadow-2xs"
                              style={{ objectFit: "cover", display: "inline-block" }}
                            />
                          ) : (
                            <span style={{ fontSize: "14px" }}>📍</span>
                          )}
                          <span>{label}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="text-muted small" style={{ fontSize: "11px" }}>
                            ({count})
                          </span>
                          {isItemActive && <FiCheck size={14} style={{ color: "#B8860B" }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Near Me GPS Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className={`minimal-control-btn btn-nearme ${userLocation ? "active" : ""}`}
              title={isArabic ? "تحديد أقرب فرع إلي" : "Locate nearest store to me"}
            >
              <FiCrosshair className={locating ? "spinner-border spinner-border-sm border-1" : ""} size={14} />
              <span className="d-none d-md-inline">
                {locating
                  ? isArabic
                    ? "جاري التحديد..."
                    : "Locating..."
                  : userLocation
                  ? isArabic
                    ? "بالقرب مني ✓"
                    : "Near Me ✓"
                  : isArabic
                  ? "بالقرب مني"
                  : "Near Me"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT: SPLIT LAYOUT ──────────────────────── */}
      <div className="row g-3 align-items-stretch" style={{ paddingBottom: "70px" }}>
        {/* Left Column: Stores List */}
        <div
          className={`col-12 col-md-5 col-lg-5 ${mobileTab === "map" ? "d-none d-md-block" : "d-block"
            }`}
        >
          {/* Subheader Counter */}
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <span className="text-muted" style={{ fontSize: "12px" }}>
              <strong className="text-dark">{filteredStores.length}</strong>{" "}
              {isArabic ? "فرع متوفر" : "stores found"}
              {selectedCountry !== "ALL" && ` ${isArabic ? "في" : "in"} ${(isArabic ? selectedCountryMeta.nameAr || selectedCountryMeta.name : selectedCountryMeta.name) || selectedCountry}`}
            </span>
            {userLocation && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#2E7D32",
                  fontWeight: 500,
                }}
              >
                Sorted by distance
              </span>
            )}
          </div>

          {/* Scrollable Store Cards */}
          <div
            ref={storeListRef}
            className="store-card-container d-flex flex-column gap-2"
            style={{
              height: "640px",
              maxHeight: "640px",
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredStores.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border p-4">
                <FiMapPin size={30} className="text-muted opacity-40 mb-2" />
                <h6 className="fw-semibold mb-1">No stores found</h6>
                <p className="text-muted small mb-3">
                  Try adjusting your search query or selecting another country.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCountry("ALL");
                  }}
                  className="action-pill-btn"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredStores.map((store, index) => {
                const isSelected =
                  selectedStore &&
                  (selectedStore.locationName === store.locationName ||
                    selectedStore.storeCode === store.storeCode);

                const cMeta = COUNTRY_META[store.normalizedCountry] || {};
                const storeKey = store.locationName || store.storeCode || index;

                return (
                  <div
                    key={storeKey}
                    ref={(el) => {
                      if (el) cardRefs.current[storeKey] = el;
                    }}
                    onClick={() => {
                      handleSelectStore(store);
                      if (window.innerWidth < 768) {
                        setMobileTab("map");
                      }
                    }}
                    className={`minimal-store-card ${isSelected ? "selected" : ""}`}
                  >
                    {/* Primary Row: Country badge + Store Code + Distance & Rating */}
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <div className="d-flex align-items-center min-w-0 flex-grow-1 overflow-hidden" style={{ gap: "7px" }}>
                        <span className="store-country-badge d-inline-flex align-items-center gap-1" style={{ marginRight: "6px" }}>
                          {cMeta.flagUrl && (
                            <Image
                              src={cMeta.flagUrl}
                              alt={cMeta.shortName || store.normalizedCountry}
                              width={13}
                              height={9}
                              className="rounded-1"
                              style={{ objectFit: "cover", flexShrink: 0 }}
                            />
                          )}
                          <span>
                            {isArabic
                              ? cMeta.shortNameAr || cMeta.shortName || store.normalizedCountry
                              : cMeta.shortName || store.normalizedCountry}
                          </span>
                        </span>
                        <h6 className="store-card-title mb-0 text-truncate">
                          {store.storeCode}
                        </h6>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {store.distance !== null && (
                          <span className="store-distance-badge">
                            {store.distance < 1
                              ? `${Math.round(store.distance * 1000)}m away`
                              : `${store.distance.toFixed(1)}km away`}
                          </span>
                        )}

                        {store.averageRating > 0 && (
                          <span className="store-rating-badge">
                            <FiStar style={{ fill: "#D4AF37", stroke: "none" }} size={11} />
                            <span>{Number(store.averageRating).toFixed(1)}</span>
                            <span className="text-muted" style={{ fontSize: "10.5px" }}>
                              ({store.totalReviewCount})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Secondary Row: Specific location context (only if not redundant brand name) */}
                    {store.title &&
                      store.title.toLowerCase() !== "ahmed al maghribi perfumes" &&
                      store.title.toLowerCase() !== (store.storeCode || "").toLowerCase() && (
                        <div className="text-muted text-truncate mb-1" style={{ fontSize: "11px", lineHeight: "1.2" }}>
                          {store.title}
                        </div>
                      )}

                    {/* Action Row: Phone + Quick Navigation & Reviews */}
                    <div className="d-flex align-items-center justify-content-between gap-2 pt-1">
                      {store.googlePublishedTelephone ? (
                        <a
                          href={formatTelUri(store.googlePublishedTelephone, store.normalizedCountry || store.countryCode)}
                          onClick={(e) => e.stopPropagation()}
                          className="store-phone-link d-inline-flex align-items-center"
                          style={{ gap: "6px" }}
                          title="Call store"
                        >
                          <FiPhone size={11} style={{ color: "#C5A262", marginRight: "4px", flexShrink: 0 }} />
                          <span>{store.googlePublishedTelephone}</span>
                        </a>
                      ) : (
                        <div />
                      )}

                      <div
                        className="d-flex align-items-center gap-2 ms-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {store.mapsUri && (
                          <a
                            href={store.mapsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-pill-btn"
                            title="Directions on Google Maps"
                          >
                            <FiNavigation size={10.5} style={{ color: "#C5A262", marginRight: "3px" }} />
                            <span>Directions</span>
                          </a>
                        )}

                        {store.totalReviewCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setReviewStore(store)}
                            className="action-pill-btn"
                            title="View Verified Customer Reviews"
                          >
                            <FiMessageSquare size={10.5} style={{ color: "#777", marginRight: "3px" }} />
                            <span>Reviews ({store.totalReviewCount})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div
          className={`col-12 col-md-7 col-lg-7 ${mobileTab === "list" ? "d-none d-md-block" : "d-block"
            }`}
          style={{ minHeight: "560px" }}
        >
          <div className="h-100 position-sticky position-relative" style={{ top: "85px" }}>
            <StoreLocatorMap
              stores={filteredStores}
              selectedStore={selectedStore}
              onSelectStore={handleSelectStore}
              userLocation={userLocation}
              locating={locating}
              onOpenReviews={(st) => setReviewStore(st)}
              onLocateMe={handleLocateMe}
            />

            {/* Bottom Map View Store Preview Card (for both desktop and mobile) */}
            {selectedStore && (
              <div className="mobile-map-preview-card">
                <div className="d-flex align-items-start justify-content-between mb-1">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          backgroundColor: "#C5A262",
                          color: "#fff",
                          padding: "1px 6px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {(selectedStore.countryCode || "GCC").toUpperCase()}
                      </span>
                      {selectedStore.averageRating > 0 && (
                        <span className="store-rating-badge" style={{ fontSize: "11px" }}>
                          <FiStar size={11} fill="#b8860b" />
                          <strong>{Number(selectedStore.averageRating).toFixed(1)}</strong>
                          <span className="text-muted small">({selectedStore.totalReviewCount || 0})</span>
                        </span>
                      )}
                      {currentProximityIndex > 0 && distanceToAnchor !== null && (
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: "500",
                            color: "#8a6f3b",
                            backgroundColor: "#fcf8ef",
                            border: "1px solid #ebdcc0",
                            borderRadius: "4px",
                            padding: "1px 6px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {distanceToAnchor < 10
                            ? `${distanceToAnchor.toFixed(1)} km away`
                            : `${Math.round(distanceToAnchor)} km away`}
                        </span>
                      )}
                    </div>
                    <h6 className="fw-semibold mt-1 mb-0" style={{ fontSize: "14px", color: "#1A1A1A" }}>
                      {selectedStore.storeCode}
                    </h6>
                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                      {selectedStore.title}
                    </p>
                  </div>

                  <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                    <span
                      className="text-muted small d-none d-sm-inline me-1"
                      style={{ fontSize: "11px", fontWeight: "500" }}
                    >
                      {currentProximityIndex >= 0 && proximityList.length > 1
                        ? `${currentProximityIndex + 1}/${proximityList.length}`
                        : ""}
                    </span>

                    {/* Previous Closest Store Button */}
                    <button
                      type="button"
                      onClick={handlePrevClosestStore}
                      disabled={!hasPrevStore}
                      className="btn btn-sm btn-light rounded-circle p-0 text-muted"
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: hasPrevStore ? 1 : 0.35,
                        cursor: hasPrevStore ? "pointer" : "not-allowed",
                      }}
                      title="Previous closest store"
                    >
                      <FiChevronLeft size={16} />
                    </button>

                    {/* Next Closest Store Button */}
                    <button
                      type="button"
                      onClick={handleNextClosestStore}
                      disabled={!hasNextStore}
                      className="btn btn-sm btn-light rounded-circle p-0 text-muted"
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: hasNextStore ? 1 : 0.35,
                        cursor: hasNextStore ? "pointer" : "not-allowed",
                      }}
                      title="Next closest store"
                    >
                      <FiChevronRight size={16} />
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStore(null);
                        setProximityAnchor(null);
                      }}
                      className="btn btn-sm btn-light rounded-circle p-0 text-muted ms-1"
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Close"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1.5 pt-2 mt-2 border-top gap-2">
                  {selectedStore.mapsUri && (
                    <a
                      href={selectedStore.mapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-pill-btn"
                    >
                      <FiNavigation size={11} style={{ color: "#C5A262" }} />
                      <span>Directions</span>
                    </a>
                  )}

                  {selectedStore.googlePublishedTelephone && (
                    <a
                      href={formatTelUri(selectedStore.googlePublishedTelephone, selectedStore.countryCode)}
                      className="action-pill-btn"
                    >
                      <FiPhone size={11} style={{ color: "#C5A262" }} />
                      <span>Call</span>
                    </a>
                  )}

                  {selectedStore.totalReviewCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setReviewStore(selectedStore)}
                      className="action-pill-btn"
                    >
                      <FiMessageSquare size={11} />
                      <span>Reviews ({selectedStore.totalReviewCount})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MOBILE FLOATING VIEW SWITCHER ──────────────────── */}
      <div className="d-md-none mobile-floating-switcher">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`mobile-switcher-btn ${mobileTab === "list" ? "active" : ""}`}
        >
          <FiList size={13} />
          <span>List ({filteredStores.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("map")}
          className={`mobile-switcher-btn ${mobileTab === "map" ? "active" : ""}`}
        >
          <FiMap size={13} />
          <span>Map</span>
        </button>
      </div>

      {/* Reviews Modal / Drawer */}
      <StoreReviewsModal
        store={reviewStore}
        isOpen={Boolean(reviewStore)}
        onClose={() => setReviewStore(null)}
      />
    </div>
  );
}
