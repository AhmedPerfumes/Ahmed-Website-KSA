// utils/priceRenderer.js
import React from "react";

export const renderPrice = (product, currency) => {
  const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // GST offset
  const start = new Date(product?.discount?.start_date);
  const end = new Date(product?.discount?.end_date);

  if (product?.discount && now >= start && now <= end) {
    const { discount_type, value } = product.discount;

    if (discount_type === "percent") {
      const discounted = (product.price - (product.price * value) / 100).toFixed(2);
      return (
        <>
          <span className="money price price-old">
            {currency.symbol}{product.price}
          </span>
          <span className="money price price-sale">
            {currency.symbol}{discounted}
          </span>
        </>
      );
    } else if (discount_type === "amount") {
      const discounted = product.discount.final_price;
      return (
        <>
          <span className="money price price-old">
            {currency.symbol}{product.price}
          </span>
          <span className="money price price-sale">
            {currency.symbol}{discounted}
          </span>
        </>
      );
    }
  }

  return (
    <span className="money price">
      {product.price}{currency.symbol}
    </span>
  );
};
