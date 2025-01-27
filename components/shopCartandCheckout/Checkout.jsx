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
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import he from 'he';
import { products1 } from "@/data/products/fashion";
import { useRouter } from 'next/navigation';
import { useLocale } from "next-intl";
import Pagination1 from "../common/Pagination1";

export default function Checkout() {
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const router = useRouter();
  const locale = useLocale();

  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext } = useContextElement();
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
      country: 'AE',
      area: '',
      building: '',
      emirates: ''
    },
    billingAddress: {
      first_name: '',
      last_name: '',
      mobile: '',
      email: '',
      country: 'AE',
      area: '',
      building: '',
      emirates: ''
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
        shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', emirates: '' }
      }
    });
  };

  const handleEmiratesChange = (event, emirates) => {
    const { id } = event.target;
    // console.log(id, emirates);
    if (id.startsWith('shipping') || id.startsWith('billing')) {
      const addressField = id.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const fieldName = id.split('.')[1]; // Get the specific field (e.g., street, city)
      setFormData((prevData) => {
        return {
          ...prevData,
          [addressField]: {
            ...prevData[addressField],
            [fieldName]: emirates,
          },
        };
      });
    }
  };
 
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
        throw new Error('Failed to submit the data. Please try again.');
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
            emirates: ''
          },
          billingAddress: {
            first_name: '',
            last_name: '',
            mobile: '',
            email: '',
            area: '',
            building: '',
            emirates: ''
          },
          shippingAdd: false,
        });
        setTimeout(() => router.push(`/${locale}/shop-order-complete`), 1000);
      } else if(data.message && data.message.split(' ')[0] == 'Redirecting') {
        setSuccess(data.message);
        setError(null);
        // localStorage.setItem('orderData', btoa(JSON.stringify(data)));
        router.push(data.redirect_url);
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
        if(data['billingAddress.emirates']) {
          setError(data['billingAddress.emirates']);
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
      if(item.coupon?.code == couponCode) {
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
    else if(!isOTPVerified) {
      setCouponError('Verify Mobile Number First');
      setCouponSuccess(null);
      return;
    }
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
    } else if(elm?.coupon && couponData != null && couponCode != null) {
      console.log('else if');
      if(new Date(current_date_time) >= new Date(elm.coupon.start_date) && new Date(current_date_time) <= new Date(elm.coupon.end_date)) {
        return <td><span className="money price price-old">{elm?.price}{ currency.symbol }</span><span className="money price price-sale">{((elm.price - (elm.price / 100 * elm.coupon.value)) * elm.quantity).toFixed(2)}{ currency.symbol }</span></td>;
      } else {
        return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
      }
    } else if(elm?.sale_price) {
      console.log('else if 2');
      return <td>{((elm.price - (elm.price / 100 * elm.sale_price)) * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    } else {
      console.log('else');
      return <td>{(elm.price * elm.quantity).toFixed(2)}{ currency.symbol }</td>;
    }
  };

  return (
    <>
    {cartProducts.length ? (
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
                        value="United Arab Emirates"
                        readOnly
                        placeholder="United Arab Emirates"
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

              <div className="col-md-12">
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
                    type="tel"
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
                  {OTPError ? <div style={{ color: 'red' }}>{OTPError}</div> : <div style={{ color: 'green' }}>{OTPSuccess}</div>}
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
                </button></>}</>}
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
                    <tr>
                    <th>SERVICE FEE</th>
                    <td>{ shippingServiceCharges[1].price }{ currency.symbol }</td>
                    </tr>
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
                  {couponError ? <div style={{ color: 'red' }}>{couponError}</div> : <div style={{ color: 'green' }}>{couponSuccess}</div>}
                  <input
                    className="form-control"
                    type="text"
                    name="coupon_code"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={handleCouponChange}
                  />
                  {
                    !couponData ? <input
                      className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4 my-5"
                      type="button"
                      value="APPLY COUPON"
                      onClick={applyCoupon}
                    /> : <input
                      className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4 my-5"
                      type="button"
                      value="REMOVE COUPON"
                      onClick={removeCoupon}
                    />
                  }
                {/* </form> */}
                <br/>
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
                    value={'paytabs'}
                    checked={selectedOption === 'paytabs'}
                    onChange={handleRadioChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="checkout_payment_method_4"
                  >
                    PayTabs - Credit / Debit Card
                    <Image
                      src="https://www.ahmedalmaghribi.com/wp-content/plugins/paytabs-woocommerce/icons/creditcard.svg"
                      width="100"
                      height="20"
                      alt="Cropped Faux leather Jacket"
                    />
                    {/* <span className="option-detail d-block">
                      Phasellus sed volutpat orci. Fusce eget lore mauris
                      vehicula elementum gravida nec dui. Aenean aliquam varius
                      ipsum, non ultricies tellus sodales eu. Donec dignissim
                      viverra nunc, ut aliquet magna posuere eget.
                    </span> */}
                  </label>
                </div>
                <div className="policy-text">
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our
                  <Link href="/terms" target="_blank">
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
                disabled={isDisabled || isLoading}
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
                          value="United Arab Emirates"
                          readOnly
                          placeholder="United Arab Emirates"
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

                <div className="col-md-12">
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
                      type="number"
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
