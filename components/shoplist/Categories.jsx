// Categories.js

"use client";
import React from "react"; // Removed unused hooks
import { usePathname } from "next/navigation";
import Categoriess from "@/components/homes/home-3/Categories";
import { useTranslations } from "next-intl";

export default function Categories({ subCategories }) {
    const pathname = usePathname();
    const category = pathname.split("/")[3];
    const subcategory = pathname.split("/")[4];
    const t = useTranslations();

    return (
        <>
            <section className="full-width_padding pb-3">
                <div className="shop-categories position-relative">
                    <h2 className="h3 pb-3 mb-4 fw-normal text-uppercase text-center">
                        {subcategory == null
                            ? t(
                                category
                                    .split("-")
                                    .join(" ")
                                    .charAt(0)
                                    .toUpperCase() + category.slice(1)
                            )
                            : t(subcategory.split("-").join(" "))}
                    </h2>
                    
                </div>
            </section>
            {subcategory == null ? (
                <Categoriess subCategories={subCategories} />
            ) : null}
        </>
    );
}