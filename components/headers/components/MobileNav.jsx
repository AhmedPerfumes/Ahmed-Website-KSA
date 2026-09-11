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
      <style jsx>{`
        .sub-menu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-in-out;
        }
        .sub-menu.open {
          max-height: 1000px;
        }
        .toggle-button {
          background: none;
          border: none;
          padding: 0 10px;
          margin-left: ${locale === "ar" ? "0" : "auto"};
          margin-right: ${locale === "ar" ? "auto" : "0"};
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
        }
        .sub-menu__item {
          padding-left: ${locale === "ar" ? "0" : "1.5rem"};
          padding-right: ${locale === "ar" ? "1.5rem" : "0"};
        }
      `}</style>

      {categoriesSubCategories?.map((item, i) => {
        const isOpen = openCategoryIndex === i;
        const hasSubCategories = item.productSubCategories?.length > 0;
        const categorySlug =
          item.name !== "Gift Sets"
            ? `/${locale}/product-category/${item.name.split(" ").join("-").toLowerCase()}`
            : `/${locale}/product-category/gift-sets`;

        return (
          <li key={i} className="navigation__item d-flex flex-column border-bottom">
            <div className="d-flex align-items-center w-100 py-2">
              <Link
                href={categorySlug}
                className={`navigation__link text-start flex-grow-1 ${
                  isActiveParentMenu(categorySlug) ? "menu-active fw-bold" : ""
                }`}
                style={{ textAlign: locale === "ar" ? "right" : "left" }}
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
                  className="toggle-button"
                  aria-label="Toggle sub-menu"
                >
                  {isOpen ? "-" : "+"}
                </button>
              )}
            </div>

            <div className={`sub-menu ${isOpen && hasSubCategories ? "open" : ""}`}>
              {isOpen && hasSubCategories && (
                <ul className="list-unstyled mb-0 pb-2">
                  {hasSubCategories &&
                    item.productSubCategories.map((elm, j) => (
                      <li key={j} className="sub-menu__item">
                        <Link
                          href={
                            item.name !== "Gift Sets"
                              ? `/${locale}/product-category/${item.name.split(" ").join("-").toLowerCase()}/${elm.name.split(" ").join("-").toLowerCase()}`
                              : `/${locale}/product-category/gift-sets`
                          }
                          className={`menu-link d-block py-1 text-secondary ${
                            isMenuActive(
                              `/product-category/${item.name.split(" ").join("-").toLowerCase()}/${elm.name.split(" ").join("-").toLowerCase()}`
                            )
                              ? "menu-active text-dark fw-medium"
                              : ""
                          }`}
                          style={{
                            textAlign: locale === "ar" ? "right" : "left",
                            fontSize: "0.825rem",
                          }}
                        >
                          {t(elm.name)}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
      {saleBanner && (
        <li key="sale" className="navigation__item border-bottom py-2">
          <Link
            href={`/${locale}/${saleBanner.link || "sale"}`}
            className={`navigation__link d-block text-start ${
              isActiveExportMenu(`/sale`) ? "menu-active fw-bold" : ""
            }`}
            style={{ textAlign: locale === "ar" ? "right" : "left" }}
          >
            {t("Sale")}
          </Link>
        </li>
      )}

      <li key="export" className="navigation__item border-bottom py-2">
        <Link
          href={`/${locale}/export`}
          className={`navigation__link d-block text-start ${
            isActiveExportMenu(`/export`) ? "menu-active fw-bold" : ""
          }`}
          style={{ textAlign: locale === "ar" ? "right" : "left" }}
        >
          {t("Worldwide Distribution")}
        </Link>
      </li>
    </>
  );
}

