"use client";

import { useEffect } from "react";
import {
  additionalShopPageitems,
  blogmenuItems,
  homePages,
  othersMenuItems,
  shopDetails,
  shopList,
  collections
} from "@/data/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from '../../../context/MenuContext';

// import { useLocale, useTranslations } from "next-intl";
export default function MobileNav() {

  // const locale = useLocale();
  // const t = useTranslations();
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  // const category = searchParams.get('category');
  // const subcategory = searchParams.get('subcategory');
  
  const isMenuActive = (menu) => {
    return menu.split("/")[3] == pathname.split("/")[3];
  };
  const isActiveParentMenu = (menu) => {
    return menu.split("/")[2] == pathname.split("/")[2];
  };
  const isActiveExportMenu = (menu) => {
    // console.log(menu, pathname);
    return menu.split("/")[1] == pathname.split("/")[2];
  };

  useEffect(() => {
    const selectors = {
      mobileMenuActivator: ".mobile-nav-activator",
      mobileMenu: ".navigation",
      mobileMenuActiveClass: "mobile-menu-opened",
      mobileSubNavOpen: ".js-nav-right",
      mobileSubNavClose: ".js-nav-left",
      mobileSubNavHiddenClass: "d-none",
    };

    const mobileMenuActivator = document.querySelector(
      selectors.mobileMenuActivator
    );
    const mobileDropdown = document.querySelector(selectors.mobileMenu);
    let transformLeft = 0;

    const toggleMobileMenu = (event) => {
      if (event) {
        event.preventDefault();
      }

      if (document.body.classList.contains(selectors.mobileMenuActiveClass)) {
        document.body.classList.remove(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "";
        mobileDropdown.style.paddingRight = "";
      } else {
        document.body.classList.add(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "scrollWidth"; // Replace with appropriate value
        mobileDropdown.style.paddingRight = "scrollWidth"; // Replace with appropriate value
      }
    };

    if (mobileDropdown) {
      mobileMenuActivator &&
        mobileMenuActivator.addEventListener("click", toggleMobileMenu);

      const mobileMenu = mobileDropdown.querySelector(".navigation__list");
      let menuMaxHeight = mobileMenu.offsetHeight;

      const openSubNav = (event, btn) => {
        event.preventDefault();
        btn.nextElementSibling.classList.remove(
          selectors.mobileSubNavHiddenClass
        );

        transformLeft -= 100;
        if (menuMaxHeight < btn.nextElementSibling.offsetHeight) {
          mobileMenu.style.transform = `translateX(${transformLeft}%)`;
          mobileMenu.style.minHeight = `${btn.nextElementSibling.offsetHeight}px`;
        } else {
          mobileMenu.style.transform = `translateX(${transformLeft}%)`;
          mobileMenu.style.minHeight = `${menuMaxHeight}px`;
        }
      };

      const closeSubNav = (event, btn) => {
        event.preventDefault();
        transformLeft += 100;
        mobileMenu.style.transform = `translateX(${transformLeft}%)`;
        btn.parentElement.classList.add(selectors.mobileSubNavHiddenClass);
        const wrapper = btn.closest(".sub-menu");
        if (wrapper) {
          const minHeight =
            menuMaxHeight < wrapper.offsetHeight
              ? wrapper.offsetHeight
              : menuMaxHeight;
          mobileMenu.style.minHeight = `${minHeight}px`;
        }
      };

      mobileMenu &&
        Array.from(
          mobileMenu.querySelectorAll(selectors.mobileSubNavOpen)
        ).forEach((btn) => {
          btn.addEventListener("click", (event) => openSubNav(event, btn));
        });

      mobileMenu &&
        Array.from(
          mobileMenu.querySelectorAll(selectors.mobileSubNavClose)
        ).forEach((btn) => {
          btn.addEventListener("click", (event) => closeSubNav(event, btn));
        });

      return () => {
        mobileMenuActivator &&
          mobileMenuActivator.removeEventListener("click", toggleMobileMenu);
        mobileMenu &&
          Array.from(
            mobileMenu.querySelectorAll(selectors.mobileSubNavOpen)
          ).forEach((btn) => {
            btn.removeEventListener("click", (event) => openSubNav(event, btn));
          });
        mobileMenu &&
          Array.from(
            mobileMenu.querySelectorAll(selectors.mobileSubNavClose)
          ).forEach((btn) => {
            btn.removeEventListener("click", (event) =>
              closeSubNav(event, btn)
            );
          });
      };
    }
  }, []);
  useEffect(() => {
    const selectors = {
      mobileMenuActivator: ".mobile-nav-activator",
      mobileMenu: ".navigation",
      mobileMenuActiveClass: "mobile-menu-opened",
      mobileSubNavOpen: ".js-nav-right",
      mobileSubNavClose: ".js-nav-left",
      mobileSubNavHiddenClass: "d-none",
    };

    const mobileDropdown = document.querySelector(selectors.mobileMenu);

    const removeMenu = (event) => {
      if (event) {
        event.preventDefault();
      }

      if (document.body.classList.contains(selectors.mobileMenuActiveClass)) {
        document.body.classList.remove(selectors.mobileMenuActiveClass);
        document.body.style.paddingRight = "";
        mobileDropdown.style.paddingRight = "";
      }
    };
    removeMenu();
  // }, [pathname, category, subcategory]);
  }, [pathname]);

  const { categoriesSubCategories, isLoading: isMenuLoading, error } = useMenu();

  if (isMenuLoading) {
    return <div></div>;
  }
  if (error) {
    return <div>{ error }</div>;
  }

  let categoriesSubCategoriesBody = categoriesSubCategories?.map((item, i) => {
    return (
      <li key={i} className="navigation__item">
        <Link
          href={item.name != 'Gift Sets' ? `/en/product-category/${item.name.split(' ').join('-').toLowerCase()}` : `/en/product-category/gift-sets`}
          className={`navigation__link js-nav-right d-flex align-items-center
            ${isActiveParentMenu(`/product-category/${item.name.split(' ').join('-').toLowerCase()}`) ? "menu-active" : ""}
          }`}
        >
          { item.name }
          {/* <svg
            className="ms-auto"
            width="7"
            height="11"
            viewBox="0 0 7 11"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_next_sm" />
          </svg> */}
        </Link>
        <div className="sub-menu position-absolute top-0 start-100 w-100 d-none">
          <Link
            href="#"
            className="navigation__link js-nav-left d-flex align-items-center border-bottom mb-2"
          >
            <svg
              className="me-2"
              width="7"
              height="11"
              viewBox="0 0 7 11"
              xmlns="http://www.w3.org/2000/svg"
            >
              <use href="#icon_prev_sm" />
            </svg>
            { item.name }
          </Link>
          <ul className="list-unstyled">
            {item.productSubCategories.map((elm, i) => (
              <li key={i} className="sub-menu__item">
                <Link
                  href={item.name != 'Gift Sets' ? `/en/product-category/${item.name.split(' ').join('-').toLowerCase()}/${elm.name.split(' ').join('-').toLowerCase()}` : `/en/product-category/gift-sets`}
                  className={`menu-link menu-link_us-s ${
                    isMenuActive(`/product-category/${item.name.split(' ').join('-').toLowerCase()}/${elm.name.split(' ').join('-').toLowerCase()}`) ? "menu-active" : ""
                  }`}
                >
                  { elm.name }
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    )
  });

  categoriesSubCategoriesBody.push(
    <li key="export" className="navigation__item">
      <Link href={`/en/export`} className={`navigation__link
          ${isActiveExportMenu(`/export`) ? "menu-active" : ""}
          `}>
        Worldwide Distribution
      </Link>
    </li>
  );
  
  return (
    <>
      { categoriesSubCategoriesBody && categoriesSubCategoriesBody }
    </>
  );
}
