import React from "react";
import Link from "next/link";

import { useLocale } from "next-intl";

export default function BreadCumb({ category, subcategory }) {

  const locale = useLocale();
  // console.log(category, subcategory);
  return (
    <>
      <a href="/" className="menu-link menu-link_us-s text-uppercase fw-medium">
        Home
      </a>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
        /
      </span>
      <Link href={`/${locale}/shop`} className="menu-link menu-link_us-s text-uppercase fw-medium">
        Shop
      </Link>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
      {category ? `/` : ``}
      </span>
      <Link href={subcategory ? `/${locale}/product-category/${category}` : `#`} className="menu-link menu-link_us-s text-uppercase fw-medium">
        {category?.split("-").join(" ")}
      </Link>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
      {subcategory ? `/` : ``}
      </span>
      <Link href="#" className="menu-link menu-link_us-s text-uppercase fw-medium">
        {subcategory && subcategory.split("-").join(" ")}
      </Link>
    </>
  );
}
