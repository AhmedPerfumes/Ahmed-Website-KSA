"use client";
const countries = [
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dubai",
  "Fujairah",
  "Ras Al Khaymah",
  "Sharjah",
  "Umm Al Quwain",
];
import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { useMenu } from '@/context/MenuContext';
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import he from 'he';
import { products1 } from "@/data/products/fashion";
import { useRouter } from 'next/navigation';
import { useLocale } from "next-intl";
import Pagination1 from "../common/Pagination1";
// import FreeGiftFeature from '@/components/FreeGiftFeature';

export default function Checkout() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const router = useRouter();
  const locale = useLocale();

  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext, setCartProducts } = useContextElement();
  const { isLoggedIn } = useUser();
  // const [selectedRegion, setSelectedRegion] = useState("");
  const [idDDActive, setIdDDActive] = useState(false);
  // const [shippingAdd, setShippingAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState('cod');
  const [formData, setFormData] = useState({
    shippingAddress: {
      first_name: '',
      last_name: '',
      mobile: '',
      email: '',
      country: 'KSA',
      area: '',
      building: '',
      province: ''
    },
    billingAddress: {
      first_name: '',
      last_name: '',
      mobile: '',
      email: '',
      country: 'KSA',
      area: '',
      building: '',
      province: ''
    },
    shippingAdd: false,
    note: '',
    password: '',
    otp: ''
  });
  const [createAccount, setCreateAccount] = useState(false);

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
  const [finalPriceState, setFinalPriceState] = useState(null);

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('shipping') || name.startsWith('billing')) {
      const addressField = name.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const fieldName = name.split('.')[1]; // Get the specific field (e.g., street, city)
      setFormData((prevData) => ({
        ...prevData,
        [addressField]: {
          ...prevData[addressField],
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
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

  useEffect(() => {
    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0]?.price) + totalPrice + parseFloat(shippingServiceCharges[1]?.price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1]?.price);
    setFinalPriceState(finalPrice);
  }, [selectedOption]);

  useEffect(() => {
    // Load the TabbyCard script
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

  useEffect(() => {
   setCouponDataContext(null);
  }, []);

 
  async function onOrder(event) {
    event.preventDefault();
    // console.log('Order submitted:', formData);
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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

    const additionalFields = {
      ...formData,
      products : cartProducts,
      payment_method: selectedOption,
      shippingPrice,
      shippingPriceVat,
      servicePrice,
      servicePriceVat,
      vatTax: vatTax.percentage,
      totalPrice,
      finalPrice,
      customer_id: userJson ? userJson.id : null,
      locale,
      couponCode
    }
 
    try {
      // const formDataa = new FormData(additionalFields);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`, {
        method: 'POST',
        body: JSON.stringify(additionalFields),
        headers: {
          'content-type': 'application/json'
        }
      })
 
      if (!response.ok) {
        setTimeout(() => {
          localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
          setCartProducts([]); // update the cartProducts state to an empty array
        }, 2000); // time in milliseconds (e.g., 1000ms = 1 second)
        throw new Error('Oops!!! Your Session has been expired. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      // console.log(data);
      if(data.message && data.message.split(' ')[0] == 'Order') {
        setSuccess(data.message);
        setError(null);
        setOrderDetails(data);
        setFormData({
          shippingAddress: {
            first_name: '',
            last_name: '',
            mobile: '',
            email: '',
            area: '',
            building: '',
            province: ''
          },
          billingAddress: {
            first_name: '',
            last_name: '',
            mobile: '',
            email: '',
            area: '',
            building: '',
            province: ''
          },
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
          'order_description': data.request_params.order_description,
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

        console.log(JSON.stringify(params));

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
      } else if (data.qtyMessage) {
        // setSuccess();
        setError(data.qtyMessage);
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
      } else if (data.discountMessage) {
        // setSuccess();
        setError(data.discountMessage);
        setTimeout(() => {
          localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
          setCartProducts([]); // update the cartProducts state to an empty array
        }, 2000); // time in milliseconds (e.g., 1000ms = 1 second)
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        // router.push(data.redirect_url);
      } else if (data.couponMessage) {
        // setSuccess();
        setError(data.couponMessage);
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
    // console.log('Mobile:', formData.billingAddress.mobile);
    // return;
    setIsSendOTPLoading(true);
    if(formData.billingAddress.mobile == '') {
      setOTPError('Mobile Number is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    const regex = /^\d{10}$/;
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
        headers: {
          'Content-Type': 'application/json', // Specify the content type
        }
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'OTP') {
        setOTPSuccess(data.message);
        setOTPError(null);
        setIsOTPButton(false);
      } else {
        if(data['mobile']) {
          setOTPSuccess(data['mobile']);
        }
        setOTPSuccess(null);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setOTPSuccess(error.message);
      console.error(error);
    } finally {
      setIsSendOTPLoading(false);
    }
  }

  async function verifyOTP(e) {
    e.preventDefault();
    // console.log('Mobile:', formData.billingAddress.mobile);
    // console.log('OTP:', formData.otp);
    // return;
    setIsSendOTPLoading(true);
    if(formData.otp == '') {
      setOTPError('OTP is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    const regex = /^\d+$/;
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
        headers: {
          'Content-Type': 'application/json', // Specify the content type
        }
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
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
      } else {
        if(data['mobile']) {
          setOTPError(data['mobile']);
        }
        if(data['otp']) {
          setOTPError(data['otp']);
        }
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

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponSuccess(null);
    setCouponData(null);
    setCouponDataContext(null);
  };

  const removeCoupon = (e) => {
    setCouponCode('');
    setCouponSuccess(null);
    setCouponData(null);
    setCouponDataContext(null);
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    if(couponCode == '') {
      setCouponError('Coupon Code is Required');
      setCouponSuccess(null);
      setCouponDataContext(null);
      return;
    }

    let product_coupon = false;
    cartProducts.map((item) => {
      // console.log(item.coupon[couponCode.toLowerCase()]?.code, couponCode.toLowerCase());
      if(item.coupon[couponCode.toLowerCase()]?.code == couponCode.toLowerCase() && !item.sale_price) {
        product_coupon = true;
      }
    });

    if(!product_coupon) {
      setCouponError('Invalid Coupon Code for this products');
      setCouponSuccess(null);
      setCouponDataContext(null);
      setCouponCode('');
      return;
    }
    // else if(!isOTPVerified) {
    //   setCouponError('Verify Mobile Number First');
    //   setCouponSuccess(null);
    //   return;
    // }
    try {
      // Call your backend API or validation logic for the coupon code
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/validateCoupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ couponCode, mobile_number: formData.billingAddress.mobile }),
      });

      const data = await res.json();

      if(data.message && data.message.split(' ')[0] == 'Details') {
        setCouponError(null);
        setCouponData(data.coupon);
        setCouponDataContext(data.coupon);
        setCouponSuccess(`Applied Coupon: ${data.coupon.code} - Discount: ${data.coupon.value}%`);
      } else {
        setCouponSuccess(null);
        setCouponData(null);
        setCouponDataContext(null);
        console.log(data);
        if(data['couponCode']) {
          setCouponError(data['couponCode']);
        } else if(data['mobile_number']) {
          setCouponError(data['mobile_number']);
        } else {
          setCouponError(data.message);
          setCouponCode('');
        }
      }
    } catch (err) {
      setCouponSuccess(null);
      setCouponData(null);
      setCouponDataContext(null);
      setCouponError("An error occurred. Please try again.");
    }
  };

  if (isMenuLoading) {
    return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  const subTotalPrice = (elm) => {
    if (elm.is_gift) {
      return <td>0.00{currency.symbol} (Free Gift)</td>;
    }
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      console.log('if');
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <td>{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
      } else {
        return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
      }
    } else if(elm?.sale_price) {
      console.log('else if 2');
      return <td>{((elm.price - (elm.price / 100 * elm.sale_price)) * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    } else if(elm?.coupon && couponData != null && couponCode != null) {
      console.log('else if', elm);
      // elm.map((item) => {
        // return elm.coupon.map((item, ind) => {
        //   // if() {
        //     if(new Date(current_date_time) >= new Date(item.start_date) && new Date(current_date_time) <= new Date(item.end_date) && item.code == couponData.code) {
        //       console.log('iffff', elm);
        //       return <td key={elm.ind}><span className="money price price-old">{elm?.price}{ currency.symbol }</span><span className="money price price-sale">{((elm.price - (elm.price / 100 * item.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</span></td>; // <td>{((elm.price - (elm.price / 100 * i.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
        //     }
        //     else {
        //       console.log('elseeee', elm);
        //       return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
        //     }
        //   // }
        // });
      // });
        if(new Date(current_date_time) >= new Date(elm.coupon[couponCode.toLowerCase()]?.start_date) && new Date(current_date_time) <= new Date(elm.coupon[couponCode.toLowerCase()]?.end_date) && elm.coupon[couponCode.toLowerCase()].code == couponData.code.toLowerCase()) {
          return <td><span className="money price price-old">{ currency.symbol }{elm?.price}</span><span className="money price price-sale">{ currency.symbol }{((elm.price - (elm.price / 100 * elm.coupon[couponCode.toLowerCase()]?.value)) * elm.quantity).toFixed(2)}</span></td>;
        } else {
          return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
        }
    } else {
      console.log('else');
      return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    }
  };

  return (
    <>
    {cartProducts.length ? (
      <>
        {/* <FreeGiftFeature couponData={couponData}/> */}
        <form onSubmit={onOrder}>
          <div className="checkout-form">
            <div className="billing-info__wrapper">
              <h4>BILLING DETAILS</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-floating my-3">
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_first_name"
                      placeholder="First Name"
                      name="billingAddress.first_name"
                      value={formData.billingAddress.first_name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_first_name">First Name</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating my-3">
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_last_name"
                      placeholder="Last Name"
                      name="billingAddress.last_name"
                      value={formData.billingAddress.last_name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_last_name">Last Name</label>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="search-field my-3">
                    <div
                      className={`form-label-fixed hover-container ${
                        idDDActive ? "js-content_visible" : ""
                      }`}
                    >
                      <label htmlFor="country" className="form-label">
                        Country / Region*
                      </label>
                      <div className="js-hover__open">
                        <input
                          type="text"
                          className="form-control form-control-lg search-field__actor"
                          id="country"
                          name="billingAddress.country"
                          value="Saudi Arabia"
                          readOnly
                          placeholder="Saudi Arabia"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-floating mt-3 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_street_address"
                      placeholder="Area / Mantaqa *"
                      name="billingAddress.area"
                      value={formData.billingAddress.area}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_company_name">
                      Area / Mantaqa *
                    </label>
                  </div>
                  <div className="form-floating mt-3 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_street_address_2"
                      placeholder="Building / Villa / Apartment"
                      name="billingAddress.building"
                      value={formData.billingAddress.building}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_company_name">
                      Building / Villa / Apartment
                    </label>
                  </div>
                </div>

                {/* <div className="col-md-12">
                  <div className="search-field my-3">
                    <div
                      className={`form-label-fixed hover-container ${
                        idDDActive ? "js-content_visible" : ""
                      }`}
                    >
                      <label htmlFor="search-dropdown" className="form-label">
                        Province*
                      </label>
                      <div className="js-hover__open">
                        <input
                          type="text"
                          className="form-control form-control-lg search-field__actor search-field__arrow-down"
                          id="search-dropdown"
                          name="billingAddress.emirates"
                          value={formData.billingAddress.emirates}
                          readOnly
                          placeholder="Select Emirate..."
                          onClick={() => setIdDDActive((pre) => !pre)}
                          required
                        />
                      </div>
                      <div className="filters-container js-hidden-content mt-2">
                        <div className="search-field__input-wrapper">
                          <input
                            type="text"
                            className="search-field__input form-control form-control-sm bg-lighter border-lighter"
                            placeholder="Search"
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                            }}
                          />
                        </div>
                        <ul className="search-suggestion list-unstyled">
                          {countries
                            .filter((elm) =>
                              elm
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map((elm, i) => (
                              <li
                                id="billingAddress.emirates"
                                onClick={(e) => {
                                  handleEmiratesChange(e, elm);
                                  setIdDDActive(false);
                                }}
                                key={i}
                                className="search-suggestion__item js-search-select"
                              >
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
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_province"
                      placeholder="Province *"
                      name="billingAddress.province"
                      value={formData.billingAddress.province}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_province">
                      Province *
                    </label>
                  </div>
                  {/* <div className="form-floating mt-3 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="checkout_street_address_2"
                      placeholder="Building / Villa / Apartment"
                      name="billingAddress.building"
                      value={formData.billingAddress.building}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_company_name">
                      Building / Villa / Apartment
                    </label>
                  </div> */}
                </div>

                <div className="col-md-12">
                  <div className="form-floating my-3">
                    <input
                      type="email"
                      className="form-control"
                      id="billingAddress.email"
                      placeholder="Your Mail *"
                      name="billingAddress.email"
                      value={formData.billingAddress.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_email">Email Address *</label>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-floating my-3">
                    <input
                      type="text"
                      pattern="^\d{10}$"
                      title="Only positive integers allowed"
                      className="form-control"
                      id="checkout_otp"
                      placeholder="Eg. 0500000000 *"
                      name="billingAddress.mobile"
                      value={formData.billingAddress.mobile}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkout_phone">Mobile Number (Eg. 0500000000)*</label>
                  </div>
                    {/* {OTPError ? <div style={{ color: 'red' }}>{OTPError}</div> : <div style={{ color: 'green' }}>{OTPSuccess}</div>}
                    {isOTPButton ? <button
                      className="btn btn-primary w-100 text-uppercase"
                      type="button"
                      disabled={isSendOTPLoading}
                      onClick={sendOTP}
                    >
                    {isSendOTPLoading ? 'Loading...' : 'Send OTP'}
                    </button> : <>{!isOTPVerified && <><div className="form-floating my-3">
                      <input
                        type="number"
                        className="form-control"
                        id="otp"
                        placeholder="Eg. 1234 *"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                      />
                      <label htmlFor="checkout_otp">OTP (Eg. 1234)*</label>
                    </div>
                    <button
                      className="btn btn-primary w-100 text-uppercase"
                      type="button"
                      disabled={isSendOTPLoading}
                      onClick={verifyOTP}
                    >
                  {isSendOTPLoading ? 'Loading...' : 'Verify OTP'}
                  </button></>}</>} */}
                </div>
                <div className="col-md-12">
                  {!isLoggedIn && <div className="form-check mt-3">
                    <input
                      className="form-check-input form-check-input_fill"
                      type="checkbox"
                      defaultValue=""
                      id="create_account"
                      onClick={(prev) => setCreateAccount(!createAccount)}
                      name="create_account"
                    />
                    <label className="form-check-label" htmlFor="create_account">
                      CREATE AN ACCOUNT?
                    </label>
                  </div>}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input form-check-input_fill"
                      type="checkbox"
                      defaultValue=""
                      id="ship_different_address"
                      onClick={handleCheckboxChange}
                      name="shipping"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="ship_different_address"
                    >
                      SHIP TO A DIFFERENT ADDRESS?
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mt-3 mb-3">
                  <textarea
                    className="form-control form-control_gray"
                    placeholder="Order Notes (optional)"
                    cols="30"
                    rows="8"
                    name="note"
                    onChange={handleChange}
                    value={ formData.note }
                  ></textarea>
                </div>
              </div>
              {createAccount && <div className="col-md-12">
                <div className="form-floating my-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password *"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="checkout_email">Password *</label>
                </div>
              </div>}
            </div>
            <div className="checkout__totals-wrapper">
              <div className="sticky-content">
                <div className="checkout__totals">
                  <h3>Your Order</h3>
                  <table className="checkout-cart-items">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>SUBTOTAL</th>
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
                        <th>SUBTOTAL</th>
                        <td>{totalPrice.toFixed(2)}{ currency.symbol }</td>
                      </tr>
                      <tr>
                        <th>SHIPPING</th>
                        <td>{freeShippingFlag ? 'You Got Free Shipping' : `Shipping Cost: ${ shippingServiceCharges[0].price }${ currency.symbol}`}</td>
                      </tr>
                      {/* <tr>
                        <th>SERVICE FEE</th>
                        <td>{ shippingServiceCharges[1].price }{ currency.symbol }</td>
                      </tr> */}
                      <tr>
                        <th>TOTAL</th>
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
                    <input
                        className="form-control mb-1"
                        type="text"
                        name="coupon_code"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={handleCouponChange}
                    />
                    {!couponData ? (
                        <input
                            className=""
                            type="button"
                            value="APPLY COUPON"
                            onClick={applyCoupon}
                        />
                    ) : (
                        <input
                            className=""
                            type="button"
                            value="REMOVE COUPON"
                            onClick={removeCoupon}
                        />
                    )}
                  {/* </form> */}
                  <br/><br/>
                  {/* <button className="btn btn-light">UPDATE CART</button> */}
                </div>
                <div className="checkout__payment-methods">
                  <div className="form-check">
                    <input
                      className="form-check-input form-check-input_fill"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_3"
                      value={'cod'}
                      checked={selectedOption === 'cod'}
                      onChange={handleRadioChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="checkout_payment_method_3"
                    >
                      Cash on delivery
                      {/* <span className="option-detail d-block">
                        Phasellus sed volutpat orci. Fusce eget lore mauris
                        vehicula elementum gravida nec dui. Aenean aliquam varius
                        ipsum, non ultricies tellus sodales eu. Donec dignissim
                        viverra nunc, ut aliquet magna posuere eget.
                      </span> */}
                    </label>
                  </div>
                  <div className="form-check">
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
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input form-check-input_fill"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_4"
                      value={'tabby'}
                      checked={selectedOption === 'tabby'}
                      onChange={handleRadioChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="checkout_payment_method_4"
                    >
                      Pay in 4. No interes, no fees.
                      <Image
                        src="/assets/images/paymentGateway/tabby.svg"
                        width="60"
                        height="50"
                        alt="Cropped Faux leather Jacket"
                      />
                      <button style={{ 'border-radius': '50px', 'border': 'none' }} type="button" data-tabby-info="installments" data-tabby-price={finalPriceState && finalPriceState} data-tabby-currency="SAR">?</button>
                    </label>
                    {selectedOption == 'tabby' && <><div id="tabbyCard"></div></>}
                  </div> 
                  <div className="policy-text">
                    Your personal data will be used to process your order, support
                    your experience throughout this website, and for other
                    purposes described in our
                    <Link href={`/${locale}/privacy`} target="_blank">
                      privacy policy
                    </Link>
                    .
                  </div><br/>
                  <input type="checkbox" required/>&nbsp;&nbsp;
                    <span>I have read and agree to the website <Link href="https://www.ahmedalmaghribi.com/terms-and-condition/" target="_blank">terms and conditions</Link> </span>*
                </div>
                {error ? <div style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}
                <button
                  className="btn btn-primary w-100 text-uppercase"
                  type="submit"
                  disabled={isLoading}
                >
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
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_first_name"
                        placeholder="First Name"
                        name="shippingAddress.first_name"
                        value={formData.shippingAddress.first_name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_first_name">First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_last_name"
                        placeholder="Last Name"
                        name="shippingAddress.last_name"
                        value={formData.shippingAddress.last_name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_last_name">Last Name</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="search-field my-3">
                      <div
                        className={`form-label-fixed hover-container ${
                          idDDActive ? "js-content_visible" : ""
                        }`}
                      >
                        <label htmlFor="country" className="form-label">
                          Country / Region*
                        </label>
                        <div className="js-hover__open">
                          <input
                            type="text"
                            className="form-control form-control-lg search-field__actor"
                            id="country"
                            name="shippingAddress.country"
                            value="Saudi Arabia"
                            readOnly
                            placeholder="Saudi Arabia"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_street_address"
                        placeholder="Address *"
                        name="shippingAddress.area"
                        value={formData.shippingAddress.area}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_company_name">
                        Area / Mantaqa *
                      </label>
                    </div>
                    <div className="form-floating mt-3 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_street_address_2"
                        placeholder="Building / Villa / Apartment"
                        name="shippingAddress.building"
                        value={formData.shippingAddress.building}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_company_name">
                        Building / Villa / Apartment
                      </label>
                    </div>
                  </div>

                  {/* <div className="col-md-12">
                    <div className="search-field my-3">
                      <div
                        className={`form-label-fixed hover-container ${
                          idDDActive ? "js-content_visible" : ""
                        }`}
                      >
                        <label htmlFor="search-dropdown" className="form-label">
                          Emirates*
                        </label>
                        <div className="js-hover__open">
                          <input
                            type="text"
                            className="form-control form-control-lg search-field__actor search-field__arrow-down"
                            id="search-dropdown"
                            name="shippingAddress.emirates"
                            value={formData.shippingAddress.emirates}
                            readOnly
                            placeholder="Select Emirate..."
                            onClick={() => setIdDDActive((pre) => !pre)}
                            required
                          />
                        </div>
                        <div className="filters-container js-hidden-content mt-2">
                          <div className="search-field__input-wrapper">
                            <input
                              type="text"
                              className="search-field__input form-control form-control-sm bg-lighter border-lighter"
                              placeholder="Search"
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                              }}
                            />
                          </div>
                          <ul className="search-suggestion list-unstyled">
                            {countries
                              .filter((elm) =>
                                elm
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              )
                              .map((elm, i) => (
                                <li
                                id="shippingAddress.emirates"
                                  onClick={(e) => {
                                    handleEmiratesChange(e, elm);
                                    setIdDDActive(false);
                                  }}
                                  key={i}
                                  className="search-suggestion__item js-search-select"
                                >
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
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_province"
                        placeholder="Province *"
                        name="shippingAddress.province"
                        value={formData.shippingAddress.province}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_province">
                        Province *
                      </label>
                    </div>
                    {/* <div className="form-floating mt-3 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="checkout_street_address_2"
                        placeholder="Building / Villa / Apartment"
                        name="shippingAddress.building"
                        value={formData.shippingAddress.building}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_company_name">
                        Building / Villa / Apartment
                      </label>
                    </div> */}
                  </div>

                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="email"
                        className="form-control"
                        id="checkout_email"
                        placeholder="Your Mail *"
                        name="shippingAddress.email"
                        value={formData.shippingAddress.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkout_email">Email Address *</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input
                        type="text"
                        pattern="^\d{10}$"
                        title="Only positive integers allowed"
                        className="form-control"
                        id="checkout_phone"
                        placeholder="Eg. 0500000000 *"
                        name="shippingAddress.mobile"
                        value={formData.shippingAddress.mobile}
                        onChange={handleChange}
                        required
                      />
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
