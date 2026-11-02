"use client";
import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { currencyOptions, languageOptions } from "@/data/footer";

const SelectArrow = () => (
  <svg className="more-menu__select-arrow" width="10" height="10" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Language + Country selector rows (styled by .more-menu__* in _footer-mobile-fixed.scss).
 * Shared by the mobile footer "More" popup and the mobile hamburger drawer.
 *
 * @param {string}   namePrefix  unique prefix for the <select> name attributes
 * @param {Function} onChange    optional callback after a selection (e.g. close the popup)
 */
export default function LanguageCountrySelectors({ namePrefix = "mobile", onChange }) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [currentCountryLink, setCurrentCountryLink] = useState("");

  // Detect current country from URL
  useEffect(() => {
    const currentOrigin = window.location.origin;
    const matchedOption = currencyOptions.find(
      (option) =>
        option.link &&
        (currentOrigin.includes(option.link) || option.link.includes(currentOrigin))
    );
    setCurrentCountryLink(matchedOption ? matchedOption.link : currencyOptions[0]?.link ?? "");
  }, []);

  const handleLangChange = (e) => {
    router.push(pathname, { locale: e.target.value });
    onChange?.();
  };

  const handleCountryChange = (e) => {
    onChange?.();
    window.open(e.target.value, "_self");
  };

  return (
    <>
      {/* Language */}
      <div className="more-menu__item">
        <div className="more-menu__icon-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
            aria-label={t("Language")}
            name={`${namePrefix}-language`}
            value={locale}
            onChange={handleLangChange}
          >
            {languageOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          <SelectArrow />
        </div>
      </div>

      {/* Country */}
      <div className="more-menu__item">
        <div className="more-menu__icon-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
            aria-label={t("Country")}
            name={`${namePrefix}-country`}
            value={currentCountryLink}
            onChange={handleCountryChange}
          >
            {currencyOptions.map((option, index) => (
              <option key={index} value={option.link}>
                {t(option.text)}
              </option>
            ))}
          </select>
          <SelectArrow />
        </div>
      </div>
    </>
  );
}
