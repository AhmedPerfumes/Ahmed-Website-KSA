"use client";

import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { useMenu } from '@/context/MenuContext';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import he from 'he';
import { products1 } from "@/data/products/fashion";
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from "next-intl";
import Pagination1 from "../common/Pagination1";
import TamaraWidget from "@/components/TamaraWidget";
import FreeGiftFeature from '@/components/FreeGiftFeature';
import BogoFeature from "@/components/BogoFeature";
// import { bogoProducts } from "@/components/BogoFeature";

export default function Checkout() {
  // STATES
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [idDDActive, setIdDDActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState('cod');
  const [createAccount, setCreateAccount] = useState(false);
  const [finalPriceState, setFinalPriceState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [OTPError, setOTPError] = useState(null);
  const [OTPSuccess, setOTPSuccess] = useState(null);
  const [isSendOTPLoading, setIsSendOTPLoading] = useState(false);
  const [isOTPButton, setIsOTPButton] = useState(true);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [formData, setFormData] = useState({
    shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', province: '' },
    billingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', province: '', short_national_address: '' },
    shippingAdd: false,
    note: '',
    password: '',
    otp: ''
  });
  // const [selectedRegion, setSelectedRegion] = useState("");
  // const [shippingAdd, setShippingAdd] = useState(false);

  // CONTEXT & HOOKS
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext, setCartProducts } = useContextElement();
  const router = useRouter();
  const locale = useLocale();
  const { isLoggedIn } = useUser();
  const hasCleaned = useRef(false);
  const hasFetchedRef = useRef(false);
  const searchParams = useSearchParams();
  const disablePlaceOrder = isLoading || (!isLoggedIn && !isOTPVerified) || (isLoggedIn && formData.shippingAdd && !isOTPVerified); 
  const t = useTranslations();
  
  // USE EFFECTS

  useEffect(() => {
      if (isLoggedIn) {
        let customer_id = -1;
        let firstName = "";
        let lastName = "";
        let email = "";
        let mobile = "";
        let area = "";
        let building = "";
        let province = "";
        let short_national_address = "";
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(atob(userStr));
          email = user.email || "";
          mobile = user.phone || user.mobile || "";
          customer_id = user.id || -1;

          if (user.name) {
            const [f, ...lArr] = user.name.split(" ");
            firstName = f || "";
            lastName = lArr.join(" ") || "";
          }
        }

        const addrStr = localStorage.getItem("address");
        if (addrStr) {
          const addr = JSON.parse(atob(addrStr));
          area = addr.city || "";
          building = addr.address || "";
          province = addr.state || "";
          short_national_address = addr.short_national_address || "";
        }

        setFormData((prev) => ({ 
          ...prev, 
          billingAddress: { ...prev.billingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, province, short_national_address}, 
          shippingAddress: { ...prev.shippingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, province }, }));
      }

      // setCouponLoading(true);
      // fetch(`${process.env.NEXT_PUBLIC_API_URL}api/customerCouponDetails`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ customer_id }),
      // })
      //   .then((res) => {
      //     if (!res.ok) {
      //       throw new Error(`HTTP error! Status: ${res.status}`);
      //     }
      //     return res.json();
      //   })
      //   .then((json) => {
      //     console.log("Coupon API response:", json);
      //     setCoupons(json.coupons || []);
      //     setCouponDataContext(json.coupons || []);
      //   })
      //   .catch((err) => {
      //     console.error("Failed to fetch coupons:", err);
      //     setCoupons([]);
      //     setCouponDataContext([]);
      //   })
      //   .finally(() => setCouponLoading(false));
  }, [isLoggedIn]);

  // NEW: useEffect to fetch coupons from SmartView API
  useEffect(() => {
    const { mobile, email } = formData.billingAddress;
    if (hasFetchedRef.current) return;
    if (!/^\d{10}$/.test(mobile)) return;
    hasFetchedRef.current = true;

    const transformCouponData = (apiCoupons) => {
      if (!Array.isArray(apiCoupons)) { return []; }

      return apiCoupons.filter(coupon => coupon.active === true).map((coupon) => ({ id: coupon.couponCode, code: coupon.couponCode, title: coupon.promotionName, description: `Get ${coupon.value}${coupon.baseOn === "Percent" ? "%" : " SAR"} off`, value: coupon.value, coupon_type: coupon.baseOn ? coupon.baseOn.toLowerCase() : 'percent', type: "customer", end_date: coupon.validTo, start_date: coupon.registrationDate, couponRegistrationId: coupon.couponRegistrationId, couponId: coupon.couponId, salesType: coupon.salesType, company: coupon.company, whsCode: coupon.whsCode }));
    };

    const fetchCoupons = async () => {
      // const { email, mobile } = formData.billingAddress;
      if (!email || !/^\d{10}$/.test(mobile)) { setCoupons([]); return; }

      setCouponLoading(true);
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({ salesType: "EComm", company: "KSA", mobileNo: mobile, email: email, }),
        });

        if (!response.ok) { throw new Error(`API Error! Status: ${response.status}`); }

        const data = await response.json();
        const transformedData = transformCouponData(data.data);
        
        setCoupons(transformedData);
        // setCouponDataContext(transformedData); // This context is used by FreeGiftFeature

      } catch (err) {
        console.error("Failed to fetch coupons:", err);
        setCoupons([]);
      } finally {
        setCouponLoading(false);
      }
    };

    fetchCoupons();
    // This effect now runs when user details change in the form
  }, [formData.billingAddress.email, formData.billingAddress.mobile, setCouponDataContext]);

  useEffect(() => {
    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0]?.price) + totalPrice + parseFloat(shippingServiceCharges[1]?.price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1]?.price);
    setFinalPriceState(finalPrice);
  }, [selectedOption]);

  useEffect(() => {
    const tabbyCardScript = document.createElement("script");
    tabbyCardScript.src = "https://checkout.tabby.ai/tabby-card.js";
    tabbyCardScript.async = true;
    document.body.appendChild(tabbyCardScript);

    // Load the TabbyPromo script
    const tabbyPromoScript = document.createElement("script");
    tabbyPromoScript.src = "https://checkout.tabby.ai/tabby-promo.js";
    tabbyPromoScript.async = true;
    document.body.appendChild(tabbyPromoScript);

    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0]?.price) + totalPrice + parseFloat(shippingServiceCharges[1]?.price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1]?.price);

    tabbyCardScript.onload = () => {
      new window.TabbyCard({
        selector: "#tabbyCard", // empty div for TabbyCard.
        currency: "SAR", // required, AED|SAR|KWD only supported.
        lang: "en", // Optional, language of snippet and popups.
        price: finalPrice, // required, total cart amount.
        size: "wide", // required, narrow|wide supported.
        theme: "black", // required, black|default supported.
        header: true, // if a Payment method name is present already.
      });
    };

    tabbyPromoScript.onload = () => {
      new window.TabbyPromo({
        // You can add any necessary configuration for TabbyPromo here if needed
      });
    };

    return () => {
      document.body.removeChild(tabbyCardScript);
      document.body.removeChild(tabbyPromoScript);
    };
  }, [selectedOption]);

  useEffect(() => { setCouponDataContext(null); }, []);

  const handleRadioChange = (event) => { setSelectedOption(event.target.value); };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('shipping') || name.startsWith('billing')) {
      const addressField = name.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const fieldName = name.split('.')[1]; // Get the specific field (e.g., street, city)
      setFormData((prevData) => ({ ...prevData, [addressField]: { ...prevData[addressField], [fieldName]: value, }, }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value, }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => {
      const newSameAsShipping = !prevData.shippingAdd;
      return {
        ...prevData,
        shippingAdd: newSameAsShipping,
        shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', province: '' }
      }
    });
  };

  // const handleEmiratesChange = (event, emirates) => {
  //   const { id } = event.target;
  //   // console.log(id, emirates);
  //   if (id.startsWith('shipping') || id.startsWith('billing')) {
  //     const addressField = id.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
  //     const fieldName = id.split('.')[1]; // Get the specific field (e.g., street, city)
  //     setFormData((prevData) => {
  //       return {
  //         ...prevData,
  //         [addressField]: {
  //           ...prevData[addressField],
  //           [fieldName]: emirates,
  //         },
  //       };
  //     });
  //   }
  // };

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponSuccess(null);
    setCouponData(null);
    setCouponDataContext(null); // Clear coupon from context

    // Clean coupon data from cart products
    const cleanedCart = cartProducts.map((item) => {
      const { is_coupon, value, ...rest } = item;
      return rest;
    });
    setCartProducts(cleanedCart);
  };

  const handleSelectCoupon = async (code, id) => {
    setCouponData(null);
    setCouponCode(code);
    setCopiedId(id);
    setShowCouponModal(false);
    setTimeout(() => setCopiedId(null), 1400); // For "Applied!" message
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1400); // For "Copied!" message
  };

  const removeCoupon = (e) => {
    setCouponCode("");
    setCouponSuccess(null);
    setCouponData(null);
    setCouponDataContext(null); // Clear coupon from context

    // Clean coupon data from cart products
    const cleanedCart = cartProducts.map((item) => {
      const { is_coupon, value, ...rest } = item;
      return rest;
    });
    setCartProducts(cleanedCart);
  };

  const applyCoupon = async (e) => {
    e.preventDefault();

    const user = isLoggedIn ? JSON.parse(atob(localStorage.getItem("user"))) : null;
    const code = couponCode.toLowerCase();

    if (!couponCode.trim()) {
      setCouponError("Coupon Code is Required");
      return;
    }

    if (!isOTPVerified && !isLoggedIn) {
      setCouponError("Please verify your mobile number first.");
      return;
    }

    // Find all items eligible for a coupon
    const eligibleItems = cartProducts.filter((item) => {
      // Assuming BOGO/promotions are not yet in KSA, but adding this for future-proofing
      const isBogoProduct = false; // promotionsContext.some(...)
      return !item.discount && !isBogoProduct && !item.is_gift;
    });
    // const eligibleItems = cartProducts.filter((item) => {
    //   const isBogoProduct = promotionsContext.some((promo) => promo.buy_products.some((buyItem) => buyItem.product_id === item.product_id));
    //   return !item.discount && !isBogoProduct && !item.is_gift && !item.collection_name;
    // });

    if (eligibleItems.length === 0) {
      setCouponError("This coupon is not applicable to the items in your cart.");
      setCouponCode("");
      return;
    }

    // Find the coupon from the state (fetched from the new API)
    const validCoupon = coupons.find((c) => c.code.toLowerCase() === code);

    let payload = {
      company: "KSA", // <-- The required change for KSA
      salesType: "EComm",
      couponRegistrationId: validCoupon ? validCoupon.couponRegistrationId : 0,
      couponCode: validCoupon ? "" : couponCode.trim(),
      mobileNo: user?.phone || formData.billingAddress.mobile,
      email: user?.email || formData.billingAddress.email,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      setCouponError("Invalid or expired coupon code.");
      setCouponCode("");
      return;
    }

    const data = await res.json();
    let apiCoupon = data.data && data.data[0];

    // Normalize API coupon if it wasn't in our pre-fetched list
    if (apiCoupon && !validCoupon) {
      apiCoupon = { id: apiCoupon.couponCode, code: apiCoupon.couponCode, title: apiCoupon.promotionName, description: apiCoupon.promotionName, value: apiCoupon.value, coupon_type: apiCoupon.baseOn === "P" ? "percent" : "amount", type: "customer", end_date: apiCoupon.validTo, start_date: apiCoupon.registrationDate, couponRegistrationId: apiCoupon.couponRegistrationId, salesType: apiCoupon.salesType, company: apiCoupon.company, whsCode: apiCoupon.whsCode, };
    }

    const couponToApply = validCoupon || apiCoupon;

    if (!couponToApply) {
      setCouponError("Invalid or expired coupon code.");
      setCouponCode("");
      return;
    }

    // Apply coupon to eligible items by updating cart state
    const updatedCartProducts = cartProducts.map((item) => {
      const isBogoProduct = false; // promotionsContext.some(...)
      const isEligible = !item.discount && !isBogoProduct && !item.is_gift;
      return { ...item, ...(isEligible ? { is_coupon: true, value: couponToApply.value, coupon_type: couponToApply.coupon_type, } : {}), };
    });
    // const updatedCartProducts = cartProducts.map((item) => {
    //   const isBogoProduct = promotionsContext.some((promo) => promo.buy_products.some((buyItem) => buyItem.product_id === item.product_id));
    //   const isEligible = !item.discount && !isBogoProduct && !item.is_gift;
    //   return { ...item, ...(isEligible ? { is_coupon: true, value: couponToApply.value, coupon_type: couponToApply.coupon_type, } : {}), };
    // });

    setCartProducts(updatedCartProducts);
    setCouponError(null);
    setCouponData(couponToApply);
    setCouponDataContext(couponToApply); // Update context
    setCouponSuccess(`Applied Coupon: ${couponToApply.code} - ${couponToApply.title}`);
  };

  const subTotalPrice = (elm) => {
    if (elm.is_gift) { return <td>0.00{currency.symbol} (Free Gift)</td>; }
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    let itemPrice = elm.price;
     if ( elm?.discount && new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type == "percent") { itemPrice = elm.price - (elm.price / 100) * elm.discount.value; } 
      else if (elm.discount.discount_type == "amount") { itemPrice = elm.discount.final_price; }
      return (
        <td>
          <span className="money price price-sale"> {currency.symbol} {(itemPrice * elm.quantity).toFixed(2)} </span>
          <span className="money price price-old"> {currency.symbol} {(elm.price * elm.quantity).toFixed(2)} </span>
        </td>
      );
    }
    // else if(elm?.sale_price) {
    //   console.log('else if 2');
    //   return (
    //     <td>
    //       <span className="money price price-old">{currency.symbol}{elm?.price}</span>
    //       <span className="money price price-sale">{currency.symbol}{(elm.sale_price * elm.quantity).toFixed(2)}</span>
    //     </td>
    //   )
    // }
     else if (couponData && couponData.type === "customer" && elm.is_coupon) {
      if (couponData.coupon_type == "percent") { 
        itemPrice = elm.price - (elm.price / 100) * couponData.value;
      } else if (couponData.coupon_type == "amount") {
        itemPrice = elm.price - couponData.value;
      }
      return (
        <td>
          <span className="money price price-sale">{currency.symbol}{(itemPrice * elm.quantity).toFixed(2)}</span>
          <span className="money price price-old">{currency.symbol}{(elm.price * elm.quantity).toFixed(2)}</span>
        </td>
      );
    } else {
      return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    }
  };

  const isExpired = (end_date) => { return new Date(end_date) < new Date(); };

  const mapProductsFromFormData = (products) =>
    products.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      category_name: item.category_name,
      subcategory_name: item.subcategory_name,
      coupon: item.coupon,
      discount: item.discount,
      ...('is_coupon' in item && { is_coupon: item.is_coupon }),
      ...('is_gift' in item && { is_gift: item.is_gift }),
      ...('coupon_type' in item && { coupon_type: item.coupon_type }),
      ...('value' in item && { value: item.value }),
      ...('campaign' in item && { campaign: item.campaign }),
      ...('type' in item && { type: item.type }),
    }));
 
  async function onOrder(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);


    const short_national_address = formData.billingAddress.short_national_address?.trim();
    if (!/^[A-Za-z]{4}[0-9]{4}$/.test(short_national_address)) {
      setIsLoading(false);
      setError('Valid 8-digit Short National Address is required. Enter 4 letters followed by 4 numbers.');
      return;
    }

    const shippingPrice = freeShippingFlag ? 0.00 : parseFloat(shippingServiceCharges[0].price);
    const shippingPriceVat = shippingPrice / 100 * vatTax.percentage;
    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1].price);
    const servicePrice = shippingServiceCharges[1].price;
    const servicePriceVat = servicePrice / 100 * vatTax.percentage;

    let userJson = null;
    if(isLoggedIn) {
      const user = atob(localStorage.getItem('user'));
      userJson = JSON.parse(user);
    }

    const {
      shippingAdd,
      note,
      password,
      otp,
      ...cleanFormData
    } = formData;

    const additionalFields = { ...cleanFormData, products : mapProductsFromFormData(cartProducts), payment_method: selectedOption, shippingPrice, shippingPriceVat, servicePrice, servicePriceVat, vatTax: vatTax.percentage, totalPrice, finalPrice, customer_id: userJson ? userJson.id : null, locale, couponCode, couponData }
    const token = localStorage.getItem('token');
    // console.log('additionalFields', additionalFields);return;
    try {
      // const formDataa = new FormData(additionalFields);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`, {
        method: 'POST',
        body: JSON.stringify(additionalFields),
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
      })
 
      if (response.status === 401) {
        // Clear all authentication-related items
        if (localStorage.getItem('user')) {
          localStorage.removeItem('user');
        }
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
        }

        // If they were a guest user verified via OTP, they need to re-verify
        // If they were logged in, they need to re-login
        const errorMsg = isLoggedIn 
          ? 'Your session has expired. Please login again.' 
          : 'Mobile verification expired. Please verify your number again.';

        setError(errorMsg);

        setTimeout(() => {
          // Redirecting to the combined login/register/OTP page
          window.location.reload();
        }, 2000);

        return; // Stop execution
      }
      if (!response.ok) {
        setTimeout(() => {
          // localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
          // setCartProducts([]); // update the cartProducts state to an empty array
        }, 2000);
        throw new Error('Oops!!! Your Session has been expired. Please refresh the page or login again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'Order') {
        setSuccess(data.message);
        setError(null);
        setOrderDetails(data);
        setFormData({
          shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', province: '' },
          billingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', province: '', short_national_address: '' },
          shippingAdd: false,
        });
        setTimeout(() => router.push(`/${locale}/shop-order-complete`), 1000);
      } else if(data.message && data.message == 'Redirecting to Payfort...') {
        setSuccess(data.message);
        setError(null);
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
        // Creating a form and submitting it
        const form = document.createElement("form");
        form.action = data.redirect_url;  // The URL to redirect to
        form.method = "POST";

        // If you have additional data you want to send with the form
        const params = {
          // Add parameters you need to pass to the form (hidden inputs)
          'command': data.request_params.command,
          'access_code': data.request_params.access_code,
          'merchant_identifier': data.request_params.merchant_identifier,
          'merchant_reference': data.request_params.merchant_reference,
          'amount': data.request_params.amount,
          'currency': data.request_params.currency,
          'language': data.request_params.language,
          // 'order_description': data.request_params.order_description,
          'return_url': data.request_params.return_url,
          "customer_name": data.request_params.customer_name,
          'customer_email': data.request_params.customer_email,
          "phone_number": data.request_params.phone_number,
          "billing_street": data.request_params.billing_street,
          "billing_city": data.request_params.billing_city,
          "billing_stateProvince": data.request_params.billing_stateProvince,
          "billing_country": data.request_params.billing_country,
          "shipping_street": data.request_params.shipping_street,
          "shipping_city": data.request_params.shipping_city,
          "shipping_stateProvince": data.request_params.shipping_stateProvince,
          "shipping_country": data.request_params.shipping_country,
          "signature": data.request_params.signature
        };

        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        // Appending the form to the body
        document.body.appendChild(form);

        // Submit the form
        form.submit();return;
      } else if(data.message && data.message == 'Redirecting to Tabby...') {
          setSuccess(data.message);
          setError(null);
          // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
          router.push(data.redirect_url);
      } else if(data.message && data.message == 'Redirecting to Tamara...') {
          setSuccess(data.message);
          setError(null);
          router.push(data.redirect_url);
      } else if (data.qtyMessage) {
        // setSuccess();
        setError(data.qtyMessage);
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
      } else if (data.discountMessage) {
        // setSuccess();
        setError(data.discountMessage);
        // setTimeout(() => {
        //   localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
        //   setCartProducts([]); // update the cartProducts state to an empty array
        // }, 2000); // time in milliseconds (e.g., 1000ms = 1 second)
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
      } else if (data.couponMessage) {
        // setSuccess();
        setError(data.couponMessage);
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
      } else if (data.duplicateOrderMessage) {
          // setSuccess();
          setError(data.duplicateOrderMessage);
          // setTimeout(() => {
          //     localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
          //     setCartProducts([]); // update the cartProducts state to an empty array
          // }, 2000); // time in milliseconds (e.g., 1000ms = 1 second)
          // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
          // router.push(data.redirect_url);
      } else {
        if(data.products) {
          setError(data.products);
        }
        if(data['billingAddress.first_name']) {
          setError(data['billingAddress.first_name']);
        }
        if(data['billingAddress.last_name']) {
          setError(data['billingAddress.last_name']);
        }
        if(data['billingAddress.email']) {
          setError(data['billingAddress.email']);
        }
        if(data['billingAddress.mobile']) {
          setError(data['billingAddress.mobile']);
        }
        if(data['billingAddress.area']) {
          setError(data['billingAddress.area']);
        }
        if(data['billingAddress.building']) {
          setError(data['billingAddress.building']);
        }
        if(data['billingAddress.province']) {
          setError(data['billingAddress.province']);
        }
        if(data.error) {
          setError(data.error);
        }
        setSuccess(null);
      }
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOTP(e) {
    e.preventDefault();
    setIsSendOTPLoading(true);

    const regex = /^\d{10}$/;

    if(formData.billingAddress.mobile == '') {
      setOTPError('Mobile Number is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    if(!regex.test(formData.billingAddress.mobile)) {
      setOTPError('Invalid Mobile Number');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    setOTPError(null);
    setIsSendOTPLoading(true);
    // return false;
    
    try {
      const mobile = formData.billingAddress.mobile;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/sendOTP`, {
        method: 'POST',
        body: JSON.stringify({mobile}),
        headers: { 'Content-Type': 'application/json', }
      })
 
      if (!response.ok) { throw new Error('Failed to submit the data. Please try again.'); }
 
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'OTP') {
        setOTPSuccess(data.message);
        setOTPError(null);
        setIsOTPButton(false);
      } else {
        if(data['mobile']) { setOTPSuccess(data['mobile']); }
        setOTPSuccess(null);
      }
    } catch (error) {
      setOTPSuccess(error.message);
    } finally {
      setIsSendOTPLoading(false);
    }
  }

  async function verifyOTP(e) {
    e.preventDefault();
    setIsSendOTPLoading(true);
    
    const regex = /^\d+$/;

    if(formData.otp == '') {
      setOTPError('OTP is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    if(!regex.test(formData.otp)) {
      setOTPError('Invalid OTP');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    setOTPError(null);
    setIsSendOTPLoading(true);
    // return false;
    
    try {
      const mobile = formData.billingAddress.mobile;
      const otp = formData.otp;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, {
        method: 'POST',
        body: JSON.stringify({mobile, otp, flag: 'checkout'}),
        headers: { 'Content-Type': 'application/json' }
      })
 
      if (!response.ok) { throw new Error('Failed to submit the data. Please try again.'); }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'Invalid') {
        setOTPSuccess(null);
        setOTPError(data.message);
      } else if(data.message && data.message.split(' ')[0] == 'OTP') {
        setOTPSuccess(data.message);
        setIsOTPVerified(true);
        setIsDisabled(false);
        setOTPError(null);
        localStorage.setItem("token", data.access_token);
      } else {
        if(data['mobile']) { setOTPError(data['mobile']); }
        if(data['otp']) { setOTPError(data['otp']); }
        setOTPSuccess(null);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setOTPError(error.message);
      console.error(error);
    } finally {
      setIsSendOTPLoading(false);
    }
  }
  
  if (isMenuLoading) { return <div><Pagination1 /></div>; }
  if (isMenuError) { return <div>{ isMenuError }</div>; }

  return (
    <>
    {cartProducts.length ? (
      <>
        <FreeGiftFeature couponData={couponData}/>
        <BogoFeature/>
        <form onSubmit={onOrder}>
          <div className="checkout-form">
            <div className="billing-info__wrapper">
              <h4>{t("BILLING DETAILS")}</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-floating my-3">
                    <input type="text" className="form-control" id="checkout_first_name" placeholder="First Name" name="billingAddress.first_name" value={formData.billingAddress.first_name} onChange={handleChange} required />
                    <label htmlFor="checkout_first_name">{t("First Name")}</label>
                    {fieldErrors.first_name && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.first_name} </div> )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating my-3">
                    <input type="text" className="form-control" id="checkout_last_name" placeholder="Last Name" name="billingAddress.last_name" value={formData.billingAddress.last_name} onChange={handleChange} required />
                    <label htmlFor="checkout_last_name">{t("Last Name")}</label>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="search-field my-3">
                    <div className={`form-label-fixed hover-container ${idDDActive ? "js-content_visible" : ""}`}>
                      <label htmlFor="country" className="form-label">{t("Country / Region")}*</label>
                      <div className="js-hover__open">
                        <input type="text" className="form-control form-control-lg search-field__actor" id="country" name="billingAddress.country" value={t("Saudi Arabia")} readOnly placeholder={t("Saudi Arabia")} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_short_national_address" placeholder="Short Natinal Address *" name="billingAddress.short_national_address" value={formData.billingAddress.short_national_address} onChange={handleChange} required pattern="^[A-Za-z]{4}[0-9]{4}$" maxlength="8" title="Enter 4 letters followed by 4 numbers"/>
                      <label htmlFor="checkout_company_name"> Short National Address * </label>
                    </div>
                    {/* <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Full Address *" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Full Address * </label>
                    </div> */}
                  </div>
                <div className="col-md-12">
                  <div className="form-floating mt-3 mb-3">
                    <input type="text" className="form-control" id="checkout_street_address" placeholder="Area / Mantaqa *"  readOnly={isLoggedIn} name="billingAddress.area" value={formData.billingAddress.area} onChange={handleChange} required />
                    <label htmlFor="checkout_company_name">{t("City")} *</label>
                    {fieldErrors.area && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.area} </div> )}
                  </div>
                  <div className="form-floating mt-3 mb-3">
                    <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment" readOnly={isLoggedIn} name="billingAddress.building" value={formData.billingAddress.building} onChange={handleChange} required />
                    <label htmlFor="checkout_company_name">{t("Full Address")}</label>
                    {fieldErrors.building && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.building} </div> )}
                  </div>
                </div>

                {/* <div className="col-md-12">
                  <div className="search-field my-3">
                    <div className={`form-label-fixed hover-container ${idDDActive ? "js-content_visible" : ""}`}>
                      <label htmlFor="search-dropdown" className="form-label">Province*</label>
                      <div className="js-hover__open">
                        <input type="text" className="form-control form-control-lg search-field__actor search-field__arrow-down" id="search-dropdown" name="billingAddress.emirates" value={formData.billingAddress.emirates} readOnly placeholder="Select Emirate..." onClick={() => setIdDDActive((pre) => !pre)} required />
                      </div>
                      <div className="filters-container js-hidden-content mt-2">
                        <div className="search-field__input-wrapper">
                          <input type="text" className="search-field__input form-control form-control-sm bg-lighter border-lighter" placeholder="Search" onChange={(e) => { setSearchQuery(e.target.value); }} />
                        </div>
                        <ul className="search-suggestion list-unstyled">
                          {countries.filter((elm) => elm.toLowerCase().includes(searchQuery.toLowerCase())).map((elm, i) => (
                              <li id="billingAddress.emirates" onClick={(e) => { handleEmiratesChange(e, elm); setIdDDActive(false); }} key={i} className="search-suggestion__item js-search-select" > 
                                {elm}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div> */}

                <div className="col-md-12">
                  <div className="form-floating mt-3 mb-3">
                    <input type="text" className="form-control" id="checkout_province" placeholder="Province *" readOnly={isLoggedIn} name="billingAddress.province" value={formData.billingAddress.province} onChange={handleChange} required />
                    <label htmlFor="checkout_province"> {t("Province")} * </label>
                  </div>
                  {/* <div className="form-floating mt-3 mb-3">
                    <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment" name="billingAddress.building" value={formData.billingAddress.building} onChange={handleChange} required />
                    <label htmlFor="checkout_company_name"> Building / Villa / Apartment </label>
                  </div> */}
                </div>
                {isLoggedIn && ( <Link className="btn-link btn-link_lg text-center fw-bold text-danger p-2" href={`/${locale}/account_edit_address`} target="_blank" > - Click to Edit Address - </Link> )}
                <div className="col-md-12">
                  <div className="form-floating my-3">
                    <input type="email" className="form-control" id="billingAddress.email" placeholder="Your Mail *" name="billingAddress.email" value={formData.billingAddress.email} onChange={handleChange} required />
                    <label htmlFor="checkout_email">{t("Email Address")} *</label>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-floating my-3">
                    <input type="text" pattern="^\d{10}$" title="Only positive integers allowed" className="form-control" id="checkout_otp" placeholder="Eg. 0500000000 *" name="billingAddress.mobile" value={formData.billingAddress.mobile} onChange={handleChange} required />
                    <label htmlFor="checkout_phone">{t("Mobile Number")} (Eg. 0500000000)*</label>
                  </div>
                </div>
                {!isLoggedIn && (
                    <div className="col-md-12">
                      {OTPError ? ( <div style={{ color: "red" }}>{OTPError}</div> ) : ( <div style={{ color: "green" }}>{OTPSuccess}</div> )}
                      {isOTPButton ? ( <button className="btn btn-primary w-100 text-uppercase" type="button" disabled={isSendOTPLoading} onClick={sendOTP} > {isSendOTPLoading ? "Loading..." : t("Send OTP")} </button> ) : ( 
                        <>
                        {!isOTPVerified && ( 
                          <>
                            <div className="form-floating my-3">
                              <input type="number" className="form-control" id="billing_otp" placeholder="Eg. 1234 *" name="otp" value={formData.otp} onChange={handleChange} />
                              <label htmlFor="billing_otp"> OTP (Eg. 1234)* </label>
                            </div>
                            <button className="btn btn-primary w-100 text-uppercase" type="button" disabled={isSendOTPLoading} onClick={verifyOTP} >
                              {isSendOTPLoading ? "Loading..." : "Verify OTP"} 
                            </button>
                          </>
                        )}
                        </>
                      )}
                    </div>
                  )}
                <div className="col-md-12">
                  {!isLoggedIn && <div className="form-check mt-3">
                    <input className="form-check-input form-check-input_fill" type="checkbox" defaultValue="" id="create_account" onClick={(prev) => setCreateAccount(!createAccount)} name="create_account" />
                    <label className="form-check-label" htmlFor="create_account"> {t("CREATE AN ACCOUNT")}? </label>
                  </div>}
                  <div className="form-check mb-3">
                    <input className="form-check-input form-check-input_fill" type="checkbox" defaultValue="" id="ship_different_address" onClick={handleCheckboxChange} name="shipping" />
                    <label className="form-check-label" htmlFor="ship_different_address" > {t("SHIP TO A DIFFERENT ADDRESS")}? </label>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mt-3 mb-3">
                  <textarea className="form-control form-control_gray" placeholder="Order Notes (optional)" cols="30" rows="8" name="note" onChange={handleChange} value={ formData.note } ></textarea>
                </div>
              </div>
              {createAccount && <div className="col-md-12">
                <div className="form-floating my-3">
                  <input type="password" className="form-control" id="password" placeholder="Password *" name="password" value={formData.password} onChange={handleChange} required />
                  <label htmlFor="checkout_email">Password *</label>
                </div>
              </div>}
            </div>
            <div className="checkout__totals-wrapper">
              <div className="sticky-content">
                <div className="checkout__totals">
                  <h3>{t("Your Order")}</h3>
                  <table className="checkout-cart-items">
                    <thead>
                      <tr>
                        <th>{t("PRODUCT")}</th>
                        <th>{t("SUBTOTAL")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map((elm, i) => (
                        <tr key={i}>
                          <td>
                            {he.decode(elm.product_name)} x {elm.quantity}
                          </td>
                          {subTotalPrice(elm)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="checkout-totals">
                    <tbody>
                      <tr>
                        <th>{t("SUBTOTAL")}</th>
                        <td>{totalPrice.toFixed(2)}{ currency.symbol }</td>
                      </tr>
                      <tr>
                        <th>{t("SHIPPING")}</th>
                        <td>{freeShippingFlag ? 'You Got Free Shipping' : `Shipping Cost: ${ shippingServiceCharges[0].price }${ currency.symbol}`}</td>
                      </tr>
                      {/* <tr>
                        <th>SERVICE FEE</th>
                        <td>{ shippingServiceCharges[1].price }{ currency.symbol }</td>
                      </tr> */}
                      <tr>
                        <th>{t("TOTAL")}</th>
                        <td>{!freeShippingFlag ? (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2) :
                            (0 + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)}{ currency.symbol } (includes { !freeShippingFlag ? (
                            (
                              (parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + parseFloat(vatTax.percentage / 100))) +
                              (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) +
                              (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                            ).toFixed(2)) : (
                            (
                              0 +
                              (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) +
                              (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                            ).toFixed(2)) }{ currency.symbol } VAT)</td>
                      </tr>
                    </tbody>
                  </table>
                  <TamaraWidget amount={!freeShippingFlag ? (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2) : (0 + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)} inlineType='2' inlineVariant='outlined' locale={locale}/>
                </div>
                <div >
                  {/* <form
                    onSubmit={applyCoupon}
                    className="position-relative bg-body"
                  > */}
                    {couponError ? (
                        <div style={{ color: "red" }}>
                            {couponError}
                        </div>
                    ) : (
                        <div style={{ color: "green" }}>
                            {couponSuccess}
                        </div>
                    )}

                   <div style={{ position: "relative" }}>
                      <input className="form-control mb-1" type="text" name="coupon_code" placeholder="Coupon Code" value={couponCode} onChange={handleCouponChange} style={{ paddingRight: "100px" }} />
                      <span style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", fontSize: 14, color: "#a67b30", cursor: "pointer", textDecoration: "underline",}} onClick={() => setShowCouponModal(true)} >
                        {t("View Coupons")}
                      </span>
                    </div>
 
                    {/* <input
                        className="form-control mb-1"
                        type="text"
                        name="coupon_code"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={handleCouponChange}
                    /> */}
                    {!couponData ? (
                      <input className="coupon-action-btn" type="button" value={t("APPLY COUPON")} onClick={applyCoupon} />
                    ) : (
                      <input className="coupon-action-btn remove" type="button" value={t("REMOVE COUPON")} onClick={removeCoupon} />
                    )}
                  {/* </form> */}
                  <br/><br/>
                   {showCouponModal && (
                      <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)} >
                        <div className="coupon-modal" onClick={(e) => e.stopPropagation()} >
                          <div className="coupon-header">
                            <h3>{t("Available Offers")}</h3>
                            <button className="close-btn" onClick={() => setShowCouponModal(false)} >
                              &times;
                            </button>
                          </div>
                          <div className="coupon-subheader border-bottom">
                            <h3>{t("Coupon Offers")}</h3>
                          </div>

                          {couponLoading ? (
                            <div className="coupon-loading">{t("Loading")}</div>
                          ) : coupons.length === 0 ? (
                            <div className="coupon-empty">
                              {t("You have no coupons yet")}
                            </div>
                          ) : (
                            <div className="coupon-body">
                              {coupons.map((c, idx) => {
                                const expired = isExpired(c.end_date);
                                return (
                                  <div key={c.id || `coupon-${idx}`} className={`coupon-ticket ${ expired ? "expired" : "" }`} >
                                    <div className="coupon-left">
                                      <div className="coupon-title">
                                        {c.title || t("Special Offer")}
                                      </div>
                                      <div className="coupon-desc">
                                        <h5>
                                          {c.description || (c.coupon_type === "percent" ? `${c.value}% OFF` : `AED${c.value} OFF`)}
                                        </h5>
                                      </div>
                                      <div className="coupon-validity">
                                        {expired ? `Expired: ${c.end_date?.slice(0, 10)}` : `Valid until: ${c.end_date?.slice(0, 10 )}`}
                                      </div>
                                    </div>

                                    <div className="coupon-right">
                                      <div className={`coupon-code-box ${copiedId === (c.id || `coupon-${idx}`) ? "copied" : "" }`} onClick={() => !expired && handleCopy(c.code, c.id || `coupon-${idx}`)}>
                                        <span className="coupon-code">
                                          {c.code}
                                        </span>
                                      </div>

                                      {!expired && (
                                        <button className={`apply-btn ${copiedId === (c.id || `coupon-${idx}`) ? "applied" : "" }`}
                                          onClick={() => handleSelectCoupon(c.code, c.id || `coupon-${idx}`)}>
                                          {copiedId === (c.id || `coupon-${idx}`) ? t("Applied!") : t("Click to Apply")} 
                                        </button>
                                      )}

                                      {expired && ( <div className="coupon-expired-badge">{t("Expired")}</div> )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  {/* <button className="btn btn-light">UPDATE CART</button> */}
                </div>
                <style jsx>{`
                    .coupon-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
                    .coupon-modal { background: #fff; border-radius: 12px; width: 500px; max-width: 90%; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); overflow:  hidden; font-family: "Inter", sans-serif; }
                    .coupon-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #f0f0f0; }
                    .coupon-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: #222; }
                    .coupon-subheader { padding: 10px 18px; border-bottom: 1px solid #f0f0f0; }
                    .coupon-subheader h3 { margin: 0; font-size: 16px; font-weight: 600; color: #a67b30; background: #fffaf2ff; }
                    .close-btn { background: none; border: none; font-size: 20px; color: #666; cursor: pointer; }
                    .coupon-body { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
                    .coupon-ticket { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e5e5e5; border-radius: 12px; background: #fff; padding: 14px 16px; position: relative; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
                    .coupon-ticket::before, .coupon-ticket::after { content: ""; position: absolute; top: 50%; width: 20px; height: 20px; background: #f5f5f5; border: 1.5px solid #dbdbdb; border-radius: 50%; transform: translateY(-50%); z-index: 2; }
                    .coupon-ticket::before { left: -10px; }
                    .coupon-ticket::after { right: -10px; }
                    .coupon-left { display: flex; flex-direction: column; gap: 4px; }
                    .coupon-title { font-size: 14px; font-weight: 600; color: #222; }
                    .coupon-desc { font-size: 12px; color: #555; }
                    .coupon-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; } 
                    .coupon-code { background: #f0fdf4; color: #198754; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
                    .apply-btn { background: none; border: none; color: #a67b30; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; text-transform: uppercase; }
                    .apply-btn:hover { text-decoration: underline; }
                    .coupon-ticket.expired { opacity: 0.6; }
                    .coupon-loading, .coupon-empty { text-align: center; padding: 30px; color: #777; font-size: 13px; }
                    .coupon-action-btn { width: 100%; padding: 12px; background-color: #222; color: #fff; border: 1px solid #222; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; margin-top: 8px; }
                    .coupon-action-btn:hover { background-color: #000; border-color: #000; }
                    .coupon-action-btn.remove { background-color: transparent; color: #dc3545; border: 1px solid #dc3545; 
                    .coupon-action-btn.remove:hover { background-color: #dc3545; color: #fff; }
                  `}
                </style>
                <div className="checkout__payment-methods">
                  <div className="form-check">
                    <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_3" value={'cod'} checked={selectedOption === 'cod'} onChange={handleRadioChange} />
                    <label className="form-check-label" htmlFor="checkout_payment_method_3" >
                      {t("Cash on delivery")}
                      {/* <span className="option-detail d-block">
                        Phasellus sed volutpat orci. Fusce eget lore mauris
                        vehicula elementum gravida nec dui. Aenean aliquam varius
                        ipsum, non ultricies tellus sodales eu. Donec dignissim
                        viverra nunc, ut aliquet magna posuere eget.
                      </span> */}
                    </label>
                  </div>
                   {/* <div className="form-check">
                      <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_4" value={"paytabs"} checked={selectedOption === "paytabs"} onChange={handleRadioChange} />
                      <label className="form-check-label" htmlFor="checkout_payment_method_4" style={{ display: "flex", flexDirection: "column" }} > PayTabs - Credit / Debit Card <div style={{ display: "flex", gap: "6px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="20" viewBox="0 0 77 16" >
                          <g transform="translate(-523 -415)">
                            <rect style={{ fill: "#fff", opacity: 0 }} className="a" width="77" height="16" transform="translate(523 415)"/>
                            <path style={{ fill: "#2a2a6c" }} className="b" d="M70.75,432.369l-5.76,13.746H61.23L58.4,435.145a1.522,1.522,0,0,0-.847-1.21,15.018,15.018,0,0,0-3.509-1.167l.087-.4h6.049a1.657,1.657,0,0,1,1.64,1.4l1.5,7.955,3.7-9.357H70.75m14.727,9.256c.017-3.625-5.017-3.823-4.98-5.446.009-.494.479-1.019,1.507-1.151a6.719,6.719,0,0,1,3.507.612l.624-2.912a9.55,9.55,0,0,0-3.325-.609c-3.515,0-5.989,1.869-6.009,4.543-.023,1.978,1.765,3.082,3.113,3.741,1.385.674,1.847,1.1,1.842,1.708-.008.923-1.1,1.325-2.126,1.344a7.433,7.433,0,0,1-3.654-.869l-.644,3.014a10.87,10.87,0,0,0,3.956.731c3.735,0,6.178-1.849,6.19-4.707m9.28,4.49h3.29l-2.87-13.746H92.14a1.624,1.624,0,0,0-1.514,1.007l-5.332,12.739h3.732l.741-2.053H94.33Zm-3.967-4.87,1.872-5.161,1.077,5.161Zm-14.959-8.875L72.89,446.114H69.334l2.942-13.746Z" transform="translate(470.495 -16.119)" />
                            <g transform="translate(1.466 -18.353)">
                              <rect style={{ fill: "#ff5f00" }} className="c" width="6.84" height="11.172" transform="translate(581.019 435.873)" />
                              <path style={{ fill: "#eb001b" }} className="d" d="M16.226,14.558A7.093,7.093,0,0,1,18.94,8.973a7.1,7.1,0,1,0,0,11.172,7.093,7.093,0,0,1-2.714-5.587Z" transform="translate(565.497 426.902)" />
                              <path style={{ fill: "#f79e1b" }} className="e" d="M119.946,64.636v-.229h.1V64.36h-.235v.047h.093v.229Zm.456,0V64.36h-.071l-.083.2-.083-.2h-.071v.276h.051v-.209l.077.18h.053l.077-.18v. 209Z" transform="translate(475.307 381.226)" />
                              <path style={{ fill: "#f79e1b" }} className="e" d="M77.186,14.547a7.1,7.1,0,0,1-11.5,5.585,7.1,7.1,0,0,0,0-11.172,7.1,7.1,0,0,1,11.5,5.585Z" transform="translate(518.747 426.913)"/>
                            </g>
                          </g>
                        </svg> 
                        <hr></hr>
                        <Image src="/assets/images/paytabs-svg/UnionPay_logo.png" alt="Union Pay" width={50} height={20} />
                        <Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="Apple Pay" width={50} height={20} />
                        <Image src="/assets/images/paytabs-svg/Samsung_Pay_Logo.png" alt="Samsung Pay" width={50} height={20} />
                        </div>
                      </label>
                    </div> */}
                  {/* <div className="form-check">
                    <input
                      className="form-check-input form-check-input_fill"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_4"
                      value={'payfort'}
                      checked={selectedOption === 'payfort'}
                      onChange={handleRadioChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="checkout_payment_method_4"
                    >
                      PayFort - Credit / Debit Card
                      <Image
                        src="/assets/images/paymentGateway/mada-logo.png"
                        width="50"
                        height="20"
                        alt="Cropped Faux leather Jacket"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="20" viewBox="0 0 77 16">
                        <g transform="translate(-523 -415)">
                          <rect style={{fill: "#fff", opacity: 0}} className="a" width="77" height="16" transform="translate(523 415)"/>
                          <path style={{fill: "#2a2a6c"}} className="b" d="M70.75,432.369l-5.76,13.746H61.23L58.4,435.145a1.522,1.522,0,0,0-.847-1.21,15.018,15.018,0,0,0-3.509-1.167l.087-.4h6.049a1.657,1.657,0,0,1,1.64,1.4l1.5,7.955,3.7-9.357H70.75m14.727,9.256c.017-3.625-5.017-3.823-4.98-5.446.009-.494.479-1.019,1.507-1.151a6.719,6.719,0,0,1,3.507.612l.624-2.912a9.55,9.55,0,0,0-3.325-.609c-3.515,0-5.989,1.869-6.009,4.543-.023,1.978,1.765,3.082,3.113,3.741,1.385.674,1.847,1.1,1.842,1.708-.008.923-1.1,1.325-2.126,1.344a7.433,7.433,0,0,1-3.654-.869l-.644,3.014a10.87,10.87,0,0,0,3.956.731c3.735,0,6.178-1.849,6.19-4.707m9.28,4.49h3.29l-2.87-13.746H92.14a1.624,1.624,0,0,0-1.514,1.007l-5.332,12.739h3.732l.741-2.053H94.33Zm-3.967-4.87,1.872-5.161,1.077,5.161Zm-14.959-8.875L72.89,446.114H69.334l2.942-13.746Z" transform="translate(470.495 -16.119)"/>
                          <g transform="translate(1.466 -18.353)">
                            <rect style={{fill: "#ff5f00"}} className="c" width="6.84" height="11.172" transform="translate(581.019 435.873)"/>
                            <path style={{fill: "#eb001b"}} className="d" d="M16.226,14.558A7.093,7.093,0,0,1,18.94,8.973a7.1,7.1,0,1,0,0,11.172,7.093,7.093,0,0,1-2.714-5.587Z" transform="translate(565.497 426.902)"/>
                            <path style={{fill: "#f79e1b"}} className="e" d="M119.946,64.636v-.229h.1V64.36h-.235v.047h.093v.229Zm.456,0V64.36h-.071l-.083.2-.083-.2h-.071v.276h.051v-.209l.077.18h.053l.077-.18v.209Z" transform="translate(475.307 381.226)"/>
                            <path style={{fill: "#f79e1b"}} className="e" d="M77.186,14.547a7.1,7.1,0,0,1-11.5,5.585,7.1,7.1,0,0,0,0-11.172,7.1,7.1,0,0,1,11.5,5.585Z" transform="translate(518.747 426.913)"/>
                          </g>
                        </g>
                      </svg>
                    </label>
                  </div> */}

                  <div className="form-check">
                    <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_5" value={'tamara'} checked={selectedOption === 'tamara'} onChange={handleRadioChange} />
                    <label className="form-check-label" htmlFor="checkout_payment_method_5" style={{display: "inline-flex"}} >
                      {t("Tamara - No interest, No fees")} 
                      <TamaraWidget inlineType='4' inlineVariant='text' locale={locale}/>
                    </label>
                  </div>

                  <div className="form-check">
                    <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_6" value={'tabby'} checked={selectedOption === 'tabby'} onChange={handleRadioChange} />
                    <label className="form-check-label" htmlFor="checkout_payment_method_6" >
                      <Image src="/assets/images/paymentGateway/Tabby.png" width="60" height="25" alt="Cropped Faux leather Jacket" />
                      <span style={{marginLeft: "0.5rem"}}>{t("Pay later with Tabby")} <sup><strong>ⓘ</strong></sup></span><br/>{t("Use any card")}
                      {/* <button style={{ 'border-radius': '50px', 'border': 'none' }} type="button" data-tabby-info="installments" data-tabby-price={finalPriceState && finalPriceState} data-tabby-currency="AED">?</button> */}
                    </label>
                    {selectedOption == 'tabby' && <><div id="tabbyCard"></div></>}
                  </div> 
                  <div className="policy-wrapper mt-3">
                      {/* Privacy Notice Text */}
                      <p className="small text-muted mb-3" style={{ lineHeight: '1.5' }}>
                        {locale === 'ar' ? "سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك في هذا الموقع، ولأغراض أخرى موصوفة في " : "Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our "}
                        <Link href={`/${locale}/privacy`} className="text-dark text-decoration-underline fw-medium" target="_blank" >
                          {locale === 'ar' ? "سياسة الخصوصية." : "privacy policy."}
                        </Link>
                      </p>

                      {/* Interactive Checkbox */}
                      <div className="form-check d-flex align-items-start p-0">
                        <input className="form-check-input border-secondary" type="checkbox" id="terms-agreement" required style={{ marginTop: '0.25rem', width: '1.1em', height: '1.1em', cursor: 'pointer', marginLeft: locale === 'ar' ? '0.5rem' : '0', marginRight: locale === 'ar' ? '0' : '0.5rem' }} />
                        <label  htmlFor="terms-agreement"  className="form-check-label small"  style={{ cursor: 'pointer', userSelect: 'none' }} >
                          {locale === 'ar' ? "لقد قرأت ووافقت على " : "I have read and agree to the website "}
                          <Link  href={`/${locale}/terms`}  className="text-primary text-decoration-underline"  target="_blank" >
                            {locale === 'ar' ? "شروط وأحكام الموقع" : "terms and conditions"}
                          </Link>
                          <span className="text-danger fw-bold mx-1">*</span>
                        </label>
                      </div>
                    </div>
                </div>
                {error ? ( <div style={{ backgroundColor: "#ffebe9", color: "#cf1e1e", padding: "14px 20px", marginBottom: "1rem", textAlign: "center", fontSize: "15px", fontWeight: "500", borderRadius: "2px", }} > {error} </div> ) 
                : success ? ( <div style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "14px 20px", marginBottom: "1rem", textAlign: "center", fontSize: "15px", fontWeight: "500", borderRadius: "2px", }} > {success} </div> ) : null}
                <button className="btn btn-primary w-100 text-uppercase" type="submit" disabled={disablePlaceOrder}>
                  {isLoading ? 'Loading...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        {/* </form> */}

        {formData.shippingAdd == true ? (
          // <form className="col-md-8" onSubmit={(e) => e.preventDefault()}>
            <div className="checkout-form">
              <div className="billing-info__wrapper">
                <h4>SHIPPING DETAILS</h4>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input type="text" className="form-control" id="checkout_first_name" placeholder="First Name" name="shippingAddress.first_name" value={formData.shippingAddress.first_name} onChange={handleChange} required />
                      <label htmlFor="checkout_first_name">First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input type="text" className="form-control" id="checkout_last_name" placeholder="Last Name" name="shippingAddress.last_name" value={formData.shippingAddress.last_name} onChange={handleChange} required />
                      <label htmlFor="checkout_last_name">Last Name</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="search-field my-3">
                      <div className={`form-label-fixed hover-container ${idDDActive ? "js-content_visible" : "" }`} >
                        <label htmlFor="country" className="form-label"> Country / Region* </label>
                        <div className="js-hover__open">
                          <input type="text" className="form-control form-control-lg search-field__actor" id="country" name="shippingAddress.country" value="Saudi Arabia" readOnly placeholder="Saudi Arabia" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address" placeholder="Area / Mantaqa *" name="shippingAddress.area" value={formData.shippingAddress.area} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Area / Mantaqa * </label>
                    </div>
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment *" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Building / Villa / Apartment * </label>
                    </div>
                  </div>

                  {/* <div className="col-md-12">
                    <div className="search-field my-3">
                      <div className={`form-label-fixed hover-container ${idDDActive ? "js-content_visible" : "" }`}>
                        <label htmlFor="search-dropdown" className="form-label">Emirates*</label>
                        <div className="js-hover__open">
                          <input type="text" className="form-control form-control-lg search-field__actor search-field__arrow-down" id="search-dropdown" name="shippingAddress.emirates" value={formData.shippingAddress.emirates} readOnly placeholder="Select Emirate..." onClick={() => setIdDDActive((pre) => !pre)} required />
                        </div>
                        <div className="filters-container js-hidden-content mt-2">
                          <div className="search-field__input-wrapper">
                            <input type="text" className="search-field__input form-control form-control-sm bg-lighter border-lighter" placeholder="Search" onChange={(e) => { setSearchQuery(e.target.value); }} />
                          </div>
                          <ul className="search-suggestion list-unstyled">
                            {countries.filter((elm) => elm.toLowerCase().includes(searchQuery.toLowerCase())).map((elm, i) => (
                                <li id="shippingAddress.emirates" onClick={(e) => { handleEmiratesChange(e, elm); setIdDDActive(false); }} key={i} className="search-suggestion__item js-search-select" >
                                  {elm}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_province" placeholder="Province *" name="shippingAddress.province" value={formData.shippingAddress.province} onChange={handleChange} required />
                      <label htmlFor="checkout_province">Province *</label>
                    </div>
                    {/* <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Building / Villa / Apartment </label>
                    </div> */}
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input type="email" className="form-control" id="checkout_email" placeholder="Your Mail *" name="shippingAddress.email" value={formData.shippingAddress.email} onChange={handleChange} required />
                      <label htmlFor="checkout_email">Email Address *</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input type="text" pattern="^\d{10}$" title="Only positive integers allowed" className="form-control" id="checkout_phone" placeholder="Eg. 0500000000 *" name="shippingAddress.mobile" value={formData.shippingAddress.mobile} onChange={handleChange} required />
                      <label htmlFor="checkout_phone">Phone (Eg. 0500000000)*</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        ) : null}
        </form>
      </>
      ) : (
        <>
          <div className="fs-20">Shop cart is empty</div>

          <button className="btn mt-3 mb-3 btn-light">
            <Link href={`/${locale}/shop`}>Explore Products</Link>
          </button>
        </>
      )}
    </>
  );
}
