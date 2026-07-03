"use client";

import { allProducts } from "@/data/products";
import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { useMenu } from './MenuContext';

const dataContext = createContext();
export const useContextElement = () => useContext(dataContext);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const existingProduct = state.products.find(
        (p) =>
          p.product_id === action.payload.product_id &&
          p.campaign === action.payload.campaign
      );

      let updatedProducts;

      if (existingProduct) {
        updatedProducts = state.products.map((p) =>
          p.product_id === action.payload.product_id &&
          p.campaign === action.payload.campaign
            ? { ...p, quantity: (p.quantity || 0) + (action.payload.quantity || 1) }
            : p
        );

        return {
          ...state,
          products: updatedProducts,
          isProcessing: false,
        };
      }

      updatedProducts = [
        ...state.products,
        { ...action.payload, quantity: action.payload.quantity || 1 },
      ];

      return {
        ...state,
        products: updatedProducts,
        isProcessing: false,
      };
    }
    case 'UPDATE_CART':
      return {
        ...state,
        products: action.payload,
        isProcessing: false,
      };
    case 'REMOVE_GIFT':
      return {
        ...state,
        products: state.products.filter(
          (p) =>
            !p.is_gift ||
            (action.payload.productId && p.product_id !== action.payload.productId) ||
            (action.payload.campaign && p.campaign !== action.payload.campaign)
        ),
        isProcessing: false,
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.product_id !== action.payload.productId),
        isProcessing: false,
      };
    case 'SET_PRODUCTS':
      const newProducts = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, products: newProducts, isProcessing: false };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    default:
      return state;
  }
};

export default function Context({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    products: [],
    isProcessing: false,
  });
  
  const [wishList, setWishList] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [freeShippingFlag, setFreeShippingFlag] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [couponDataContext, setCouponDataContext] = useState(null);

  const [promotionsContext, setPromotionsContext] = useState([]);

  const { shippingServiceCharges } = useMenu() ;

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartList"));
      if (Array.isArray(items)) {
        dispatch({ type: 'SET_PRODUCTS', payload: items });
      } else {
        dispatch({ type: 'SET_PRODUCTS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(state.products));
  }, [state.products]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("wishlist")) || [];
      if (Array.isArray(items)) {
        setWishList(items);
      }
    } catch (error) {
      setWishList([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

  useEffect(() => {
    const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    
    const isCustomerCoupon = couponDataContext && couponDataContext.type === "customer";
    const isCustomerCouponActive = isCustomerCoupon && (!couponDataContext.start_date || !couponDataContext.end_date || (new Date(current_date_time) >= new Date(couponDataContext.start_date) && new Date(current_date_time) <= new Date(couponDataContext.end_date)));
    
    const subtotal = state.products.reduce((accumulator, product) => {
      const qty = Number(product?.quantity || 0);
      const basePrice = Number(product?.price || 0);

      // Skip free gifts entirely
      if (product?.is_gift) return accumulator;

      if (product?.discount) {
        let discounted = basePrice;
        if (
          new Date(current_date_time) >= new Date(product.discount.start_date) &&
          new Date(current_date_time) <= new Date(product.discount.end_date)
        ) {
          if (product.discount.discount_type === 'percent') {
              discounted = basePrice - (basePrice * Number(product.discount.value || 0)) / 100;
          } else if (product.discount.discount_type === 'amount') {
              discounted = Number(product.discount.final_price || 0);
          }
          return accumulator + qty * Number(discounted.toFixed(2));
        }
      }

      // Customer/global coupon (apply across all products)
      if (isCustomerCouponActive && !product.discount && !promotionsContext.some((promo) => promo.buy_products.some((item) => item.product_id === product.product_id))) {
        const value = Number(couponDataContext?.value || 0);
        let discounted = basePrice; 

        if (couponDataContext.coupon_type === "percent") {
          discounted = basePrice - (basePrice * value) / 100;
        } else if (couponDataContext.coupon_type === "amount") {
          discounted = basePrice - value;
        }

        return accumulator + qty * Number(discounted.toFixed(2));
      }

      // Default
      return accumulator + qty * basePrice;
    }, 0);

    setTotalPrice(subtotal);
    
    // Free shipping threshold adapted for KSA
    const freeShippingThreshold = shippingServiceCharges?.[3]?.price ?? 300;
    setFreeShippingFlag(Number(subtotal.toFixed(2)) >= freeShippingThreshold);
  }, [state.products, couponDataContext, shippingServiceCharges]);

  const addProductToCart = (product) => {
    if (state.isProcessing) return;

    const cartProducts = [...state.products];

    // DYNAMIC MAX QUANTITY LOGIC
    const MAX_LIMIT =
      product.maximum_order_quantity && product.maximum_order_quantity > 0
        ? product.maximum_order_quantity
        : product.product_qty; 

    const existingItemIndex = cartProducts.findIndex(
      (p) => p.product_id === product.product_id
    );

    if (existingItemIndex !== -1 && !product.is_gift) {
      const currentQty = cartProducts[existingItemIndex].quantity || 1;

      if (currentQty >= MAX_LIMIT) {
        alert(`You cannot add more than ${MAX_LIMIT} of this product.`);
        return;
      }

      cartProducts[existingItemIndex].quantity = Math.min(currentQty + 1, MAX_LIMIT);
      dispatch({ type: 'UPDATE_CART', payload: cartProducts });
      
      // Open cart drawer (unless caller requested silent mode)
      if (!product._silent) {
        document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
        document.getElementById("cartDrawer")?.classList.add("aside_visible");
      }
      return;
    }

    product.quantity = product.quantity || 1;

    if (product.quantity > MAX_LIMIT) {
      alert(`You cannot add more than ${MAX_LIMIT} of this product.`);
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({
      type: 'ADD_PRODUCT',
      payload: product
    });

    // Open cart drawer (unless caller requested silent mode)
    if (!product._silent) {
      document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
      document.getElementById("cartDrawer")?.classList.add("aside_visible");
    }
  };

  const removeGiftFromCart = (productId = null, campaign = null) => {
    if (state.isProcessing) return;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'REMOVE_GIFT', payload: { productId, campaign } });
  };

  const removeProduct = (productId) => {
    if (state.isProcessing) return;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'REMOVE_PRODUCT', payload: { productId } });
  };

  const setCartProducts = (productsOrFn) => {
    let newProducts = [];

    if (typeof productsOrFn === 'function') {
      newProducts = productsOrFn(state.products);
    } else {
      newProducts = productsOrFn;
    }

    if (!Array.isArray(newProducts)) return;

    dispatch({ type: 'SET_PRODUCTS', payload: newProducts });
  };

  const addProductToQuickView = (product) => {
    setQuickViewItem(product);
  };

  const isAddedToCartProducts = (id) => {
    return state.products.some((elm) => elm.product_id === id);
  };

  const toggleWishlist = (id) => {
    setWishList((prev) => prev.includes(id) ? prev.filter((elm) => elm !== id) : [...prev, id]);
  };

  const isAddedtoWishlist = (id) => {
    return wishList.includes(id);
  };

  const contextElement = {
    cartProducts: state.products,
    setCartProducts,
    totalPrice,
    addProductToCart,
    removeProduct,
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