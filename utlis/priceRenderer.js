// utlis/priceRenderer.js
import React from "react";

export const renderPrice = (product, currency) => {
  const sym = currency?.symbol || "";
  const base = Number(product?.price || 0);
  const d = product?.discount;

  // Show sale price whenever a discount with a computable value exists
  if (d?.value) {
    let sale = null;

    if (d.discount_type === "percent") {
      sale = (base - (base * Number(d.value)) / 100).toFixed(2);
    } else if (d.discount_type === "amount") {
      // prefer final_price if backend provides it, else compute
      sale = d.final_price
        ? Number(d.final_price).toFixed(2)
        : (base - Number(d.value)).toFixed(2);
    }

    if (sale !== null && Number(sale) < base) {
      return (
        <>
          <span className="money price price-old">
            {base.toFixed(2)}{sym}
          </span>
          <span className="money price price-sale">
            {sale}{sym}
          </span>
        </>
      );
    }
  }

  // Fall back: regular price
  return (
    <span className="money price">
      {base.toFixed(2)}{sym}
    </span>
  );
};
