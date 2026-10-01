"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "../../../context/MenuContext";
import { useLocale, useTranslations } from "next-intl";

export default function MobileNav() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const { categoriesSubCategories, isLoading: isMenuLoading, error, homeSliders } = useMenu();
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);

  const isSaleLink = (link) => {
    if (!link) return false;
    const s = String(link).toLowerCase();
    return s === "sale" || s === "/sale" || s.includes("/sale");
  };

  const saleBanner = Array.isArray(homeSliders)
    ? homeSliders.find((s) => isSaleLink(s.link))
    : null;

  const isMenuActive = (menu) => menu.split("/")[3] === pathname.split("/")[4];
  const isActiveParentMenu = (menu) => menu.split("/")[2] === pathname.split("/")[3];
  const isActiveExportMenu = (menu) => menu.split("/")[1] === pathname.split("/")[2];

  useEffect(() => {
    const selectors = {
      mobileMenuActivator: ".mobile-nav-activator",
      mobileMenu: ".navigation",
      mobileMenuActiveClass: "mobile-menu-opened",
    };

    const mobileMenuActivator = document.querySelector(selectors.mobileMenuActivator);
    const mobileDropdown = document.querySelector(selectors.mobileMenu);

    const toggleMobileMenu = (event) => {
      event?.preventDefault();
      if (document.body.classList.contains(selectors.mobileMenuActiveClass)) {
        document.body.classList.remove(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "";
        if (mobileDropdown) mobileDropdown.style.paddingRight = "";
      } else {
        document.body.classList.add(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "scrollWidth";
        if (mobileDropdown) mobileDropdown.style.paddingRight = "scrollWidth";
      }
    };

    if (mobileMenuActivator) {
      mobileMenuActivator.addEventListener("click", toggleMobileMenu);
    }

    return () => {
      if (mobileMenuActivator) {
        mobileMenuActivator.removeEventListener("click", toggleMobileMenu);
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.remove("mobile-menu-opened");
    document.body.style.paddingRight = "";
    const mobileDropdown = document.querySelector(".navigation");
    if (mobileDropdown) mobileDropdown.style.paddingRight = "";
  }, [pathname]);

  if (isMenuLoading) return <div></div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {categoriesSubCategories?.map((item, i) => {
        const isOpen = openCategoryIndex === i;
        const hasSubCategories = item.productSubCategories?.length > 0;
        const categorySlug =
          item.name !== "Gift Sets"
            ? `/${locale}/product-category/${item.name.split(" ").join("-").toLowerCase()}`
            : `/${locale}/product-category/gift-sets`;

        return (
          <li key={i} className="navigation__item">
            <div className="navigation__item-row">
              <Link
                href={categorySlug}
                className={`navigation__link flex-grow-1 ${isActiveParentMenu(categorySlug) ? "menu-active" : ""
                  }`}
              >
                {t(item.name)}
              </Link>
              {hasSubCategories && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenCategoryIndex(isOpen ? null : i);
                  }}
                  className={`toggle-button ${isOpen ? "is-open" : ""}`}
                  aria-label={`Toggle ${item.name} sub-menu`}
                  aria-expanded={isOpen}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="toggle-chevron"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {hasSubCategories && (
              <div className={`sub-menu ${isOpen ? "open" : ""}`}>
                <ul className="sub-menu__list list-unstyled">
                  {item.productSubCategories.map((elm, j) => (
                    <li key={j} className="sub-menu__item">
                      <Link
                        href={
                          item.name !== "Gift Sets"
                            ? `/${locale}/product-category/${item.name.split(" ").join("-").toLowerCase()}/${elm.name.split(" ").join("-").toLowerCase()}`
                            : `/${locale}/product-category/gift-sets`
                        }
                        className={`sub-menu__link ${isMenuActive(
                          `/product-category/${item.name.split(" ").join("-").toLowerCase()}/${elm.name.split(" ").join("-").toLowerCase()}`
                        )
                            ? "menu-active"
                            : ""
                          }`}
                      >
                        <span>{t(elm.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}

      {saleBanner && (
        <li key="sale" className="navigation__item">
          <div className="navigation__item-row">
            <Link
              href={`/${locale}/${saleBanner.link || "sale"}`}
              className={`navigation__link d-block w-100 ${isActiveExportMenu(`/sale`) ? "menu-active" : ""
                }`}
            >
              {t("Sale")}
            </Link>
          </div>
        </li>
      )}
    </>
  );
}

