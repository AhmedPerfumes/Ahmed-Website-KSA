"use client";
import React, { useState, useEffect } from "react";
import Slider4 from "./sliders/Slider4";
import BreadCumb from "./BreadCumb";
import Star from "../common/Star";
import Size from "./Size";
import Description from "./Description";
import AdditionalInfo from "./AdditionalInfo";
import Reviews from "./Reviews";
import Clolor2 from "./Clolor2";
import ShareComponent from "../common/ShareComponent";
import { useContextElement } from "@/context/Context";
import he from 'he';
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from '@/context/MenuContext';
import TamaraWidget from "../TamaraWidget";
import ProductInfoTabs from "./New/ProductInfoTabs/ProductInfoTabs";
import ItemFamilySlider from "./New/ItemFamilySlider";
import Base from "./New/base";

export default function SingleProduct11({ category, subcategory, product: initialProduct }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { cartProducts, setCartProducts } = useContextElement();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const locale = useLocale();
  const t = useTranslations();
  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    if (initialProduct?.product_id !== product?.product_id) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (product && product.product_id && typeof window !== "undefined" && window.AhmedTracker) {
      window.AhmedTracker.track("view_item", {
        product_id: product.product_id,
        product_name: product.product_name ? he.decode(product.product_name) : "",
        price: parseFloat(product.sale_price || product.price || 0),
        category: category || "",
      });
    }
  }, [product?.product_id]);

  useEffect(() => {
    const fetchLiveStatus = async () => {
      if (!initialProduct?.product_id) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/live-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_ids: [initialProduct.product_id] }),
        });

        if (!response.ok) return;

        const liveData = await response.json();

        // If we got data back for this ID
        if (Array.isArray(liveData) && liveData.length > 0) {
          const liveItem = liveData[0];
          setProduct(prev => ({
            ...prev,
            product_qty: liveItem.product_qty,
            price: liveItem.price,
            sale_price: liveItem.sale_price,
            discount: liveItem.discount,
            maximum_order_quantity: liveItem.maximum_order_quantity
          }));
        }
      } catch (err) {
        console.error("Live product hydration failed", err);
      }
    };

    fetchLiveStatus();
  }, [initialProduct?.product_id]);

  const isIncludeCard = () => {
    const item = cartProducts.filter((elm) => elm.product_id == product.product_id)[0];
    return item;
  };
  // const setQuantityCartItem = (id, quantity) => {
  //   if (isIncludeCard()) {
  //     if (quantity >= 1 && quantity <= product.product_qty) {
  //       setError(null);
  //       const item = cartProducts.filter((elm) => elm.product_id == id)[0];
  //       const items = [...cartProducts];
  //       const itemIndex = items.indexOf(item);
  //       item.quantity = quantity;
  //       items[itemIndex] = item;
  //       setCartProducts(items);
  //     } else {
  //       setError("Quantity is more than available quantity");
  //     }
  //   } else {
  //     setQuantity((quantity <= product.product_qty && quantity >= 1) ? quantity : product.product_qty);
  //     setError(null);
  //     if(quantity > product.product_qty) {
  //       setError("Quantity is more than available quantity");
  //     } else {
  //       setError(null);
  //     }
  //   }
  // };

  const setQuantityCartItem = (id, quantity, maxOrderQty) => {
    const qty = Number(quantity);
    const stock = Number(product.product_qty);
    const maxOrder = Number(maxOrderQty);

    const limit = (maxOrder && maxOrder > 0) ? maxOrder : stock;
    const isValid = qty <= stock && qty <= limit;

    if (isIncludeCard()) {
      if (isValid) {
        setError(null);
        const items = [...cartProducts];
        const itemIndex = items.findIndex((elm) => elm.product_id == id);

        if (itemIndex !== -1) {
          items[itemIndex] = { ...items[itemIndex], quantity, };
        }

        setCartProducts(items);
      } else {
        // FAILURE: Show specific error
        const errorMsg = qty > stock ? "Quantity is more than available quantity" : `Maximum allowed quantity is ${limit}`;
        setError(errorMsg);
      }
    } else {
      if (isValid) {
        setQuantity(qty);
        setError(null); // Clear error if valid
      } else {
        // Cap the value to the max allowed so user doesn't get stuck
        const errorMsg = qty > stock ? "Quantity is more than available quantity" : `Maximum allowed quantity is ${limit}`;
        setError(errorMsg);
      }
    }
  }

  const addToCart = () => {
    if (!isIncludeCard()) {
      const item = { ...product, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcategory.split('-').join(' ')) };
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
    if (elm?.discount) {
      if (new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        if (elm.discount.discount_type == "percent") {
          return <><span className="money price price-old">{currency.symbol}{elm?.price}</span> <span className="money price price-sale"> {currency.symbol}{(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}</span></>;
        } else if (elm.discount.discount_type == "amount") {
          return <><span className="money price price-old">{currency.symbol}{elm?.price}</span> <span className="money price price-sale"> {currency.symbol}{(elm.price - elm.discount.value).toFixed(2)}</span></>;
        }
        // return <><span className="money price price-old">{ currency.symbol }{elm?.price}</span> <span className="money price price-sale"> { currency.symbol }{(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}</span></>;
      } else {
        return <span className="money price">{elm?.price}{currency.symbol}</span>;
      }
      // }  else if(elm?.sale_price) {
      //   return <><span className="money price price-sale">{ currency.symbol }{(elm.sale_price).toFixed(2)}</span><span className="money price price-old">{ currency.symbol }{elm?.price}</span> </>;
    }
    else {
      return <span className="money price">{elm?.price}{currency.symbol}</span>;
    }
  };

  const tabbyPrice = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if (elm?.discount) {
      if (new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return (elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2);
      } else {
        return elm?.price;
      }
    } else if (elm?.sale_price) {
      return (elm.price - (elm.price / 100 * elm.sale_price)).toFixed(2);
    } else {
      return elm?.price;
    }
  };

  useEffect(() => {
    // Load the TabbyPromo script
    const tabbyPromoScript = document.createElement("script");
    tabbyPromoScript.src = "https://checkout.tabby.ai/tabby-promo.js";
    tabbyPromoScript.async = true;
    document.body.appendChild(tabbyPromoScript);

    tabbyPromoScript.onload = () => {
      new window.TabbyPromo({
        selector: '#TabbyPromo', // required, content of tabby Promo Snippet will be placed in element with that selector.
        currency: 'SAR', // required, AED|SAR|KWD only supported, with no spaces or lowercase.
        price: tabbyPrice(product), // required, price of the product. 2 decimals max for AED|SAR and 3 decimals max for KWD.
        lang: 'en', // Optional, en|ar only supported
        source: 'product', // Optional, snippet placement; `product` for product page and `cart` for cart page.
        publicKey: 'pk_test_019228fd-8e52-3ecd-f813-bf11dc8e2118', // required, Public Key
        merchantCode: 'assaaste'  // required
      });
    };

    return () => {
      document.body.removeChild(tabbyPromoScript);
    };
  }, []);

  return (
    <>
      {Object.keys(product).length > 0 ?
        <>

          {/* <section className="product-single container product-single__type-9">
          <div className="row">
            <div className="col-lg-7">
              <Slider4 product={ product }/>
            </div>
            <div className="col-lg-5">
              <div className="d-flex justify-content-between mb-4 pb-md-2">
                <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
                  <BreadCumb category={ category } subcategory={ subcategory }/>
                </div>
              </div>
              <h1 className="product-single__name">{product?.product_name && t(he.decode(product?.product_name))}</h1>
              <div className="product-single__price">
                { price(product) }
              </div>
              <div className="product-single__short-desc">
                <div dangerouslySetInnerHTML={{ __html: t.raw(cleanProductName(product.product_name)) }}></div>
              </div>
              <div id="TabbyPromo" className="mb-2"></div>
              <TamaraWidget inlineType="6" inlineVariant='outlined' locale={locale}/>
              <h6 style={{ color: "red" }}>{error && error}</h6>
              <form onSubmit={(e) => e.preventDefault()}>
                {product.product_qty > 0 ? (
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
                        setQuantityCartItem(product.product_id, e.target.value, product?.maximum_order_quantity)
                      }
                      className="qty-control__number text-center"
                      readOnly
                    />
                    <div
                      onClick={() =>
                        setQuantityCartItem(
                          product.product_id,
                          isIncludeCard()?.quantity - 1 || quantity - 1,
                          product?.maximum_order_quantity
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
                          isIncludeCard()?.quantity + 1 || quantity + 1,
                          product?.maximum_order_quantity
                        )
                      }
                      className="qty-control__increase"
                    >
                      +
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-addtocart js-open-aside"
                    onClick={() => addToCart()}
                  >
                    {isIncludeCard() ? t("Already Added") : t("Add to Cart")}
                  </button>
                </div>
                ):(
                <div className="out-of-stock">
    <span className="badge fs-5 text-uppercase">Out of Stock</span>
    <p className="text-red mt-2">
      This product is currently unavailable.
    </p>
  
  </div>
                )}
              </form>
              <div className="product-single__addtolinks">
                <ShareComponent title={product.product_name} />
              </div>
              <div className="product-single__meta-info">
                <div className="meta-item">
                  <label>{t("Estimated delivery:")}</label>
                  <span> {t("3 to 5 days")}</span>
                </div>
                <div className="meta-item">
                  <label>{t("Categories")}: </label>
                  <span>{ t(capitalizeEachWord(category.split('-').join(' '))) }, { t(capitalizeEachWord(subcategory.split('-').join(' '))) }</span>
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
              <Description product_name={ product.product_name }/>
            </div>
            <h2 className="product-single__details-list__title text-white">
            {category === "gift-sets" ? "Gift Set Contains" : "Fragrance Notes"}
            </h2>
            <div className="product-single__details-list__content text-white">
              <AdditionalInfo product_name={ product.product_name } video={ product.video && JSON.parse(product.video)[0][0].value } title={ product.video[0][1] && JSON.parse(product.video)[0][1].value }/>
            </div>
          </div>
        </section> */}
          <div style={{ backgroundColor: "#FAF9F7" }} >
            <Base product={{ ...product, category, subcategory }} />
          </div>
          <div style={{ backgroundColor: "#121212" }}>
            <ProductInfoTabs product={product} category={category} subcategory={subcategory} />
          </div>
          <ItemFamilySlider product={product} itemFamilyProds={product.item_family} />
        </> : <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Product Found</h2>
      }
    </>
  );
}
