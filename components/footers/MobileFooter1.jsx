"use client";
import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { openModalUserlogin } from "@/utlis/aside";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { currencyOptions, languageOptions } from "@/data/footer";
import { socialLinks } from "@/data/socials";
import { IoLocationOutline } from "react-icons/io5";

/**
 * MobileFooter1 — fixed bottom nav bar for mobile with 5 tabs:
 * Home | Shop | Cart | Account | More
 *
 * Clicking 'More' opens a popup containing:
 * - Find a Store button
 * - Language selector
 * - Country selector
 * - Social media links
 */
export default function MobileFooter1() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { cartProducts } = useContextElement();
  const { isLoggedIn } = useUser();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [currentCountryLink, setCurrentCountryLink] = useState("");

  // Detect current country from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin;
      const matchedOption = currencyOptions.find(
        (option) =>
          option.link &&
          (currentOrigin.includes(option.link) ||
            option.link.includes(currentOrigin))
      );
      setCurrentCountryLink(
        matchedOption ? matchedOption.link : currencyOptions[0]?.link ?? ""
      );
    }
  }, []);

  // Close popup on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen]);

  const handleLangChange = (e) => {
    router.push(pathname, { locale: e.target.value });
    setIsMoreOpen(false);
  };

  const isHomeActive = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isShopActive = pathname.includes("/shop") && !pathname.includes("/shop-cart");
  const isCartActive = pathname.includes("/shop-cart");
  const isAccountActive = pathname.includes("/account");

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`footer-more-backdrop ${isMoreOpen ? "footer-more-backdrop--visible" : ""}`}
        onClick={() => setIsMoreOpen(false)}
        aria-hidden="true"
      />

      {/* 'More' Popup Card */}
      <div
        className={`footer-more-popup ${isMoreOpen ? "footer-more-popup--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="More options"
      >
        <div className="footer-more-popup__header">
          <span className="footer-more-popup__title">
            {locale === "ar" ? "المزيد" : "More"}
          </span>
          <button
            type="button"
            className="footer-more-popup__close"
            onClick={() => setIsMoreOpen(false)}
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="footer-more-popup__list">
          {/* Stacked Row 1: Find a Store */}
          <Link
            href={`/${locale}/store-locator`}
            onClick={() => setIsMoreOpen(false)}
            className="more-menu__item"
          >
            <div className="more-menu__icon-box">
              <IoLocationOutline size={18} />
            </div>
            <div className="more-menu__info">
              <span className="more-menu__title">{t("Find a store")}</span>
            </div>
            <svg
              className="more-menu__arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>

          {/* Stacked Row 2: Language */}
          <div className="more-menu__item">
            <div className="more-menu__icon-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className="more-menu__info">
              <span className="more-menu__title">{t("Language")}</span>
            </div>
            <div className="more-menu__control">
              <select
                className="more-menu__select"
                aria-label="Language selector"
                name="footer-language"
                value={locale}
                onChange={handleLangChange}
              >
                {languageOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              <svg
                className="more-menu__select-arrow"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Stacked Row 3: Country */}
          <div className="more-menu__item">
            <div className="more-menu__icon-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div className="more-menu__info">
              <span className="more-menu__title">{t("Country")}</span>
            </div>
            <div className="more-menu__control">
              <select
                className="more-menu__select"
                aria-label="Country selector"
                name="footer-country"
                value={currentCountryLink}
                onChange={(e) => window.open(e.target.value, "_self")}
              >
                {currencyOptions.map((option, index) => (
                  <option key={index} value={option.link}>
                    {t(option.text)}
                  </option>
                ))}
              </select>
              <svg
                className="more-menu__select-arrow"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="more-menu__social-section">
          <span className="more-menu__social-title">
            {locale === "ar" ? "تابعنا" : "Follow Us"}
          </span>
          <ul className="more-menu__social-list list-unstyled mb-0">
            {socialLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="more-menu__social-btn"
                  aria-label={link.icon?.replace("#icon_", "") || "social"}
                >
                  <svg
                    className={link.className}
                    width={link.width}
                    height={link.height}
                    viewBox={link.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <use href={link.icon} />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fixed Footer Navigation Bar */}
      <footer className="footer-mobile container w-100 px-2 d-md-none bg-body position-fixed footer-mobile_initialized">
        <div className="footer-mobile__inner">
          {/* Home */}
          <div className="footer-mobile__col">
            <Link
              href={`/${locale}`}
              className={`footer-mobile__link d-flex flex-column align-items-center ${
                isHomeActive ? "active" : ""
              }`}
            >
              <svg
                className="d-block"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_home" />
              </svg>
              <span>{locale === "ar" ? "الرئيسية" : "Home"}</span>
            </Link>
          </div>

          {/* Shop */}
          <div className="footer-mobile__col">
            <Link
              href={`/${locale}/shop`}
              className={`footer-mobile__link d-flex flex-column align-items-center ${
                isShopActive ? "active" : ""
              }`}
            >
              <svg
                className="d-block"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_gift" />
              </svg>
              <span>{locale === "ar" ? "المتجر" : "Shop"}</span>
            </Link>
          </div>

          {/* Cart */}
          <div className="footer-mobile__col">
            <Link
              href={`/${locale}/shop-cart`}
              className={`footer-mobile__link d-flex flex-column align-items-center ${
                isCartActive ? "active" : ""
              }`}
            >
              <div className="position-relative">
                <svg
                  className="d-block"
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_cart" />
                </svg>
                {cartProducts.length > 0 && (
                  <span className="wishlist-amount d-block position-absolute js-wishlist-count">
                    {cartProducts.length}
                  </span>
                )}
              </div>
              <span>{locale === "ar" ? "السلة" : "Cart"}</span>
            </Link>
          </div>

          {/* Account / Login */}
          <div className="footer-mobile__col">
            {isLoggedIn ? (
              <Link
                href={`/${locale}/account_dashboard`}
                className={`footer-mobile__link d-flex flex-column align-items-center ${
                  isAccountActive ? "active" : ""
                }`}
                id="mobile-footer-account-link"
              >
                <svg
                  className="d-block"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span>{locale === "ar" ? "حسابي" : "Account"}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openModalUserlogin}
                className="footer-mobile__link d-flex flex-column align-items-center border-0 bg-transparent p-0 w-100"
                id="mobile-footer-login-btn"
                aria-label="Login to your account"
              >
                <svg
                  className="d-block"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span>{locale === "ar" ? "دخول" : "Login"}</span>
              </button>
            )}
          </div>

          {/* More */}
          <div className="footer-mobile__col">
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`footer-mobile__link d-flex flex-column align-items-center border-0 bg-transparent p-0 w-100 ${
                isMoreOpen ? "active" : ""
              }`}
              id="mobile-footer-more-btn"
              aria-label="More options"
              aria-expanded={isMoreOpen}
            >
              <svg
                className="d-block"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
              <span>{locale === "ar" ? "المزيد" : "More"}</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}