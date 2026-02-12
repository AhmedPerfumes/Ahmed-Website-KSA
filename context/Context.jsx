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
  const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
   const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
  const [ couponDataContext, setCouponDataContext] = useState(null);
  const isCustomerCoupon = couponDataContext && couponDataContext.type === "customer";
  const isCustomerCouponActive = isCustomerCoupon && (!couponDataContext.start_date || !couponDataContext.end_date || (new Date(current_date_time) >= new Date(couponDataContext.start_date) && new Date(current_date_time) <= new Date(couponDataContext.end_date)));
    const [promotionsContext, setPromotionsContext] = useState([]);
 

  // useEffect(() => {
  //   const currentUTC = new Date(); // Current UTC time
  //   const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
  //   const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
  //   const subtotal = cartProducts.reduce((accumulator, product) => {
  //     if(product?.discount) {
  //       if(new Date(current_date_time) >= new Date(product.discount.start_date) && new Date(current_date_time) <= new Date(product.discount.end_date)) {
  //         const discount_price = (product.price - (product.price / 100 * product.discount.value)).toFixed(2);
  //         return accumulator + product.quantity * discount_price;
  //       }
  //     } else if(product?.sale_price) {
  //       const sale_price = (product.sale_price).toFixed(2);
  //       return accumulator + product.quantity * sale_price;
  //     } else if(product?.coupon && !Array.isArray(product.coupon) && couponDataContext != null) {
  //       if(new Date(current_date_time) >= new Date(product.coupon[couponDataContext?.code?.toLowerCase()]?.start_date) && new Date(current_date_time) <= new Date(product.coupon[couponDataContext?.code?.toLowerCase()]?.end_date) && product.coupon[couponDataContext?.code?.toLowerCase()]?.code == couponDataContext?.code?.toLowerCase()) {
  //         const coupon_price = (product.price - (product.price / 100 * product.coupon[couponDataContext?.code?.toLowerCase()]?.value)).toFixed(2);
  //         return accumulator + product.quantity * coupon_price;
  //       }
  //     }
  //     return accumulator + product.quantity * product.price;
  //   }, 0);
  //   setTotalPrice(subtotal);
  //   setFreeShippingFlag((subtotal).toFixed(2) >= 300 ? true : false);
  // }, [cartProducts, couponDataContext]);

  useEffect(() => {
  const currentUTC = new Date();
  const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
  const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");

  const subtotal = cartProducts.reduce((accumulator, product) => {
    // Ensure all prices are numbers, not strings
    const basePrice = Number(product?.price || 0);
    const qty = Number(product?.quantity || 0);
    let finalPrice = parseFloat(product.price);

    if (product.is_gift) {
      return accumulator; // Free gifts add 0 to the total
    }

    // 1. Check for active discounts
    // (This matches your KSA file's discount logic, which only handles percent)
    if (product?.discount) {
      if (
        new Date(current_date_time) >= new Date(product.discount.start_date) &&
        new Date(current_date_time) <= new Date(product.discount.end_date)
      ) {
        finalPrice = product.price - (product.price / 100 * product.discount.value);
      }
    }
     if (isCustomerCouponActive && !product.discount && !promotionsContext.some((promo) => promo.buy_products.some((item) => item.product_id === product.product_id)))
      {
        console.log('customer couponC', product, isCustomerCouponActive, couponDataContext);
        const value = Number(couponDataContext?.value || 0);
        let discounted = basePrice; // fallback if no discount

        if (couponDataContext.coupon_type === "percent") {
          discounted = basePrice - (basePrice * value) / 100;
        } else if (couponDataContext.coupon_type === "amount") {
          discounted = basePrice - value;
        }

        return accumulator + qty * Number(discounted.toFixed(2));
      }
    
    // 2. Check for sale price (if no discount)
    else if (product?.sale_price) {
      finalPrice = parseFloat(product.sale_price);
    } 
    
    // 3. Check for applied coupon (if no discount and no sale price)
    // This uses the NEW logic
    // else if (product.is_coupon && couponDataContext != null) {
    //   if (couponDataContext.coupon_type === 'percent') {
    //     finalPrice = product.price - (product.price / 100 * couponDataContext.value);
    //   } else if (couponDataContext.coupon_type === 'amount') {
    //     // Assumes value is the total discount, not per-unit, so we divide by quantity
    //     // If this is wrong, use: finalPrice = product.price - couponDataContext.value;
    //     finalPrice = product.price - (couponDataContext.value / product.quantity);
    //   }
    // }

    // Add the calculated price * quantity to the total
    return accumulator + (product.quantity * finalPrice);
  }, 0);

  setTotalPrice(subtotal);
  setFreeShippingFlag(subtotal >= 300); // No need for .toFixed() in a boolean check

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

  const removeGiftFromCart = () => {
    const updatedCart = cartProducts.filter((item) => !item.is_gift);
    setCartProducts(updatedCart);
    localStorage.setItem('cartList', JSON.stringify(updatedCart));
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
    addProductToQuickView,
    freeShippingFlag,
    setOrderDetails,
    orderDetails,
    couponDataContext,
    setCouponDataContext,
    removeGiftFromCart,
    promotionsContext,
    setPromotionsContext
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
