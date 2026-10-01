"use client";
import React, { useEffect, useState, useRef } from "react";
import CartLength from "./components/CartLength";
import { openCart } from "@/utlis/openCart";
import MobileNav from "./components/MobileNav";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "../../context/MenuContext";

export default function MobileHeader() {
  const { top_header } = useMenu();
  const locale = useLocale();
  const t = useTranslations();

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  // Auto-focus search input when search bar slides in
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Live search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchKeyWord.trim().length < 2) {
        setSearchSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/search-suggestions?keyword=${searchKeyWord}`
        );
        const result = await response.json();
        if (result.success) {
          setSearchSuggestions(result.data);
        }
      } catch (err) {
        console.error("Mobile search error:", err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchKeyWord]);

  const handleChange = (e) => setSearchKeyWord(e.target.value);

  function removeSpecialCharactersAndAmp(str) {
    return str
      .replace(/&amp;/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const onSearch = (event) => {
    event.preventDefault();
    window.location.href = `/${locale}/shop?q=${removeSpecialCharactersAndAmp(
      searchKeyWord
    )
      .split(" ")
      .join("-")}`;
  };

  return (
    <>
      {/* ── Top announcement marquee (mobile) ── */}
      {top_header?.length > 0 && (() => {
        // Repeat items if needed so each group comfortably fills wider than viewport
        const repeatCount = Math.max(2, Math.ceil(4 / top_header.length));
        const groupItems = Array.from({ length: repeatCount }, () => top_header).flat();

        return (
          <div
            className="header-mobile__marquee-wrapper bg-black d-flex align-items-center d-lg-none"
            role="region"
            aria-label="Announcements"
          >
            <div
              className={`header-mobile__marquee-track ${
                locale === "ar"
                  ? "header-mobile__marquee-track--rtl"
                  : "header-mobile__marquee-track--ltr"
              }`}
              dir="ltr"
            >
              {/* Group 1 (Primary) */}
              <div className="header-mobile__marquee-group">
                {groupItems.map((elm, i) => (
                  <span key={`g1-${i}`} className="d-flex align-items-center flex-nowrap">
                    <Link
                      href={`/${locale}/${elm.color || ""}`}
                      className="header-mobile__marquee-link text-white text-decoration-none mx-4"
                    >
                      {locale === "ar" && elm.title_ar
                        ? elm.title_ar
                        : (elm.title ? t(elm.title) : "")}
                    </Link>
                    <span className="header-mobile__marquee-separator">-</span>
                  </span>
                ))}
              </div>

              {/* Group 2 (Exact duplicate for 100% seamless infinite loop) */}
              <div className="header-mobile__marquee-group" aria-hidden="true">
                {groupItems.map((elm, i) => (
                  <span key={`g2-${i}`} className="d-flex align-items-center flex-nowrap">
                    <Link
                      href={`/${locale}/${elm.color || ""}`}
                      className="header-mobile__marquee-link text-white text-decoration-none mx-4"
                      tabIndex="-1"
                    >
                      {locale === "ar" && elm.title_ar
                        ? elm.title_ar
                        : (elm.title ? t(elm.title) : "")}
                    </Link>
                    <span className="header-mobile__marquee-separator">-</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Main header bar ── */}
      <div
        className="header-mobile header_sticky header_sticky-active"
      >
        <div
          className="header-mobile__container container position-relative h-100 overflow-hidden"
        >
          {/* Default header content: hamburger | logo (centred) | search + cart */}
          <div
            className={`header-mobile__bar header-mobile__bar--default w-100 h-100 d-flex align-items-center justify-content-between px-3 ${isSearchActive ? "header-mobile__bar--hidden" : ""
              }`}
          >
            {/* Left: Hamburger */}
            <Link
              className="mobile-nav-activator d-block position-relative"
              href="#"
            >
              <svg
                className="nav-icon"
                width="20"
                height="15"
                viewBox="0 0 25 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_nav" />
              </svg>
              <span className="btn-close-lg position-absolute top-0 start-0 w-100"></span>
            </Link>

            {/* Centre: Logo — absolutely centred (UAE pattern) */}
            <div className="logo header-mobile__logo">
              <Link href={`/${locale}`}>
                <Image
                  src="/assets/images/logo/Mobile.svg"
                  width={200}
                  height={57}
                  alt="Ahmed Al Maghribi"
                  priority
                  className=""
                />
              </Link>
            </div>

            {/* Right: Search icon + Cart */}
            <div className="d-flex align-items-center gap-1">
              {/* Search trigger */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSearchActive(true);
                }}
                className="header-mobile__action-btn"
                aria-label="Search"
              >
                <svg
                  className="d-block"
                  width="19"
                  height="19"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_search" />
                </svg>
              </Link>

              {/* Cart */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openCart();
                }}
                className="header-mobile__cart-btn"
                aria-label="Shopping Cart"
              >
                <svg
                  className="d-block"
                  width="19"
                  height="19"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_cart" />
                </svg>
                <span className="cart-amount js-cart-items-count">
                  <CartLength />
                </span>
              </Link>
            </div>
          </div>

          {/* Search bar — slides in when isSearchActive */}
          <div
            className={`header-mobile__bar header-mobile__bar--search w-100 h-100 d-flex align-items-center gap-2 px-3 py-2 ${isSearchActive ? "header-mobile__bar--visible" : ""
              }`}
          >
            {/* Back arrow */}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSearchActive(false);
                setSearchKeyWord("");
                setSearchSuggestions([]);
              }}
              className="header-tools__item header-mobile__back-btn p-1"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>

            {/* Search form */}
            <form
              onSubmit={onSearch}
              className="flex-grow-1 position-relative m-0"
            >
              <input
                ref={searchInputRef}
                className="header-mobile__search-input w-100 border rounded-pill px-3 shadow-sm form-control"
                type="text"
                placeholder={
                  locale === "ar" ? "ابحث عن المنتجات..." : "Search products..."
                }
                value={searchKeyWord}
                onChange={handleChange}
              />
              <button
                type="submit"
                className="header-mobile__search-btn btn-icon position-absolute top-50 translate-middle-y bg-transparent border-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_search" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Floating search suggestions dropdown */}
        {isSearchActive && (isSearching || searchSuggestions.length > 0) && (
          <div
            className="mobile-search-results position-absolute start-0 top-100 w-100 bg-white border-top shadow-lg"
          >
            {isSearching && (
              <div className="p-3 text-center fs-13 text-muted">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
                {t("Searching...")}
              </div>
            )}

            {!isSearching &&
              searchSuggestions.map((item, index) => (
                <Link
                  key={index}
                  href={`/${locale}${item.url_path}`}
                  className="mobile-suggestion-item d-flex align-items-center gap-3 p-3 border-bottom text-decoration-none text-dark"
                  onClick={() => {
                    setSearchKeyWord("");
                    setSearchSuggestions([]);
                    setIsSearchActive(false);
                  }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}storage/${item.image}`}
                    alt={item.name || "Product"}
                    width={45}
                    height={45}
                    className="mobile-suggestion-img"
                  />
                  <div className="mobile-suggestion-info flex-grow-1">
                    <span className="mobile-suggestion-name d-block fw-medium fs-14 text-start">
                      {item.name}
                    </span>
                    <span className="mobile-suggestion-price text-muted fs-13 text-start d-block">
                      {item.price} {t("ر.س")}
                    </span>
                  </div>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}

            {!isSearching && searchSuggestions.length > 0 && (
              <Link
                href={`/${locale}/shop?q=${searchKeyWord}`}
                className="d-block text-center p-3 fs-13 fw-bold text-uppercase border-top bg-light text-dark text-decoration-none"
                onClick={() => {
                  setSearchKeyWord("");
                  setSearchSuggestions([]);
                  setIsSearchActive(false);
                }}
              >
                {t("View All Results")}
              </Link>
            )}
          </div>
        )}

        {/* ── Slide-out navigation drawer ── */}
        <nav className="header-mobile__navigation navigation d-flex flex-column w-100 position-absolute top-100 bg-body overflow-auto">
          <div className="container py-3">
            <div className="overflow-hidden">
              <ul className="navigation__list list-unstyled position-relative mb-0 pb-3">
                <MobileNav />
              </ul>
            </div>
          </div>
        </nav>
        {/* <!-- /.navigation --> */}
      </div>
    </>
  );
}
