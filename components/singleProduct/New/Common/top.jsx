import React, { useMemo } from "react";
import he from "he";
import { useTranslations } from "next-intl";
import BreadCumb from "../../BreadCumb";
import { useLocale } from "next-intl";

const Top = ({ product }) => {
    const locale = useLocale();
    const t = useTranslations();

    const cleanName = useMemo(() => {
        const nameToUse = locale === 'ar' ? product?.product_name_ar : product?.product_name;

        if (nameToUse) {
            return he.decode(nameToUse);
        }
        return "";
    }, [product?.product_name, product?.product_name_ar, locale]);

    return (
        <div className="mt-lg-4">
            {/* Product Name */}
            {/* <h1
        className="text-dark mb-1"
        style={{
          fontFamily: "Lobster, cursive",
          fontSize: "calc(1.375rem + 1.5vw)",
        }}
      >
      {product?.product_name && t(he.decode(product?.product_name))}
      </h1> */}
            <h1 className="product-single__name hii">
                {cleanName}
            </h1>

            {/* Categories */}
            <div className="d-flex justify-content-between">
                <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
                    <BreadCumb category={product?.category} subcategory={product?.subcategory} />
                </div>
            </div>
        </div>
    );
};

export default Top;
