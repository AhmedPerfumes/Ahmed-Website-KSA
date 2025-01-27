"use client";
import React, { useState } from "react";
import Slider4 from "./sliders/Slider4";
import BreadCumbWithoutTrans from "./BreadCumbWithoutTrans";
import Star from "../common/Star";
import Size from "./Size";
import DescriptionWithoutTrans from "./DescriptionWithoutTrans";
import AdditionalInfoWithoutTrans from "./AdditionalInfoWithoutTrans";
import Reviews from "./Reviews";
import Clolor2 from "./Clolor2";
import ShareComponentWithoutTrans from "../common/ShareComponentWithoutTrans";
import { useContextElement } from "@/context/Context";
import he from 'he';
// import { useLocale, useTranslations } from "next-intl";
import { useMenu } from '@/context/MenuContext';

export default function SingleProduct11({ category, subcategory, product }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { cartProducts, setCartProducts } = useContextElement();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  // const locale = useLocale();
  // const t = useTranslations();

  const isIncludeCard = () => {
    const item = cartProducts.filter((elm) => elm.product_id == product.product_id)[0];
    return item;
  };
  const setQuantityCartItem = (id, quantity) => {
    if (isIncludeCard()) {
      if (quantity >= 1 && quantity <= product.product_qty) {
        setError(null);
        const item = cartProducts.filter((elm) => elm.product_id == id)[0];
        const items = [...cartProducts];
        const itemIndex = items.indexOf(item);
        item.quantity = quantity;
        items[itemIndex] = item;
        setCartProducts(items);
      } else {
        setError("Quantity is more than available quantity");
      }
    } else {
      setQuantity((quantity <= product.product_qty && quantity >= 1) ? quantity : product.product_qty);
      setError(null);
      if(quantity > product.product_qty) {
        setError("Quantity is more than available quantity");
      } else {
        setError(null);
      }
    }
  };
  const addToCart = () => {
    if (!isIncludeCard()) {
      const item = {...product, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcategory.split('-').join(' '))};
      item.quantity = quantity;
      setCartProducts((pre) => [...pre, item]);
      document
      .getElementById("cartDrawerOverlay")
      .classList.add("page-overlay_visible");
      document.getElementById("cartDrawer").classList.add("aside_visible");
    }
  };

  function cleanProductName(productName) {
    // Step 1: Remove any non-alphanumeric characters except for spaces
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, '') + ' Description';
  
    // Step 2: Words to remove
    const wordsToRemove = ['&', ' &', '& ', ' & ', 'amp', ' amp', 'amp ', ' amp ', ';', ' ;', '; ', ' ; '];
  
    // Step 3: Remove the words from the dynamic key (case insensitive)
    let cleanString = dynamicKey;
    wordsToRemove.forEach(word => {
      const regex = new RegExp(word, 'gi'); // 'gi' for global and case-insensitive replacement
      cleanString = cleanString.replace(regex, '');
    });
  
    // Step 4: Replace multiple spaces with a single space
    cleanString = cleanString.replace(/\s+/g, ' ').trim(); // Trim to remove leading/trailing spaces
  
    return cleanString;
  }

  function capitalizeEachWord(str) {
    return str.split(' ') // Split the sentence into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
              .join(' '); // Join the words back into a sentence
  }

  const price = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}{ currency.symbol }</span></>;
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(2)}{ currency.symbol }</span></>;
    } else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  return (
    <>
      {Object.keys(product).length > 0 ? <><section className="product-single container product-single__type-9">
        <div className="row">
          <div className="col-lg-7">
            <Slider4 product={ product }/>
          </div>
          <div className="col-lg-5">
            <div className="d-flex justify-content-between mb-4 pb-md-2">
              <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
                <BreadCumbWithoutTrans category={ category } subcategory={ subcategory }/>
              </div>
              {/* <!-- /.breadcrumb --> */}
            </div>
            <h1 className="product-single__name">{product?.product_name && he.decode(product?.product_name)}</h1>
            <div className="product-single__price">
              { price(product) }
            </div>
            <div className="product-single__short-desc">
              <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
            </div>
            <h6 style={{ color: "red" }}>{error && error}</h6>
            <form onSubmit={(e) => e.preventDefault()}>
              {product.product_qty > 0 &&
              <div className="product-single__addtocart">
                <div className="qty-control position-relative">
                  <input
                    type="number"
                    name="quantity"
                    value={
                      isIncludeCard() ? isIncludeCard().quantity : quantity
                    }
                    min="1"
                    onChange={(e) =>
                      setQuantityCartItem(product.product_id, e.target.value)
                    }
                    className="qty-control__number text-center"
                    readOnly
                  />
                  <div
                    onClick={() =>
                      setQuantityCartItem(
                        product.product_id,
                        isIncludeCard()?.quantity - 1 || quantity - 1
                      )
                    }
                    className="qty-control__reduce"
                  >
                    -
                  </div>
                  <div
                    onClick={() =>
                      setQuantityCartItem(
                        product.product_id,
                        isIncludeCard()?.quantity + 1 || quantity + 1
                      )
                    }
                    className="qty-control__increase"
                  >
                    +
                  </div>
                </div>
                {/* <!-- .qty-control --> */}
                <button
                  type="submit"
                  className="btn btn-primary btn-addtocart js-open-aside"
                  onClick={() => addToCart()}
                >
                  {isIncludeCard() ? "Already Added" : "Add to Cart"}
                </button>
              </div>
              }
            </form>
            <div className="product-single__addtolinks">
              <ShareComponentWithoutTrans title={product.product_name} />
            </div>
            <div className="product-single__meta-info">
              {/* <div className="meta-item">
                <label>SKU:</label>
                <span> {product.sku && product.sku}</span>
              </div> */}
              <div className="meta-item">
                <label>Estimated delivery:</label>
                <span> 3 to 5 days</span>
              </div>
              <div className="meta-item">
                <label>Categories: </label>
                <span>{ capitalizeEachWord(category.split('-').join(' ')) }, { capitalizeEachWord(subcategory.split('-').join(' ')) }</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-single product-single__type-9 bg-dark text-white d-flex align-items-center justify-content-center p-5">
        <div className="product-single__details-list">
          <h2 className="product-single__details-list__title text-white">
            Description
          </h2>
          <div className="product-single__details-list__content text-white">
            <DescriptionWithoutTrans product_name={ product.product_name }/>
          </div>
          <h2 className="product-single__details-list__title text-white">
            Fragrance Notes
          </h2>
          <div className="product-single__details-list__content text-white">
            <AdditionalInfoWithoutTrans product_name={ product.product_name } video={ product.video && JSON.parse(product.video)[0][0].value } title={ product.video[0][1] && JSON.parse(product.video)[0][1].value }/>
          </div>
        </div>
      </section></> : <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Product Found</h2>}
    </>
  );
}
