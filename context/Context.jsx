"use client";
import { allProducts } from "@/data/products";
import React, { useEffect, useContext, useState } from "react";

const dataContext = React.createContext();

export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [freeShippingFlag, setFreeShippingFlag] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [couponDataContext, setCouponDataContext] = useState(null);

  // --- ADDED FOR FREE GIFT FEATURE ---
  const [promotionsContext, setPromotionsContext] = useState([]); 

  useEffect(() => {
    const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");

    const subtotal = cartProducts.reduce((accumulator, product) => {
      let finalPrice = parseFloat(product.price);

      if (product.is_gift) {
        return accumulator; 
      }

      if(product?.discount) {
        if(new Date(current_date_time) >= new Date(product.discount.start_date) && new Date(current_date_time) <= new Date(product.discount.end_date)) {
          if(product.discount.discount_type == 'percent') {
            const discount_price = (product.price - (product.price / 100 * product.discount.value)).toFixed(2);
            return accumulator + product.quantity * discount_price;
          } else if(product.discount.discount_type == 'amount') {
            const discount_price = (product.price - product.discount.value).toFixed(2);
            return accumulator + product.quantity * discount_price;
          }
        }
      }
      else if (product.is_coupon && couponDataContext != null) {
        if (couponDataContext.coupon_type === 'percent') {
          finalPrice = product.price - (product.price / 100 * couponDataContext.value);
        } else if (couponDataContext.coupon_type === 'amount') {
          finalPrice = product.price - (couponDataContext.value / product.quantity);
        }
      }

      return accumulator + (product.quantity * finalPrice);
    }, 0);

    setTotalPrice(subtotal);
    setFreeShippingFlag(subtotal >= 300); 

  }, [cartProducts, couponDataContext]);

  const addProductToCart = (product) => {
    const item = {
      ...product,
      quantity: 1,
    };
    setCartProducts((prevCart) => [...prevCart, item]);

    document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
    document.getElementById("cartDrawer")?.classList.add("aside_visible");
  };

  const isAddedToCartProducts = (id) => {
    return cartProducts.some((elm) => elm.product_id == id);
  };

  const toggleWishlist = (id) => {
    setWishList((prev) => prev.includes(id) ? prev.filter((elm) => elm != id) : [...prev, id]);
  };

  const isAddedtoWishlist = (id) => {
    return wishList.includes(id);
  };

  useEffect(() => {
    const items = localStorage.getItem("cartList") && JSON.parse(localStorage.getItem("cartList"));
    if (items?.length) {
      setCartProducts(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);

  // --- UPDATED REMOVE GIFT LOGIC ---
  const removeGiftFromCart = (productId = null, campaign = null) => {
    setCartProducts((prevCart) => 
      prevCart.filter((item) => {
        // If it's not a gift, keep it
        if (!item.is_gift) return true;
        // If campaign is provided, remove only gifts from that campaign
        if (campaign && item.campaign === campaign) return false;
        // If specific product ID is provided, remove it
        if (productId && item.product_id === productId) return false;
        // Default: remove all gifts if no params provided
        if (!productId && !campaign) return false;
        return true;
      })
    );
  };

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    toggleWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    addProductToQuickView: (product) => setQuickViewItem(product),
    freeShippingFlag,
    setOrderDetails,
    orderDetails,
    couponDataContext,
    setCouponDataContext,
    removeGiftFromCart,
    // --- ADDED THESE EXPORTS ---
    promotionsContext,
    setPromotionsContext
  };

  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}