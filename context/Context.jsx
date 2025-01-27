"use client";
import { allProducts } from "@/data/products";
import React, { useEffect } from "react";
import { useContext, useState } from "react";
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

  useEffect(() => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    const subtotal = cartProducts.reduce((accumulator, product) => {
      if(product?.discount) {
        if(new Date(current_date_time) >= new Date(product.discount.start_date) && new Date(current_date_time) <= new Date(product.discount.end_date)) {
          const discount_price = (product.price - (product.price / 100 * product.discount.value)).toFixed(2);
          return accumulator + product.quantity * discount_price;
        }
      } else if(product?.coupon && couponDataContext != null) {
        if(new Date(current_date_time) >= new Date(product.coupon.start_date) && new Date(current_date_time) <= new Date(product.coupon.end_date)) {
          const coupon_price = (product.price - (product.price / 100 * product.coupon.value)).toFixed(2);
          return accumulator + product.quantity * coupon_price;
        }
      } else if(product?.sale_price) {
        const sale_price = (product.price - (product.price / 100 * product.sale_price)).toFixed(2);
        return accumulator + product.quantity * sale_price;
      }
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
    setFreeShippingFlag((subtotal).toFixed(2) >= 400 ? true : false);
  }, [cartProducts, couponDataContext]);

  const addProductToQuickView = (product) => {
    setQuickViewItem(product);
  };

  const addProductToCart = (product) => {
    const item = {
      ...product,
      quantity: 1,
    };
    setCartProducts((prevCart) => [...prevCart, item]);

    document
      .getElementById("cartDrawerOverlay")
      .classList.add("page-overlay_visible");
    document.getElementById("cartDrawer").classList.add("aside_visible");
  };
  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.product_id == id)[0]) {
      return true;
    }
    return false;
  };

  const toggleWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    } else {
      setWishList((pre) => [...pre, id]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
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
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

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
    addProductToQuickView,
    freeShippingFlag,
    setOrderDetails,
    orderDetails,
    setCouponDataContext
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
