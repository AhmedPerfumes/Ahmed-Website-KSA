"use client";
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
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useLocale, useTranslations } from "next-intl";

export default function Nav({ categoriesSubCategories }) {
  // console.log('000000000', categoriesSubCategories);
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const isMenuActive = (menu) => {
    return menu.split("/")[3] == pathname.split("/")[4];
  };
  const isActiveParentMenu = (menu) => {
    return menu.split("/")[2] == pathname.split("/")[3];
  };
  const isActiveExportMenu = (menu) => {
    // console.log(menu, pathname);
    return menu.split("/")[1] == pathname.split("/")[2];
  };

  useEffect(() => {
    function setBoxMenuPosition(menu) {
      const scrollBarWidth = 17; // You might need to calculate or define this value
      const limitR = window.innerWidth - menu.offsetWidth - scrollBarWidth;
      const limitL = 0;
      const menuPaddingLeft = parseInt(
        window.getComputedStyle(menu, null).getPropertyValue("padding-left")
      );
      const parentPaddingLeft = parseInt(
        window
          .getComputedStyle(menu.previousElementSibling, null)
          .getPropertyValue("padding-left")
      );
      const centerPos =
        menu.previousElementSibling.offsetLeft -
        menuPaddingLeft +
        parentPaddingLeft;

      let menuPos = centerPos;
      if (centerPos < limitL) {
        menuPos = limitL;
      } else if (centerPos > limitR) {
        menuPos = limitR;
      }

      menu.style.left = `${menuPos}px`;
    }
    document.querySelectorAll(".box-menu").forEach((el) => {
      setBoxMenuPosition(el);
    });
  }, []);

  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, ' ').trim();

    return cleanedStr;
  }

  let categoriesSubCategoriesBody = categoriesSubCategories?.map((item, i) => {
    return (
      <li className="navigation__item" key={i}>
        <Link
          href={item.name != 'Gift Sets' ? `/${locale}/product-category/${removeSpecialCharactersAndAmp(item.name).split(' ').join('-').toLowerCase()}` : `/${locale}/product-category/gift-sets`}
          className={`navigation__link
          ${isActiveParentMenu(`/product-category/${removeSpecialCharactersAndAmp(item.name).split(' ').join('-').toLowerCase()}`) ? "menu-active" : ""}
          `}
        >
          { t(item.name) }
        </Link>
        { item.productSubCategories.length > 0 ?
          <div className="mega-menu">
            <div className="container d-flex">
              <div className="col pe-4">
                <p href="#" className="sub-menu__title">
                {t("PRODUCT TYPES")}
                </p>
                <ul className="sub-menu__list list-unstyled">
                  {item.productSubCategories.map((elm, ind) => (
                    <li key={ind} className="sub-menu__item">
                      <Link
                        href={item.name != 'Gift Sets' ? `/${locale}/product-category/${removeSpecialCharactersAndAmp(item.name).split(' ').join('-').toLowerCase()}/${removeSpecialCharactersAndAmp(elm.name).split(' ').join('-').toLowerCase()}` : `/${locale}/product-category/gift-sets`}
                        className={`menu-link menu-link_us-s ${
                          isMenuActive(`/product-category/${item.name.split(' ').join('-').toLowerCase()}/${elm.name.split(' ').join('-').toLowerCase()}`) ? "menu-active" : ""
                        }`}
                      >
                        {t(elm.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mega-menu__media col pe-4">
                <div className="position-relative">
                  <Link href={item.name != 'Gift Sets' ? `/${locale}/product-category/${removeSpecialCharactersAndAmp(item.name).split(' ').join('-').toLowerCase()}` : `/${locale}/product-category/gift-sets`}>
                    <Image
                      loading="lazy"
                      className="mega-menu__img"
                      src={`${process.env.NEXT_PUBLIC_API_URL}storage/${item.icon_image}`}
                      width={902}
                      height={990}
                      style={{ height: "fit-content" }}
                      alt="New Horizons"
                    />
                  </Link>
                </div>
              </div>

              <div className="mega-menu__media col pe-4">
                <div className="position-relative">
                  <Link href={item.name != 'Gift Sets' ? `/${locale}/product-category/${removeSpecialCharactersAndAmp(item.name).split(' ').join('-').toLowerCase()}` : `/${locale}/product-category/gift-sets`}>
                    <Image
                      loading="lazy"
                      className="mega-menu__img"
                      src={`${process.env.NEXT_PUBLIC_API_URL}storage/${item.menu_image2}`}
                      width={902}
                      height={990}
                      style={{ height: "fit-content" }}
                      alt="New Horizons"
                    />
                  </Link>
                </div>
              </div>
            </div>
            {/* <!-- /.container d-flex --> */}
          </div> : null
        }
      </li>
    );
  });

  categoriesSubCategoriesBody.push(
    <li key="export" className="navigation__item">
      <Link href={`/${locale}/export`} className={`navigation__link
          ${isActiveExportMenu(`/export`) ? "menu-active" : ""}
          `}>
        {t("Worldwide Distribution")}
      </Link>
    </li>
  );

  return (
    <>
      { categoriesSubCategoriesBody && categoriesSubCategoriesBody }
    </>
  );
}
