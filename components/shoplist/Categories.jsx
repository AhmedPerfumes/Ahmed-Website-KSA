"use client";
import { shopCategories } from "@/data/categories";
import React from "react";
import Image from "next/image";

import { usePathname } from "next/navigation";

import Categoriess from "@/components/homes/home-3/Categories";
import { useTranslations } from "next-intl";

export default function Categories({ description, subCategories }) {
  const pathname = usePathname();
  const category = pathname.split("/")[3];
  const subcategory = pathname.split("/")[4];
  const t = useTranslations();
  
  return (
    <>
      <section
        className="full-width_padding"
        // style={{ backgroundColor: "#faf9f8" }}
      >
        <div className="shop-categories position-relative">
          <h2 className="h3 pb-3 mb-4 fw-normal text-uppercase text-center">
            {subcategory == null ? t(category.split("-").join(" ").charAt(0).toUpperCase()+ category.slice(1)) : t(subcategory.split("-").join(" "))}
          </h2>
          {description && <div dangerouslySetInnerHTML={{ __html: description }} className="fs-6 fw-medium mb-4 text-center mw-930">
          </div>}
        </div>
      </section>
      {subcategory == null ? <Categoriess subCategories={ subCategories }/> : null}
    </>
  );
}
