import React from "react";
import Link from "next/link";
// import { useTranslations } from "next-intl";

export default function BreadCumb({ category, subcategory, product }) {
  // const t = useTranslations();

  // Function to capitalize the first letter of each word
  function capitalizeEachWord(str) {
    return str.split(' ') // Split the sentence into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
              .join(' '); // Join the words back into a sentence
  }

  return (
    <>
      <a href="/" className="menu-link menu-link_us-s text-uppercase fw-medium">
      Home
      </a>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
        /
      </span>
      <Link href="#" className="menu-link menu-link_us-s text-uppercase fw-medium">
        Shop
      </Link>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
        /
      </span>
      <Link href={category != 'gift-sets' ? `/en/product-category/${category}` : '/en/product-category/gift-sets'} className="menu-link menu-link_us-s fw-medium">
        { capitalizeEachWord(category.split('-').join(' ')) }
      </Link>
      <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
        /
      </span>
      <Link href={category != 'gift-sets' ? `/en/product-category/${category}/${subcategory}` : '/en/product-category/gift-sets'} className="menu-link menu-link_us-s fw-medium">
        { capitalizeEachWord(subcategory.split('-').join(' ')) }
      </Link>
    </>
  );
}
