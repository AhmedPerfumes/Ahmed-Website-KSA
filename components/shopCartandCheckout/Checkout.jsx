"use client";

import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { useMenu } from '@/context/MenuContext';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import he from 'he';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from "next-intl";
import Pagination1 from "../common/Pagination1";
import TamaraWidget from "@/components/TamaraWidget";
import FreeGiftFeature from '@/components/FreeGiftFeature';
import BogoFeature from "@/components/BogoFeature";
import ApplePayWidget from "@/components/shopCartandCheckout/ApplePayWidget";
import { lookupShortAddress, isValidShortAddress } from "@/utlis/saudiAddress";
import { SAUDI_CITIES, SAUDI_REGIONS, regionForCity } from "@/data/saudiCities";

// Section 1 billing field rules — shared by Continue and live re-validation on change
const required = v => (v || '').trim() ? null : 'required';
const billingRules = {
  first_name: required,
  last_name: required,
  email: required,
  area: required,
  province: required,
  mobile: v => /^\d{10}$/.test(v || '') ? null : 'invalidMobileDigits',
  // Compulsory — must be 4 letters + 4 numbers (e.g. ABCD1234)
  short_national_address: v => {
    const val = (v || '').trim();
    if (!val) return 'required';
    return /^[A-Za-z]{4}[0-9]{4}$/.test(val) ? null : 'snaFormat';
  },
};

// Android Arabic keyboards emit Arabic-Indic digits and autofill may add +966/spaces —
// convert to a plain local 05XXXXXXXX string so the 10-digit check passes
const toLatinDigits = v => String(v || '')
  .replace(/[٠-٩]/g, c => c.charCodeAt(0) - 0x0660)
  .replace(/[۰-۹]/g, c => c.charCodeAt(0) - 0x06F0);
const normalizeMobile = v => {
  let d = toLatinDigits(v).replace(/\D/g, '');
  // Strip country code only once the full number is present, so typing "+966…" isn't wiped mid-entry
  if (d.length === 14 && d.startsWith('00966')) d = d.slice(5);
  else if (d.length === 12 && d.startsWith('966')) d = d.slice(3);
  if (d.length === 9 && d.startsWith('5')) d = '0' + d;
  return d;
};

export default function Checkout() {
  /* ------------------------------------------------------------------ */
  /*  STATE                                                               */
  /* ------------------------------------------------------------------ */
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  // Logged-in accounts registered with a single-word name have no last name — show name inputs for them
  const [needsName, setNeedsName] = useState(false);
  // Card (mada / Apple Pay) pre-selected — the most used method in KSA; one less tap
  // No payment method pre-selected — the customer must choose one
  const [selectedOption, setSelectedOption] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Accordion UI state: 2 sections (Delivery+OTP inline, Payment)
  const [activeSection, setActiveSection] = useState(1);  // 1 | 2
  const [doneSection1, setDoneSection1] = useState(false);

  // Collapsible panels inside sections
  const [showNote, setShowNote] = useState(false);
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);          // desktop: visible by default
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  // OTP helpers: auto-send once per number, resend cooldown, reset if the number changes
  const [otpCooldown, setOtpCooldown] = useState(0);
  const lastOtpMobileRef = useRef('');
  const verifiedMobileRef = useRef('');
  const detailsTrackedRef = useRef(false);
  // Guests go through steps (Contact → Delivery → Payment); logged-in customers keep one page
  const [guestStep, setGuestStep] = useState(1);
  const [stepsDone, setStepsDone] = useState({ 1: false, 2: false });
  const stepMountedRef = useRef(false);

  // Inline address-edit modal (logged-in users)
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrList, setAddrList] = useState([
    { id: -1, name: '', email: '', mobile: '', area: '', building: '', building_name: '', province: '', short_national_address: '', isDefault: false },
    { id: -1, name: '', email: '', mobile: '', area: '', building: '', building_name: '', province: '', short_national_address: '', isDefault: false },
  ]);
  const [editingAddrIdx, setEditingAddrIdx] = useState(null); // null=list view, 0|1=edit form
  const [addrForm, setAddrForm] = useState({});
  const [addrFormErrors, setAddrFormErrors] = useState({});
  const [addrSaving, setAddrSaving] = useState(false);
  const [lookupLoading, setLookupLoading] = useState({ billing: false, shipping: false, modal: false });
  const [lookupStatus, setLookupStatus] = useState({ billing: null, shipping: null, modal: null });
  const lookupDebounceRef = useRef({});

  const [formData, setFormData] = useState({
    shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', building_name: '', province: '', short_national_address: '' },
    billingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', building_name: '', province: '', short_national_address: '' },
    shippingAdd: false,
    note: '',
    password: '',
    otp: ''
  });

  /* ------------------------------------------------------------------ */
  /*  CONTEXT & HOOKS                                                     */
  /* ------------------------------------------------------------------ */
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext, setCartProducts, removeGiftFromCart, promotionsContext } = useContextElement();
  const router = useRouter();
  const locale = useLocale();
  const { isLoggedIn } = useUser();
  const hasFetchedRef = useRef(false);
  const hasTrackedBeginCheckout = useRef(false);
  const t = useTranslations();
  const tc = useTranslations('CheckoutPage');

  const shippingLoaded = Array.isArray(shippingServiceCharges) && shippingServiceCharges.length >= 2;
  // Admin-managed charges (shipping_service_charges): [0] shipping · [1] service fee · [2] COD fee · [3] free-shipping threshold
  const shippingFee = shippingLoaded && !freeShippingFlag ? parseFloat(shippingServiceCharges[0].price) || 0 : 0;
  const serviceFee = shippingLoaded ? parseFloat(shippingServiceCharges[1].price) || 0 : 0;
  const codFeeSetting = shippingLoaded ? parseFloat(shippingServiceCharges[2]?.price) || 0 : 0;
  const codFee = selectedOption === 'cod' ? codFeeSetting : 0;
  const vatRate = (parseFloat(vatTax?.percentage) || 0) / 100;
  const grandTotalNum = totalPrice + shippingFee + serviceFee + codFee; // all prices are VAT-inclusive
  const grandTotal = grandTotalNum.toFixed(2);
  const vatAmount = shippingLoaded ? (grandTotalNum - grandTotalNum / (1 + vatRate)).toFixed(2) : '0.00';
  const shippingCostDisplay = shippingLoaded ? shippingServiceCharges[0].price : '...';

  // Never silently disable — Place Order validates and tells the customer what is missing
  const disablePlaceOrder = isLoading;

  /* ------------------------------------------------------------------ */
  /*  EFFECTS                                                             */
  /* ------------------------------------------------------------------ */
  const removeGiftFromCartRef = useRef(removeGiftFromCart);
  useEffect(() => {
    removeGiftFromCartRef.current = removeGiftFromCart;
  });

  // Clean up FOC gifts when leaving checkout — runs ONLY on unmount (empty deps [])
  useEffect(() => {
    return () => {
      removeGiftFromCartRef.current?.();
    };
  }, []);

  const hasCleaned = useRef(false);
  useEffect(() => {
    if (hasCleaned.current) return;
    // Check if any regular (non-gift, non-free) products are in BOGO
    const hasBogoRegularItems = cartProducts.some((item) =>
      !item.is_gift &&
      promotionsContext?.some((promo) => promo.buy_products?.some((buyItem) => buyItem.product_id === item.product_id))
    );

    if (!hasBogoRegularItems) {
      // Only remove coupon properties from products that have no BOGO and no discount
      const cleanedCart = cartProducts.map((item) => {
        const hasDiscount = item.discount != null;
        if (!hasDiscount) {
          const { is_coupon, value, ...rest } = item;
          return rest;
        }
        return item;
      });
      setCartProducts(cleanedCart);
      setCouponDataContext(null);
      hasCleaned.current = true; // prevent future runs
    }
  }, [cartProducts, promotionsContext, setCartProducts, setCouponDataContext]);

  // First-party AhmedTracker: begin_checkout on checkout load
  useEffect(() => {
    if (typeof window !== "undefined" && window.AhmedTracker && cartProducts?.length > 0 && !hasTrackedBeginCheckout.current) {
      hasTrackedBeginCheckout.current = true;
      const b = formData.billingAddress || {};
      window.AhmedTracker.track("begin_checkout", {
        total: parseFloat(totalPrice || 0),
        items_count: cartProducts.length,
        email: b.email || null,
        phone: b.mobile || null,
        customer_phone: b.mobile || null,
        customer_name: `${b.first_name || ''} ${b.last_name || ''}`.trim() || null,
        items: cartProducts.map((i) => ({
          product_id: (i.product_id || i.id)?.toString(),
          product_name: i.product_name || i.name || "",
          price: parseFloat(i.price || 0),
          quantity: i.quantity || 1,
        })),
      });
    }
  }, [cartProducts?.length, totalPrice]);

  // Pre-fill form for logged-in users — but do NOT auto-skip.
  // User must still review and click Continue → to ensure address is complete.
  useEffect(() => {
    if (!isLoggedIn) return;
    let firstName = '', lastName = '', email = '', mobile = '', area = '', building = '', building_name = '', province = '', short_national_address = '';
    let customerId = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(atob(userStr));
      customerId = u.id;
      email = u.email || ''; mobile = u.phone || u.mobile || '';
      const parts = (u.name || '').split(' ');
      firstName = parts[0] || ''; lastName = parts.slice(1).join(' ') || '';
    }
    const addrStr = localStorage.getItem('address');
    if (addrStr) {
      const a = JSON.parse(atob(addrStr));
      area = a.city || ''; building = a.address || ''; building_name = a.area || a.building_name || ''; province = a.state || ''; short_national_address = a.short_national_address || '';
    }
    // Only pre-fill — do NOT setDoneSection1 or setActiveSection
    setNeedsName(!firstName.trim() || !lastName.trim());
    setFormData(p => ({
      ...p,
      billingAddress: { ...p.billingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, building_name, province, short_national_address },
      shippingAddress: { ...p.shippingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, building_name, province },
    }));

    // Fetch both addresses for the inline modal
    if (customerId) {
      const defaultInfo = { name: `${firstName} ${lastName}`.trim(), email, mobile };
      fetch(`${process.env.NEXT_PUBLIC_API_URL}api/customerAddressDetails`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId }),
      })
        .then(r => r.json())
        .then(data => {
          const stored = localStorage.getItem('address');
          let defaultId = null;
          if (stored) { try { defaultId = JSON.parse(atob(stored)).id; } catch { } }
          const base = { id: -1, ...defaultInfo, area: '', building: '', building_name: '', province: '', short_national_address: '', isDefault: false };
          if (data.addresses && data.addresses.length) {
            const parsed = data.addresses.map(a => ({
              id: a.id,
              name: a.name || defaultInfo.name,
              email: a.email || defaultInfo.email,
              mobile: a.phone || defaultInfo.mobile,
              area: a.city || '',
              building: a.address || '',
              building_name: a.area || '', // DB area column stores Building data
              province: a.state || '',
              short_national_address: a.short_national_address || '',
              isDefault: defaultId !== null ? a.id === defaultId : a.is_default === 1,
            }));
            setAddrList([parsed[0] || { ...base }, parsed[1] || { ...base }]);
          } else {
            setAddrList([{ ...base }, { ...base }]);
          }
        }).catch(() => { });
    }
  }, [isLoggedIn]);


  // Fetch personalised coupons once mobile+email ready
  useEffect(() => {
    const { mobile, email } = formData.billingAddress;
    if (hasFetchedRef.current || !/^\d{10}$/.test(mobile) || !email) return;
    hasFetchedRef.current = true;
    const fetchCoupons = async () => {
      setCouponLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salesType: 'EComm', company: 'KSA', mobileNo: mobile, email }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const mapped = (Array.isArray(data.data) ? data.data : [])
          .filter(c => c.active)
          .map(c => ({ id: c.couponCode, code: c.couponCode, title: c.promotionName, description: `${c.value}${c.baseOn === 'Percent' ? '%' : ' SAR'} off`, value: c.value, coupon_type: c.baseOn?.toLowerCase() === 'percent' ? 'percent' : 'amount', type: 'customer', end_date: c.validTo, start_date: c.registrationDate, couponRegistrationId: c.couponRegistrationId, couponId: c.couponId, salesType: c.salesType, company: c.company, whsCode: c.whsCode }));
        setCoupons(mapped);
      } catch { setCoupons([]); } finally { setCouponLoading(false); }
    };
    fetchCoupons();
  }, [formData.billingAddress.email, formData.billingAddress.mobile]);

  // Tabby card / promo
  useEffect(() => {
    const addScript = (src, onload) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      if (onload) s.onload = onload;
      document.body.appendChild(s);
      return s;
    };
    const finalPrice = shippingLoaded
      ? (!freeShippingFlag ? parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price) : totalPrice + parseFloat(shippingServiceCharges[1].price))
      : totalPrice;
    const s1 = addScript('https://checkout.tabby.ai/tabby-card.js', () => {
      new window.TabbyCard({ selector: '#tabbyCard', currency: 'SAR', lang: locale === 'ar' ? 'ar' : 'en', price: finalPrice, size: 'wide', theme: 'black', header: true });
    });
    const s2 = addScript('https://checkout.tabby.ai/tabby-promo.js');
    return () => { document.body.removeChild(s1); document.body.removeChild(s2); };
  }, [selectedOption]);

  // Guest: send the code automatically once a full mobile number is entered (once per number)
  useEffect(() => {
    if (isLoggedIn || isOTPVerified || isSendOTPLoading) return;
    const m = formData.billingAddress.mobile;
    if (!/^05\d{8}$/.test(m) || lastOtpMobileRef.current === m) return;
    const id = setTimeout(() => sendOTP(), 700);
    return () => clearTimeout(id);
  }, [formData.billingAddress.mobile, isLoggedIn, isOTPVerified]);

  // Resend countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const id = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [otpCooldown]);

  // Verify automatically when the 4-digit code is complete (typed or SMS autofill)
  useEffect(() => {
    if (isLoggedIn || isOTPVerified || isSendOTPLoading) return;
    if (/^\d{4}$/.test(formData.otp || '')) verifyOTP();
  }, [formData.otp]);

  useEffect(() => {
    if (!stepMountedRef.current) { stepMountedRef.current = true; return; }
    if (isLoggedIn) return;
    const el = document.getElementById(`cc-step-${guestStep}`);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [guestStep]);

  const handleRadioChange = e => {
    setSelectedOption(e.target.value);
    if (error === tc('choosePayment')) {
      setError(null);
    }
  };

  const handleLookup = async (target, codeToLookup) => {
    const code = (codeToLookup || '').trim().toUpperCase();
    if (!isValidShortAddress(code)) {
      setLookupStatus(prev => ({
        ...prev,
        [target]: { success: false, message: locale === 'ar' ? 'رمز غير مكتمل (مثال: ABCD1234)' : 'Enter 4 letters + 4 digits (e.g. ABCD1234)' }
      }));
      return;
    }

    setLookupLoading(prev => ({ ...prev, [target]: true }));
    setLookupStatus(prev => ({ ...prev, [target]: null }));

    try {
      const res = await lookupShortAddress(code, locale);
      if (res.isValid && res.city) {
        if (target === 'billing') {
          setFormData(p => ({
            ...p,
            billingAddress: {
              ...p.billingAddress,
              short_national_address: code,
              area: res.city,
              province: regionForCity(res.city) || res.city,
              building: [res.street, res.district].filter(Boolean).join(', ') || res.formattedAddress || p.billingAddress.building,
              building_name: res.buildingNumber || p.billingAddress.building_name,
              postalCode: res.postalCode || '',
            }
          }));
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.short_national_address;
            delete next.area;
            delete next.province;
            delete next.building;
            return next;
          });
        } else if (target === 'shipping') {
          setFormData(p => ({
            ...p,
            shippingAddress: {
              ...p.shippingAddress,
              short_national_address: code,
              area: res.city,
              province: regionForCity(res.city) || res.city,
              building: [res.street, res.district].filter(Boolean).join(', ') || res.formattedAddress || p.shippingAddress.building,
              building_name: res.buildingNumber || p.shippingAddress.building_name,
              postalCode: res.postalCode || '',
            }
          }));
        } else if (target === 'modal') {
          setAddrForm(p => ({
            ...p,
            short_national_address: code,
            area: res.city,
            province: regionForCity(res.city) || res.city,
            building: [res.street, res.district].filter(Boolean).join(', ') || res.formattedAddress || p.building,
            building_name: res.buildingNumber || p.building_name,
            postalCode: res.postalCode || '',
          }));
          setAddrFormErrors(prev => {
            const next = { ...prev };
            delete next.short_national_address;
            delete next.area;
            delete next.province;
            delete next.building;
            return next;
          });
        }

        setLookupStatus(prev => ({
          ...prev,
          [target]: {
            success: true,
            message: locale === 'ar'
              ? `✓ تم التحقق: ${res.city}${res.district ? ' - ' + res.district : ''}`
              : `✓ Verified: ${res.city}${res.district ? ' - ' + res.district : ''}`
          }
        }));
      } else {
        setLookupStatus(prev => ({
          ...prev,
          [target]: { success: false, message: res.message || (locale === 'ar' ? 'لم يتم العثور على عنوان لهذا الرمز' : 'Address not found for this code') }
        }));
      }
    } catch (e) {
      console.error(e);
      setLookupStatus(prev => ({
        ...prev,
        [target]: { success: false, message: locale === 'ar' ? 'تعذر التحقق تلقائياً' : 'Could not verify automatically' }
      }));
    } finally {
      setLookupLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleChange = e => {
    let { name, value } = e.target;
    if (name.startsWith('shipping') || name.startsWith('billing')) {
      const addr = name.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const field = name.split('.')[1];
      if (field === 'mobile') {
        value = normalizeMobile(value);
        // Guest changed the number after verifying — the code belonged to the old number
        if (addr === 'billingAddress' && !isLoggedIn && isOTPVerified && value !== verifiedMobileRef.current) {
          setIsOTPVerified(false); setIsOTPButton(true); setOTPSuccess(null); setOTPError(null);
          setFormData(p => ({ ...p, otp: '' }));
        }
      }
      // Picking a known city fills the region automatically
      if (field === 'area') {
        const reg = regionForCity(value);
        if (reg) {
          setFormData(p => ({ ...p, [addr]: { ...p[addr], province: reg } }));
          if (addr === 'billingAddress') setFieldErrors(prev => { const next = { ...prev }; delete next.province; return next; });
        }
      }
      // Re-check a flagged billing field as the user types/autofills so stale errors clear
      if (addr === 'billingAddress' && fieldErrors[field] && billingRules[field]) {
        const msg = billingRules[field](value);
        setFieldErrors(prev => {
          const next = { ...prev };
          if (msg) next[field] = msg; else delete next[field];
          return next;
        });
      }
      if (field === 'short_national_address') {
        value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length === 8 && isValidShortAddress(value)) {
          const target = name.startsWith('shipping') ? 'shipping' : 'billing';
          clearTimeout(lookupDebounceRef.current[target]);
          lookupDebounceRef.current[target] = setTimeout(() => {
            handleLookup(target, value);
          }, 350);
        }
      }
      // Clear flags that have no live rule as soon as the field has content
      const looseKey = addr === 'shippingAddress' ? `ship_${field}` : (field === 'building' ? 'building' : null);
      if (looseKey && fieldErrors[looseKey]) {
        const ok = field === 'mobile' ? /^\d{10}$/.test(value) : !!String(value).trim();
        if (ok) setFieldErrors(prev => { const next = { ...prev }; delete next[looseKey]; return next; });
      }
      setFormData(p => ({ ...p, [addr]: { ...p[addr], [field]: value } }));
    } else {
      if (name === 'otp') value = toLatinDigits(value);
      setFormData(p => ({ ...p, [name]: value }));
    }
  };


  /* ── Inline address modal handlers ── */
  const openAddrModal = () => { setEditingAddrIdx(null); setAddrFormErrors({}); setShowAddrModal(true); };

  const startEditAddr = idx => { setAddrForm({ ...addrList[idx] }); setAddrFormErrors({}); setEditingAddrIdx(idx); };

  // No saved address yet — skip the empty list and open the form for the first slot as default
  const openAddFirstAddr = () => {
    setAddrForm({ ...addrList[0], isDefault: true }); setAddrFormErrors({}); setEditingAddrIdx(0); setShowAddrModal(true);
  };

  const handleAddrFormChange = e => {
    let { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;
    if (name === 'short_national_address' && typeof finalVal === 'string') {
      finalVal = finalVal.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (finalVal.length === 8 && isValidShortAddress(finalVal)) {
        clearTimeout(lookupDebounceRef.current.modal);
        lookupDebounceRef.current.modal = setTimeout(() => {
          handleLookup('modal', finalVal);
        }, 350);
      }
    }
    setAddrForm(f => {
      const next = { ...f, [name]: finalVal };
      if (name === 'area') { const reg = regionForCity(finalVal); if (reg) next.province = reg; }
      return next;
    });
  };

  const selectAddrAsDefault = idx => {
    // Mark chosen address as default, update localStorage + re-hydrate formData
    const chosen = addrList[idx];
    const updated = addrList.map((a, i) => ({ ...a, isDefault: i === idx }));
    setAddrList(updated);
    localStorage.setItem('address', btoa(JSON.stringify({
      id: chosen.id, name: chosen.name, email: chosen.email, phone: chosen.mobile,
      state: chosen.province, city: chosen.area, address: chosen.building,
      area: chosen.building_name || '', building_name: chosen.building_name || '',
      short_national_address: chosen.short_national_address, is_default: 1,
    })));
    // Re-hydrate formData so the address card shows the selected address
    const parts = (chosen.name || '').split(' ');
    setFormData(p => ({
      ...p,
      billingAddress: {
        // Keep the name already entered when the saved name is a single word
        ...p.billingAddress, first_name: parts[0] || p.billingAddress.first_name, last_name: parts.slice(1).join(' ') || p.billingAddress.last_name,
        email: chosen.email, mobile: chosen.mobile, area: chosen.area, building: chosen.building,
        building_name: chosen.building_name || '',
        province: chosen.province, short_national_address: chosen.short_national_address
      },
    }));
    setFieldErrors(prev => { const next = { ...prev }; delete next._address; return next; });
    setShowAddrModal(false);
  };

  const saveAddrForm = async () => {
    const errs = {};
    if (!addrForm.area?.trim()) errs.area = 'cityRequired';
    if (!addrForm.building?.trim()) errs.building = 'fullAddressRequired';
    if (!addrForm.province?.trim()) errs.province = 'provinceRequired';
    // Short National Address is compulsory
    if (!addrForm.short_national_address?.trim()) {
      errs.short_national_address = 'snaRequiredShort';
    } else if (!/^[A-Za-z]{4}[0-9]{4}$/.test(addrForm.short_national_address.trim())) {
      errs.short_national_address = 'snaMust';
    }
    if (Object.keys(errs).length) { setAddrFormErrors(errs); return; }
    setAddrFormErrors({});
    setAddrSaving(true);

    const otherIdx = editingAddrIdx === 0 ? 1 : 0;
    const updated = [...addrList];
    updated[editingAddrIdx] = { ...addrForm };
    if (addrForm.isDefault) updated[otherIdx] = { ...updated[otherIdx], isDefault: false };

    // Update localStorage if this is now default
    const defaultAddr = updated.find(a => a.isDefault);
    if (defaultAddr) {
      localStorage.setItem('address', btoa(JSON.stringify({
        id: defaultAddr.id, name: defaultAddr.name, email: defaultAddr.email, phone: defaultAddr.mobile,
        state: defaultAddr.province, city: defaultAddr.area, address: defaultAddr.building,
        area: defaultAddr.building_name || '', building_name: defaultAddr.building_name || '',
        short_national_address: defaultAddr.short_national_address, is_default: 1,
      })));
    }

    // ALWAYS re-hydrate checkout formData from the just-edited address
    // (so the address card in checkout reflects the change immediately)
    const refill = addrForm;
    const parts = (refill.name || '').split(' ');
    setFormData(p => ({
      ...p,
      billingAddress: {
        ...p.billingAddress, first_name: parts[0] || p.billingAddress.first_name, last_name: parts.slice(1).join(' ') || p.billingAddress.last_name,
        email: refill.email || p.billingAddress.email, mobile: refill.mobile || p.billingAddress.mobile, area: refill.area, building: refill.building,
        building_name: refill.building_name || '',
        province: refill.province, short_national_address: refill.short_national_address
      },
    }));

    setAddrList(updated);
    setFieldErrors(prev => { const next = { ...prev }; delete next._address; return next; });

    // API save — same payload as EditAddress.jsx
    try {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      const cid = userRaw ? JSON.parse(atob(userRaw)).id : null;
      if (cid) {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/customerAddressUpdate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify({
            address_id: addrForm.id,
            customer_id: cid,
            name: addrForm.name,
            email: addrForm.email,
            mobile: addrForm.mobile,
            address: addrForm.building,
            area: addrForm.building_name || '', // area column saves Building data
            building: addrForm.building_name || '',
            city: addrForm.area,
            state: addrForm.province,
            short_national_address: addrForm.short_national_address,
            is_default: addrForm.isDefault ? 1 : 0,
          }),
        });
        const res = await resp.json();
        if (res?.error === 'Unauthorized' || res?.message === 'Unauthorized') {
          localStorage.removeItem('token'); localStorage.removeItem('user');
        }
      }
    } catch { }

    setAddrSaving(false);
    setEditingAddrIdx(null); // back to list view in modal
  };


  const handleCouponChange = e => {
    setCouponCode(e.target.value);
    setCouponSuccess(null); setCouponData(null); setCouponDataContext(null);
    setCartProducts(cartProducts.map(({ is_coupon, value, ...rest }) => rest));
  };

  const handleSelectCoupon = (code, id) => {
    setCouponCode(code); setCopiedId(id); setShowCouponModal(false);
    setTimeout(() => setCopiedId(null), 1400);
  };

  const removeCoupon = () => {
    setCouponCode(''); setCouponSuccess(null); setCouponData(null); setCouponDataContext(null);
    setCartProducts(cartProducts.map(({ is_coupon, value, ...rest }) => rest));
  };

  const applyCoupon = async e => {
    e.preventDefault();
    const user = isLoggedIn ? JSON.parse(atob(localStorage.getItem('user'))) : null;
    if (!couponCode.trim()) { setCouponError(tc('couponRequired')); return; }
    if (!isOTPVerified && !isLoggedIn) { setCouponError(tc('verifyMobileFirst')); return; }
    const eligibleItems = cartProducts.filter(i => {
      const isBogoProduct = promotionsContext?.some((promo) => promo.buy_products?.some((buyItem) => buyItem.product_id === i.product_id));
      return !i.discount && !isBogoProduct && !i.is_gift && !i.collection_name;
    });
    if (!eligibleItems.length) { setCouponError(tc('couponNotApplicable')); setCouponCode(''); return; }
    const validCoupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    const payload = { company: 'KSA', salesType: 'EComm', couponRegistrationId: validCoupon ? validCoupon.couponRegistrationId : 0, couponCode: validCoupon ? '' : couponCode.trim(), mobileNo: user?.phone || formData.billingAddress.mobile, email: user?.email || formData.billingAddress.email };
    const res = await fetch(`${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { setCouponError(tc('couponInvalid')); setCouponCode(''); return; }
    const data = await res.json();
    let apiCoupon = data.data?.[0];
    if (apiCoupon && !validCoupon) {
      apiCoupon = { id: apiCoupon.couponCode, code: apiCoupon.couponCode, title: apiCoupon.promotionName, value: apiCoupon.value, coupon_type: apiCoupon.baseOn === 'P' ? 'percent' : 'amount', type: 'customer', end_date: apiCoupon.validTo, start_date: apiCoupon.registrationDate, couponRegistrationId: apiCoupon.couponRegistrationId, salesType: apiCoupon.salesType, company: apiCoupon.company, whsCode: apiCoupon.whsCode };
    }
    const couponToApply = validCoupon || apiCoupon;
    if (!couponToApply) { setCouponError(tc('couponInvalid')); setCouponCode(''); return; }
    const updatedCartProducts = cartProducts.map(item => {
      const isBogoProduct = promotionsContext?.some((promo) => promo.buy_products?.some((buyItem) => buyItem.product_id === item.product_id));
      const isEligible = !item.discount && !isBogoProduct && !item.is_gift;
      return { ...item, ...(isEligible ? { is_coupon: true, value: couponToApply.value, coupon_type: couponToApply.coupon_type } : {}) };
    });
    setCartProducts(updatedCartProducts);
    setCouponError(null); setCouponData(couponToApply); setCouponDataContext(couponToApply);
    setCouponSuccess(tc('couponApplied', { code: couponToApply.code, title: couponToApply.title || '' }));
  };

  const mapProductsFromFormData = (products) => {
    const mapped = [];
    products.forEach((item) => {
      if (item.bogo_free_qty && item.bogo_free_qty > 0) {
        const paidQty = (item.quantity || 0) - item.bogo_free_qty;

        // Paid portion
        if (paidQty > 0) {
          mapped.push({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: paidQty,
            category_name: item.category_name,
            subcategory_name: item.subcategory_name,
            collection_name: item.collection_name || null,
            coupon: item.coupon,
            discount: null,
            _original_discount: item._original_discount || null,
            ...('is_coupon' in item && { is_coupon: item.is_coupon }),
            ...('coupon_type' in item && { coupon_type: item.coupon_type }),
            ...('value' in item && { value: item.value }),
          });
        }

        // BOGO free portion
        mapped.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.bogo_free_qty,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name,
          collection_name: item.collection_name || null,
          coupon: [],
          discount: null,
          is_gift: true,
          type: 'bogo',
          campaign: item.bogo_campaign,
        });
      } else {
        // Regular product (no BOGO)
        mapped.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name,
          collection_name: item.collection_name || null,
          coupon: item.coupon,
          discount: item.discount,
          ...('_original_discount' in item && { _original_discount: item._original_discount }),
          ...('is_coupon' in item && { is_coupon: item.is_coupon }),
          ...('is_gift' in item && { is_gift: item.is_gift }),
          ...('coupon_type' in item && { coupon_type: item.coupon_type }),
          ...('value' in item && { value: item.value }),
          ...('campaign' in item && { campaign: item.campaign }),
          ...('type' in item && { type: item.type }),
        });
      }
    });
    return mapped;
  };

  // storeOrder request body — shared by Place Order and the Apple Pay widget
  function buildOrderPayload(paymentMethod) {
    // COD fee applies only to cash on delivery, never to Apple Pay / card
    const method = paymentMethod || selectedOption || 'cod';
    const methodCodFee = method === 'cod' ? codFeeSetting : 0;
    const shippingPrice = freeShippingFlag ? 0.00 : parseFloat(shippingServiceCharges?.[0]?.price || 0);
    const shippingPriceVat = shippingPrice / 100 * (vatTax?.percentage || 15);
    const finalPrice = totalPrice + shippingFee + serviceFee + methodCodFee;
    const codPrice = methodCodFee;
    const codPriceVat = codPrice / 100 * (vatTax?.percentage || 15);
    const servicePrice = serviceFee + methodCodFee;
    const servicePriceVat = servicePrice / 100 * (vatTax?.percentage || 15);

    let userJson = null;
    if (isLoggedIn && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) userJson = JSON.parse(atob(raw));
      } catch (e) {
        console.error('Failed to parse user session in buildOrderPayload', e);
      }
    }

    const { shippingAdd, note, password, otp, ...cleanFormData } = formData;

    // Gift / different address: recipient email isn't asked for — use the customer's
    if (shippingAdd) {
      cleanFormData.shippingAddress = {
        ...cleanFormData.shippingAddress,
        email: cleanFormData.shippingAddress?.email || cleanFormData.billingAddress?.email,
        country: cleanFormData.shippingAddress?.country || 'KSA',
      };
    }

    // Primary collection tracking matching UAE implementation
    const primaryCollection = cartProducts.find((p) => p.collection_name)?.collection_name || null;

    return {
      ...cleanFormData,
      ...(primaryCollection ? { collection_name: primaryCollection } : {}),
      ...(note?.trim() ? { note: note.trim(), order_notes: note.trim() } : {}),
      products: mapProductsFromFormData(cartProducts),
      payment_method: method,
      shippingPrice,
      shippingPriceVat,
      servicePrice,
      servicePriceVat,
      codPrice,
      codPriceVat,
      vatTax: vatTax?.percentage || 15,
      totalPrice,
      finalPrice,
      customer_id: isLoggedIn && userJson ? userJson.id : null,
      locale,
      couponCode,
      couponData,
    };
  }

  // Synchronous pre-checks for Apple Pay (must run inside the click gesture).
  // Returns an error message, or null when the sheet may open.
  function validateBeforePay() {
    if (!cartProducts?.length || !shippingLoaded) return tc('applePayFailed');
    if (!validateDetails()) return tc('addressIncompleteTitle');
    // Short National Address is compulsory
    const sna = formData.billingAddress.short_national_address?.trim();
    if (!sna || !/^[A-Za-z]{4}[0-9]{4}$/.test(sna)) return tc('snaRequired');
    return null;
  }

  async function onOrder(event) {
    event.preventDefault();
    if (!isLoggedIn && guestStep < 3) { goNextStep(guestStep); return; }
    setError(null); setSuccess(null);
    if (!validateDetails()) return;

    if (!selectedOption || !selectedOption.trim()) {
      setError(tc('choosePayment'));
      document.querySelector('.cc-payment-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsLoading(true);

    try {
      if (!window.__placeOrderTracked && cartProducts?.length) {
        window.__placeOrderTracked = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'add_payment_info', ecommerce: { currency: 'SAR', value: parseFloat(totalPrice || 0), payment_type: selectedOption || 'cod', items: cartProducts.filter(i => !i.is_gift).map(i => ({ item_id: i.product_id?.toString(), item_name: i.product_name, price: parseFloat(i.price || 0), quantity: i.quantity || 1 })) } });
        if (typeof window.fbq === 'function') window.fbq('track', 'AddPaymentInfo', { content_ids: cartProducts.filter(i => !i.is_gift).map(i => i.product_id?.toString()), content_type: 'product', value: parseFloat(totalPrice || 0), currency: 'SAR' });

        if (typeof window !== "undefined" && window.AhmedTracker) {
          window.AhmedTracker.track("add_payment_info", {
            payment_type: selectedOption || 'cod',
            phone: formData.billingAddress?.mobile || null,
            customer_phone: formData.billingAddress?.mobile || null,
            email: formData.billingAddress?.email || null,
            customer_name: `${formData.billingAddress?.first_name || ''} ${formData.billingAddress?.last_name || ''}`.trim() || null,
            total: parseFloat(totalPrice || 0),
            items: cartProducts.filter(i => !i.is_gift).map(i => ({
              product_id: (i.product_id || i.id)?.toString(),
              product_name: i.product_name,
              price: parseFloat(i.price || 0),
              quantity: i.quantity || 1,
            })),
          });
        }
      }
    } catch (e) { }

    // Short National Address is compulsory
    const short_national_address = formData.billingAddress.short_national_address?.trim();
    if (!short_national_address || !/^[A-Za-z]{4}[0-9]{4}$/.test(short_national_address)) {
      setIsLoading(false);
      setError(tc('snaRequired'));
      return;
    }

    const additionalFields = buildOrderPayload(selectedOption);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`, {
        method: 'POST', body: JSON.stringify(additionalFields),
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (response.status === 401) {
        ['user', 'token'].forEach(k => localStorage.getItem(k) && localStorage.removeItem(k));
        setError(isLoggedIn ? tc('sessionExpiredLogin') : tc('verificationExpired'));
        setTimeout(() => window.location.reload(), 2000); return;
      }
      if (!response.ok) throw new Error(tc('sessionExpiredRefresh'));
      const data = await response.json();

      if (data.message?.split(' ')[0] === 'Order') {
        setSuccess(tc('orderPlaced')); setError(null);

        // Sanitize data.products using cartProducts to accurately preserve is_gift for each line item
        const sanitizedProducts = data.products?.map((item, idx) => {
          const originalCartItem = cartProducts[idx] || cartProducts.find((cp) => cp.product_id === item.product_id);
          return {
            ...item,
            is_gift: originalCartItem ? Boolean(originalCartItem.is_gift) : Boolean(item.is_gift),
            type: originalCartItem?.type || item.type,
          };
        });

        const orderCampaign = data.campaign || cartProducts?.map((cp) => cp.campaign || cp.bogo_campaign).find(Boolean) || null;

        setOrderDetails({
          ...data,
          campaign: orderCampaign,
          products: sanitizedProducts || data.products,
        });
        setFormData({ shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', building_name: '', province: '' }, billingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', building_name: '', province: '', short_national_address: '' }, shippingAdd: false });
        setTimeout(() => router.push(`/${locale}/shop-order-complete`), 1000);
      } else if (data.message === 'Redirecting to Payfort...') {
        setSuccess(tc('redirectingPayment')); setError(null);
        const form = document.createElement('form'); form.action = data.redirect_url; form.method = 'POST';
        Object.entries(data.request_params).forEach(([k, v]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; form.appendChild(i); });
        document.body.appendChild(form); form.submit(); return;
      } else if (data.message === 'Redirecting to Tabby...') { setSuccess(tc('redirectingPayment')); setError(null); router.push(data.redirect_url); }
      else if (data.message === 'Redirecting to Paytabs...') { setSuccess(tc('redirectingPayment')); setError(null); router.push(data.redirect_url); }
      else if (data.message === 'Redirecting to Tamara...') { setSuccess(tc('redirectingPayment')); setError(null); router.push(data.redirect_url); }
      else {
        const errField = ['qtyMessage', 'discountMessage', 'couponMessage', 'bogoMessage', 'duplicateOrderMessage', 'error', 'payment_method'].find(k => data[k]);
        if (errField) {
          const msg = Array.isArray(data[errField]) ? data[errField][0] : data[errField];
          setError(msg);
        }
        else {
          const fErr = ['products', 'billingAddress.first_name', 'billingAddress.last_name', 'billingAddress.email', 'billingAddress.mobile', 'billingAddress.area', 'billingAddress.province'].find(k => data[k]);
          if (fErr) setError(data[fErr]);
        }
        setSuccess(null);
      }
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  }

  async function sendOTP(e) {
    e?.preventDefault?.(); setIsSendOTPLoading(true);
    lastOtpMobileRef.current = formData.billingAddress.mobile;
    if (!formData.billingAddress.mobile) { setOTPError(tc('mobileRequired')); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    if (!/^\d{10}$/.test(formData.billingAddress.mobile)) { setOTPError(tc('invalidMobile')); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    setOTPError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/sendOTP`, { method: 'POST', body: JSON.stringify({ mobile: formData.billingAddress.mobile }), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(tc('otpSendFailed'));
      const data = await res.json();
      if (data.message?.split(' ')[0] === 'OTP') { setOTPSuccess(tc('otpSent')); setOTPError(null); setIsOTPButton(false); setOtpCooldown(30); }
      else { if (data.mobile) setOTPError(data.mobile); }
    } catch (err) { setOTPError(err.message); } finally { setIsSendOTPLoading(false); }
  }

  async function verifyOTP(e) {
    e?.preventDefault?.(); setIsSendOTPLoading(true);
    if (!formData.otp) { setOTPError(tc('otpRequired')); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    if (!/^\d+$/.test(formData.otp)) { setOTPError(tc('invalidOtp')); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    setOTPError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, { method: 'POST', body: JSON.stringify({ mobile: formData.billingAddress.mobile, otp: formData.otp, flag: 'checkout' }), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(tc('otpVerifyFailed'));
      const data = await res.json();
      if (data.message?.split(' ')[0] === 'Invalid') { setOTPSuccess(null); setOTPError(tc('invalidOtp')); }
      else if (data.message?.split(' ')[0] === 'OTP') {
        setOTPSuccess(data.message); setIsOTPVerified(true); setOTPError(null);
        verifiedMobileRef.current = formData.billingAddress.mobile;
        setFieldErrors(prev => { const next = { ...prev }; delete next._otp; return next; });
        localStorage.setItem('token', data.access_token);
        if (typeof window !== "undefined" && window.AhmedTracker) {
          window.AhmedTracker.track("verify_otp", {
            phone: formData.billingAddress.mobile,
            customer_phone: formData.billingAddress.mobile,
            email: formData.billingAddress.email || null,
            customer_name: `${formData.billingAddress.first_name || ''} ${formData.billingAddress.last_name || ''}`.trim() || null,
            total: parseFloat(totalPrice || 0),
            items: (cartProducts || []).map((i) => ({
              product_id: (i.product_id || i.id)?.toString(),
              product_name: i.product_name || i.name || "",
              price: parseFloat(i.price || 0),
              quantity: i.quantity || 1,
            })),
          });
        }
        // useEffect will auto-advance to section 3
      } else {
        if (data.mobile) setOTPError(data.mobile);
        if (data.otp) setOTPError(data.otp);
        setOTPSuccess(null);
      }
    } catch (err) { setOTPError(err.message); } finally { setIsSendOTPLoading(false); }
  }

  // Collect validation errors for a scope: 'contact' | 'delivery' | 'all'
  const collectErrors = scope => {
    const b = formData.billingAddress;
    const errs = {};
    const check = field => { const msg = billingRules[field](b[field]); if (msg) errs[field] = msg; };
    if (scope !== 'delivery') {
      ['first_name', 'last_name', 'mobile', 'email'].forEach(check);
      if (!isLoggedIn && !isOTPVerified) errs._otp = 'verifyMobileBeforeContinue';
    }
    if (scope !== 'contact') {
      if (!isLoggedIn) {
        ['area', 'province', 'short_national_address'].forEach(check);
        if (!b.building?.trim()) errs.building = 'fullAddressRequired';
      } else if (!b.area?.trim() || !b.province?.trim() || !b.building?.trim()) {
        // New accounts may have no saved address yet
        errs._address = 'noAddressTitle';
      } else if (billingRules.short_national_address(b.short_national_address)) {
        errs._address = 'addressIncompleteTitle';
      }
    }
    return errs;
  };

  const CONTACT_KEYS = ['first_name', 'last_name', 'mobile', 'email', '_otp'];

  const showErrors = errs => {
    setFieldErrors(errs);
    setTimeout(() => {
      const el = document.querySelector('.cc-checkout-left .border-danger, .cc-checkout-left .cc-field-error');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (el.focus) el.focus({ preventScroll: true }); }
    }, 60);
  };

  // First-party AhmedTracker: details completed (was emitted on the old "Continue" step)
  const trackDetailsComplete = () => {
    if (detailsTrackedRef.current || typeof window === "undefined" || !window.AhmedTracker) return;
    detailsTrackedRef.current = true;
    const b = formData.billingAddress;
    window.AhmedTracker.track("begin_checkout", {
      total: parseFloat(totalPrice || 0),
      items_count: (cartProducts || []).length,
      email: b.email,
      phone: b.mobile,
      customer_phone: b.mobile,
      customer_name: `${b.first_name} ${b.last_name}`.trim(),
      city: b.area || b.province || null,
      items: (cartProducts || []).map((i) => ({
        product_id: (i.product_id || i.id)?.toString(),
        product_name: i.product_name || i.name || "",
        price: parseFloat(i.price || 0),
        quantity: i.quantity || 1,
      })),
    });
  };

  // Step funnel event — shows exactly where guests drop off
  const trackStep = (step, name) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'checkout_step', checkout_step: step, checkout_step_name: name });
      if (window.AhmedTracker) window.AhmedTracker.track('checkout_step', { step, step_name: name, total: parseFloat(totalPrice || 0) });
    } catch { }
  };

  // Guest "Continue": validate only the current step, then fold it and open the next
  const goNextStep = step => {
    const errs = collectErrors(step === 1 ? 'contact' : 'delivery');
    if (Object.keys(errs).length) { showErrors(errs); return; }
    setFieldErrors({});
    setStepsDone(d => ({ ...d, [step]: true }));
    // Editing Contact after Delivery was done goes straight back to Payment
    setGuestStep(step === 1 && stepsDone[2] ? 3 : step + 1);
    trackStep(step, step === 1 ? 'contact' : 'delivery');
    if (step === 2) trackDetailsComplete();
  };

  // Place Order: validate everything; for guests jump back to the step that needs attention
  const validateDetails = () => {
    const errs = collectErrors('all');
    if (Object.keys(errs).length) {
      if (!isLoggedIn) {
        const contactBad = Object.keys(errs).some(k => CONTACT_KEYS.includes(k));
        setGuestStep(contactBad ? 1 : 2);
      }
      showErrors(errs);
      return false;
    }
    setFieldErrors({});
    trackDetailsComplete();
    return true;
  };

  // Utility: item subtotal for order summary (discounted final price)
  const itemSubtotal = (elm) => {
    const nowGST = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
    const now = nowGST.toISOString().slice(0, 19).replace('T', ' ');
    const bogoFreeQty = Number(elm.bogo_free_qty || 0);
    const paidQty = Math.max(0, (elm.quantity || 0) - bogoFreeQty);
    let p = parseFloat(elm.price);
    if (elm.is_gift) return `0.00${currency.symbol}`;

    // BOGO: charge only paid quantity
    if (bogoFreeQty > 0) {
      return `${(p * paidQty).toFixed(2)}${currency.symbol}`;
    }

    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type === 'percent') p = p - p / 100 * elm.discount.value;
      else p = elm.discount.final_price || p;
    } else if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < parseFloat(elm.price)) {
      // Legacy flat sale_price
      p = Number(elm.sale_price);
    } else if (couponData?.type === 'customer' && elm.is_coupon) {
      if (couponData.coupon_type === 'percent') p = p - p / 100 * couponData.value;
      else p = p - couponData.value;
    }
    return `${(p * elm.quantity).toFixed(2)}${currency.symbol}`;
  };

  // Whether an item has an active price reduction (for strikethrough display)
  const itemIsDiscounted = (elm) => {
    if (elm.bogo_free_qty && elm.bogo_free_qty > 0) return true;
    const nowGST = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
    const now = nowGST.toISOString().slice(0, 19).replace('T', ' ');
    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) return true;
    if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < parseFloat(elm.price)) return true;
    if (couponData?.type === 'customer' && elm.is_coupon) return true;
    return false;
  };

  // Original subtotal (no discount) for strikethrough comparison
  const itemOriginalSubtotal = (elm) => {
    if (elm.is_gift) return null;
    return `${(parseFloat(elm.price) * elm.quantity).toFixed(2)}${currency.symbol}`;
  };

  const isExpired = d => new Date(d) < new Date();

  const productImage = elm => {
    const base = `${process.env.NEXT_PUBLIC_API_URL}storage/`;
    if (elm.image) return base + elm.image;
    try {
      const imgs = typeof elm.images === 'string' ? JSON.parse(elm.images) : elm.images;
      if (imgs?.[0]) return base + imgs[0];
    } catch { }
    return '/assets/images/general_product.png';
  };

  /* ------------------------------------------------------------------ */
  /*  GUARDS                                                              */
  /* ------------------------------------------------------------------ */
  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError) return <div>{isMenuError}</div>;

  /* ------------------------------------------------------------------ */
  /*  SECTION SUMMARIES (shown when collapsed)                           */
  /* ------------------------------------------------------------------ */
  const b = formData.billingAddress;
  const hasAddress = !!(b.area?.trim() && b.province?.trim() && b.building?.trim());
  // Human-readable names for the error banner, so users know exactly what to fix
  const fieldErrorLabels = {
    first_name: tc('firstName'), last_name: tc('lastName'), email: tc('emailAddress'), mobile: tc('mobileNumber'),
    area: tc('city'), province: tc('region'), building: tc('districtStreet'),
    short_national_address: tc('shortNationalAddress'), _otp: tc('mobileVerification'), _address: tc('deliveryAddress'),
  };
  const regionLabel = key => { const r = SAUDI_REGIONS.find(x => x.key === key); return r ? (locale === 'ar' ? r.ar : r.en) : key; };

  /* ------------------------------------------------------------------ */
  /*  FIELD HELPERS (plain render functions — not components, so inputs   */
  /*  keep focus between renders)                                         */
  /* ------------------------------------------------------------------ */
  const fieldError = key => fieldErrors[key]
    ? <div className="cc-alert cc-alert--error cc-field-error py-1 mt-1" style={{ fontSize: '0.72rem' }}>{tc(fieldErrors[key])}</div>
    : null;

  const textField = ({ id, name, value, label, required = false, type = 'text', autoComplete, inputMode, errKey, hint, list, maxLength, dir }) => (
    <div className="col-12">
      <div className="form-floating">
        <input
          type={type}
          className={`form-control${errKey && fieldErrors[errKey] ? ' border-danger' : ''}`}
          id={id}
          placeholder={label}
          name={name}
          value={value || ''}
          onChange={handleChange}
          autoComplete={autoComplete}
          inputMode={inputMode}
          list={list}
          maxLength={maxLength}
          dir={dir}
        />
        <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
      </div>
      {hint && <p className="cc-hint">{hint}</p>}
      {errKey && fieldError(errKey)}
    </div>
  );

  const regionField = ({ id, name, value, errKey, prefix = '' }) => {
    const known = SAUDI_REGIONS.some(r => r.key === value);
    return (
      <div className="col-12">
        <div className="cc-select-wrap">
          <select
            className={`form-select cc-select${value ? ' has-value' : ''}${errKey && fieldErrors[errKey] ? ' border-danger' : ''}`}
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            autoComplete={`${prefix}address-level1`}
            aria-label={tc('region')}
          >
            <option value="">{tc('region')} *</option>
            {SAUDI_REGIONS.map(r => <option key={r.key} value={r.key}>{locale === 'ar' ? r.ar : r.en}</option>)}
            {value && !known && <option value={value}>{value}</option>}
          </select>
        </div>
        {errKey && fieldError(errKey)}
      </div>
    );
  };

  const summaryRows = (
    <>
      <div className="cc-osr__row cc-osr__row--sub">
        <span>{tc('subtotal')}</span>
        <span>{totalPrice.toFixed(2)}{currency.symbol}</span>
      </div>
      <div className="cc-osr__row cc-osr__row--sub">
        <span>{tc('shipping')}</span>
        <span>{freeShippingFlag ? <span className="cc-osr__free">{tc('free')}</span> : `${shippingCostDisplay}${currency.symbol}`}</span>
      </div>
      {serviceFee > 0 && (
        <div className="cc-osr__row cc-osr__row--sub">
          <span>{tc('serviceFee')}</span>
          <span>{serviceFee.toFixed(2)}{currency.symbol}</span>
        </div>
      )}
      {codFee > 0 && (
        <div className="cc-osr__row cc-osr__row--sub">
          <span>{tc('codFee')}</span>
          <span>{codFee.toFixed(2)}{currency.symbol}</span>
        </div>
      )}
      {couponData && (
        <div className="cc-osr__row cc-osr__row--sub cc-osr__row--discount">
          <span>{tc('discount', { code: couponData.code })}</span>
          <span>&minus;{couponData.value}{couponData.coupon_type === 'percent' ? '%' : currency.symbol}</span>
        </div>
      )}
      <div className="cc-osr__divider" />
      <div className="cc-osr__row cc-osr__row--total">
        <span>{tc('total')}</span>
        <span>{grandTotal}{currency.symbol} <em>{tc('inclVat', { amount: `${vatAmount}${currency.symbol}` })}</em></span>
      </div>
    </>
  );

  const summaryItems = cartProducts.map((elm, i) => {
    const bogoFreeQty = Number(elm.bogo_free_qty || 0);
    return (
      <div key={i} className="cc-sum-item">
        <span className="cc-sum-item__thumb">
          <img src={productImage(elm)} alt="" loading="lazy" />
          <span className="cc-sum-item__qty">{elm.quantity}</span>
        </span>
        <span className="cc-sum-item__name">
          {locale === 'ar' && elm.product_name_ar?.trim() ? elm.product_name_ar : he.decode(elm.product_name || '')}
          {bogoFreeQty > 0 && (
            <span style={{ display: 'block', color: '#28a745', fontWeight: 'bold', fontSize: '12px' }}>
              🎁 {bogoFreeQty} {locale === 'ar' ? 'مجاني' : 'FREE'}
            </span>
          )}
          {elm.is_gift && (
            <span style={{ display: 'block', color: '#28a745', fontWeight: 'bold', fontSize: '12px' }}>
              🎁 {locale === 'ar' ? 'هدية مجانية' : 'Free Gift'}
            </span>
          )}
        </span>
        <span className="cc-sum-item__price">
          {itemIsDiscounted(elm) && <span className="cc-price-old">{itemOriginalSubtotal(elm)}</span>}
          <span>{itemSubtotal(elm)}</span>
        </span>
      </div>
    );
  });

  const isGuestFlow = !isLoggedIn;
  const stepOpen = n => !isGuestFlow || guestStep === n;
  const stepClass = n => {
    if (!isGuestFlow || guestStep === n) return 'cc-acc-section is-active cc-step';
    return `cc-acc-section cc-step ${stepsDone[n] ? 'is-completed' : 'is-locked'}`;
  };
  const stepHeader = (n, title, summary) => {
    const folded = isGuestFlow && stepsDone[n] && guestStep !== n;
    return (
      <div
        className="cc-acc-header cc-step__header"
        onClick={folded ? () => setGuestStep(n) : undefined}
        role={folded ? 'button' : undefined}
        style={folded ? { cursor: 'pointer' } : undefined}
      >
        <div className="cc-acc-dot">{folded ? '✓' : n}</div>
        <div className="cc-acc-title-group">
          <span className="cc-acc-title">{title}</span>
          {folded && summary && <span className="cc-acc-summary-line">{summary}</span>}
        </div>
        {folded && (
          <button type="button" className="cc-acc-edit" onClick={e => { e.stopPropagation(); setGuestStep(n); }}>{tc('edit')}</button>
        )}
      </div>
    );
  };
  const stepContinue = n => isGuestFlow && (
    <button type="button" className="cc-acc-continue cc-step__continue" onClick={() => goNextStep(n)}>
      {tc('continue')}
    </button>
  );
  const contactSummary = [`${b.first_name || ''} ${b.last_name || ''}`.trim(), b.mobile].filter(Boolean).join(' · ');
  const deliverySummary = [
    [b.area, regionLabel(b.province)].filter(Boolean).join(locale === 'ar' ? '، ' : ', '),
    b.building,
  ].filter(Boolean).join(' · ');

  /* ------------------------------------------------------------------ */
  /*  JSX — single-page checkout: Contact → Delivery → Payment          */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {cartProducts.length ? (
        <>
          <FreeGiftFeature couponData={couponData} />
          <BogoFeature />
          <form onSubmit={onOrder} noValidate>
            <datalist id="sa-city-list">
              {SAUDI_CITIES.map(c => <option key={c.en} value={locale === 'ar' ? c.ar : c.en} />)}
            </datalist>

            <div className="cc-checkout-layout cc-onepage">

              {/* ============================================
                LEFT — ONE PAGE
            ============================================ */}
              <div className="cc-checkout-left">

                {/* Mobile: order summary bar at the top */}
                <div className="cc-mobile-summary d-xl-none">
                  <button type="button" className="cc-mobile-summary__toggle" onClick={() => setMobileSummaryOpen(v => !v)} aria-expanded={mobileSummaryOpen}>
                    <span>{mobileSummaryOpen ? tc('hideOrderSummary') : tc('showOrderSummary')}</span>
                    <span className="cc-mobile-summary__total">
                      {grandTotal}{currency.symbol}
                      <svg className={mobileSummaryOpen ? 'open' : ''} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                  {mobileSummaryOpen && (
                    <div className="cc-mobile-summary__body">
                      {summaryItems}
                      <div className="cc-osr__divider" />
                      {summaryRows}
                    </div>
                  )}
                </div>

                {/* Error banner — names exactly what is missing */}
                {Object.keys(fieldErrors).length > 0 && (
                  <div className="cc-alert cc-alert--error" role="alert">
                    {tc('fixFields', {
                      fields: [...new Set(Object.keys(fieldErrors).map(k => fieldErrorLabels[k]).filter(Boolean))]
                        .join(locale === 'ar' ? '، ' : ', '),
                    })}
                  </div>
                )}

                <div className="cc-acc">

                  {/* ── 1. CONTACT ── */}
                  <section id="cc-step-1" className={stepClass(1)}>
                    {stepHeader(1, tc('contactTitle'), contactSummary)}
                    {stepOpen(1) && (
                      <div className="cc-acc-body">
                        {isLoggedIn ? (
                          <div className="row g-2">
                            {(needsName || fieldErrors.first_name || fieldErrors.last_name) && (
                              <>
                                {textField({ id: 'bill_fn', name: 'billingAddress.first_name', value: b.first_name, label: tc('firstName'), required: true, autoComplete: 'given-name', errKey: 'first_name' })}
                                {textField({ id: 'bill_ln', name: 'billingAddress.last_name', value: b.last_name, label: tc('lastName'), required: true, autoComplete: 'family-name', errKey: 'last_name' })}
                              </>
                            )}
                            {textField({ id: 'bill_mobile', name: 'billingAddress.mobile', value: b.mobile, label: tc('mobileNumber'), required: true, type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', maxLength: 14, errKey: 'mobile', hint: tc('egMobile'), dir: 'ltr' })}
                            {textField({ id: 'bill_email', name: 'billingAddress.email', value: b.email, label: tc('emailAddress'), required: true, type: 'email', inputMode: 'email', autoComplete: 'email', errKey: 'email', dir: 'ltr' })}
                          </div>
                        ) : (
                          <>
                            <p className="cc-step__note">
                              {tc.rich('haveAccount', {
                                login: (chunks) => <Link href={`/${locale}/login_register?redirect=${encodeURIComponent(`/${locale}/shop-checkout`)}`} className="cc-guest-notice__login-link">{chunks}</Link>,
                              })}
                            </p>
                            <div className="row g-2">
                              {textField({ id: 'bill_mobile', name: 'billingAddress.mobile', value: b.mobile, label: tc('mobileNumber'), required: true, type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', maxLength: 14, errKey: 'mobile', hint: isOTPVerified ? null : tc('otpWhy'), dir: 'ltr' })}

                              {/* Inline OTP — sent automatically, verified automatically on the 4th digit */}
                              {/^\d{10}$/.test(b.mobile) && (
                                <div className="col-12">
                                  {isOTPVerified ? (
                                    <div className="cc-otp cc-otp--ok">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                                      {tc('mobileVerifiedShort')}
                                    </div>
                                  ) : (
                                    <div className={`cc-otp${fieldErrors._otp ? ' cc-field-error' : ''}`}>
                                      {isOTPButton ? (
                                        <button type="button" className="cc-otp__send" disabled={isSendOTPLoading} onClick={sendOTP}>
                                          {isSendOTPLoading ? tc('sendingOtp') : tc('sendOtp')}
                                        </button>
                                      ) : (
                                        <>
                                          <label htmlFor="otp_input" className="cc-otp__prompt">{tc('otpPrompt', { mobile: b.mobile })}</label>
                                          <div className="cc-otp__row">
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              autoComplete="one-time-code"
                                              pattern="[0-9]*"
                                              maxLength={4}
                                              className="form-control cc-otp__input"
                                              id="otp_input"
                                              name="otp"
                                              value={formData.otp}
                                              onChange={handleChange}
                                              dir="ltr"
                                              autoFocus
                                            />
                                            <button type="button" className="cc-otp__verify" disabled={isSendOTPLoading || (formData.otp || '').length < 4} onClick={verifyOTP}>
                                              {isSendOTPLoading ? tc('verifying') : tc('verify')}
                                            </button>
                                          </div>
                                          <button type="button" className="cc-otp__resend" disabled={otpCooldown > 0 || isSendOTPLoading} onClick={sendOTP}>
                                            {otpCooldown > 0 ? tc('resendIn', { s: otpCooldown }) : tc('resend')}
                                          </button>
                                        </>
                                      )}
                                      {OTPError && <div className="cc-alert cc-alert--error py-1 mt-2" style={{ fontSize: '0.75rem' }}>{OTPError}</div>}
                                      {fieldErrors._otp && !OTPError && <div className="cc-alert cc-alert--error py-1 mt-2" style={{ fontSize: '0.75rem' }}>{tc(fieldErrors._otp)}</div>}
                                    </div>
                                  )}
                                </div>
                              )}

                              {textField({ id: 'bill_fn', name: 'billingAddress.first_name', value: b.first_name, label: tc('firstName'), required: true, autoComplete: 'given-name', errKey: 'first_name' })}
                              {textField({ id: 'bill_ln', name: 'billingAddress.last_name', value: b.last_name, label: tc('lastName'), required: true, autoComplete: 'family-name', errKey: 'last_name' })}
                              {textField({ id: 'bill_email', name: 'billingAddress.email', value: b.email, label: tc('emailAddress'), required: true, type: 'email', inputMode: 'email', autoComplete: 'email', errKey: 'email', dir: 'ltr' })}
                            </div>
                          </>
                        )}
                        {stepContinue(1)}
                      </div>
                    )}
                  </section>

                  {/* ── 2. DELIVERY ── */}
                  <section id="cc-step-2" className={stepClass(2)}>
                    {stepHeader(2, tc('deliveryTitle'), deliverySummary)}
                    {stepOpen(2) && (
                      <div className="cc-acc-body">
                        <p className="cc-step__note">{tc('deliveringKsa')}</p>

                        {isLoggedIn ? (
                          <div className={`cc-address-card${fieldErrors._address ? ' cc-field-error' : ''}`} style={fieldErrors._address ? { borderColor: '#d32f2f' } : undefined}>
                            <div className="cc-address-card__header">
                              <div className="cc-address-card__badge">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {tc('defaultAddress')}
                              </div>
                              <button type="button" className="cc-address-card__edit-btn" onClick={hasAddress ? openAddrModal : openAddFirstAddr} aria-label={tc('changeAddressAria')}>
                                {hasAddress ? tc('changeAddress') : tc('addAddress')}
                              </button>
                            </div>
                            <div className="cc-address-card__body">
                              {hasAddress ? (
                                <>
                                  <p className="cc-address-card__name">{b.first_name} {b.last_name}</p>
                                  {b.building && <p className="cc-address-card__line">{b.building}</p>}
                                  {b.building_name && <p className="cc-address-card__line">{b.building_name}</p>}
                                  {b.area && <p className="cc-address-card__line">{[b.area, regionLabel(b.province)].filter(Boolean).join(', ')}</p>}
                                  {b.short_national_address && <p className="cc-address-card__line cc-address-card__line--sna">{b.short_national_address}</p>}
                                </>
                              ) : (
                                <>
                                  <p className="cc-address-card__name">{tc('noAddressTitle')}</p>
                                  <p className="cc-address-card__line">{tc('noAddressText')}</p>
                                </>
                              )}
                              {fieldErrors._address && (
                                <div className="cc-alert cc-alert--error py-1 mt-2" style={{ fontSize: '0.78rem' }}>
                                  {tc(fieldErrors._address === 'addressIncompleteTitle' ? 'addressIncompleteText' : 'noAddressText')}
                                </div>
                              )}
                              {!hasAddress && (
                                <button type="button" className="cc-acc-continue" onClick={openAddFirstAddr} style={{ height: '2.6rem', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                                  + {tc('addAddress')}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="row g-2">
                            {/* Short National Address is compulsory */}
                            <div className="col-12">
                              <div className="form-floating position-relative">
                                <input
                                  type="text"
                                  className={`form-control${fieldErrors.short_national_address ? ' border-danger' : ''}`}
                                  id="bill_sna"
                                  placeholder={`${tc('shortNationalAddress')} *`}
                                  name="billingAddress.short_national_address"
                                  value={b.short_national_address || ''}
                                  onChange={handleChange}
                                  maxLength="8"
                                  autoComplete="off"
                                  dir="ltr"
                                  required
                                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                />
                                <label htmlFor="bill_sna">{tc('shortNationalAddress')} *</label>
                                {lookupLoading.billing ? (
                                  <span className="cc-sna-btn cc-sna-btn--busy">{locale === 'ar' ? 'جارٍ التحقق…' : 'Checking…'}</span>
                                ) : (
                                  <button
                                    type="button"
                                    className={`cc-sna-btn${b.short_national_address?.length === 8 ? ' is-ready' : ''}`}
                                    onClick={() => handleLookup('billing', b.short_national_address)}
                                    disabled={!b.short_national_address || b.short_national_address.length < 8}
                                  >
                                    {locale === 'ar' ? 'تحقق' : 'Verify'}
                                  </button>
                                )}
                              </div>
                              {lookupStatus.billing
                                ? <div className="cc-hint" style={{ color: lookupStatus.billing.success ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>{lookupStatus.billing.message}</div>
                                : <p className="cc-hint">{tc('snaHint')}</p>}
                              {fieldError('short_national_address')}
                            </div>

                            {textField({ id: 'bill_city', name: 'billingAddress.area', value: b.area, label: tc('city'), required: true, autoComplete: 'address-level2', errKey: 'area', list: 'sa-city-list' })}
                            {regionField({ id: 'bill_prov', name: 'billingAddress.province', value: b.province, errKey: 'province' })}
                            {textField({ id: 'bill_addr', name: 'billingAddress.building', value: b.building, label: tc('districtStreet'), required: true, autoComplete: 'street-address', errKey: 'building' })}
                            {textField({ id: 'bill_bldg_name', name: 'billingAddress.building_name', value: b.building_name, label: tc('buildingApt'), autoComplete: 'address-line2' })}
                          </div>
                        )}

                        {stepContinue(2)}
                      </div>
                    )}
                  </section>

                  {/* ── 3. PAYMENT ── */}
                  <section id="cc-step-3" className={stepClass(3)}>
                    {stepHeader(3, tc('paymentTitle'))}
                    {!stepOpen(3) && (
                      <div className="cc-pay-preview" aria-hidden="true">
                        <Image src="/assets/images/paytabs-svg/mada-logo.png" alt="" width={34} height={14} style={{ objectFit: 'contain' }} />
                        <Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="" width={34} height={14} style={{ objectFit: 'contain' }} />
                        <Image src="/assets/images/paymentGateway/Tabby.png" alt="" width={40} height={16} style={{ objectFit: 'contain' }} />
                        <span className="cc-pay-preview__text">Tamara · {tc('cod')}</span>
                      </div>
                    )}
                    {stepOpen(3) && (
                      <div className="cc-acc-body">
                        {/* Mobile-only promo code (desktop has it in the right column) */}
                        <div className="d-xl-none" style={{ marginBottom: '0.75rem' }}>
                          {couponData ? (
                            <div className="cc-coupon-card" style={{ padding: '0.65rem 0.75rem' }}>
                              <div className="cc-coupon-applied">
                                <div className="cc-coupon-applied__text">
                                  <span className="cc-coupon-applied__code">{couponData.code}</span>
                                  <span className="cc-coupon-applied__desc">{couponData.title}</span>
                                </div>
                                <button type="button" className="cc-coupon-applied__remove" onClick={removeCoupon} title={tc('removeCoupon')}>&times;</button>
                              </div>
                              {couponError && <div className="cc-coupon-msg cc-coupon-msg--err">{couponError}</div>}
                              {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok">{couponSuccess}</div>}
                            </div>
                          ) : (
                            <div className="cc-promo-mobile">
                              <button type="button" className="cc-promo-mobile__toggle" onClick={() => setShowCouponPanel(v => !v)} aria-expanded={showCouponPanel}>
                                <span className="cc-promo-mobile__toggle-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                  {tc('havePromo')}
                                </span>
                                <svg className={`cc-promo-mobile__chevron${showCouponPanel ? ' open' : ''}`} width="12" height="12" viewBox="0 0 10 6" fill="none">
                                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </button>
                              {showCouponPanel && (
                                <div className="cc-promo-mobile__body">
                                  <div className="cc-coupon-label-row" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#888' }}>{tc('enterCodeBelow')}</span>
                                    <button type="button" className="cc-coupon-view-offers" onClick={() => setShowCouponModal(true)}>{tc('viewOffers')}</button>
                                  </div>
                                  <div className="cc-coupon-input-wrap">
                                    <input className="cc-coupon-input" type="text" placeholder={tc('promoPlaceholder')} value={couponCode} onChange={handleCouponChange} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(e); } }} autoFocus />
                                    <button type="button" className="cc-coupon-apply-btn" onClick={applyCoupon}>{tc('apply')}</button>
                                  </div>
                                  {couponError && <div className="cc-coupon-msg cc-coupon-msg--err" style={{ marginTop: '0.4rem' }}>{couponError}</div>}
                                  {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok" style={{ marginTop: '0.4rem' }}>{couponSuccess}</div>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {error && !selectedOption && error === tc('choosePayment') && (
                          <div className="text-danger small fw-semibold mb-2" role="alert">{tc('choosePayment')}</div>
                        )}

                        {/* Ordered by KSA preference: card (mada / Apple Pay) → Tabby → Tamara → Cash on delivery */}
                        <div className="cc-payment-list" role="radiogroup" aria-label={tc('selectPayment')}>
                          <label className={`cc-payment-card ${selectedOption === 'paytabs' ? 'cc-payment-card--selected' : ''}`} htmlFor="pay_pt">
                            <input type="radio" id="pay_pt" name="checkout_payment_method" value="paytabs" checked={selectedOption === 'paytabs'} onChange={handleRadioChange} />
                            <div className="cc-payment-card__radio"></div>
                            <div className="cc-payment-card__content">
                              <span className="cc-payment-card__title">{tc('cardPayment')}</span>
                              <span className="cc-payment-card__subtitle">{tc('cardSub')}</span>
                            </div>
                            <div className="cc-payment-card__logos">
                              <Image src="/assets/images/paytabs-svg/mada-logo.png" alt="mada" width={36} height={14} style={{ objectFit: 'contain' }} />
                              <Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="Apple Pay" width={36} height={14} style={{ objectFit: 'contain' }} />
                            </div>
                          </label>

                          <label className={`cc-payment-card ${selectedOption === 'tabby' ? 'cc-payment-card--selected' : ''}`} htmlFor="pay_tbb">
                            <input type="radio" id="pay_tbb" name="checkout_payment_method" value="tabby" checked={selectedOption === 'tabby'} onChange={handleRadioChange} />
                            <div className="cc-payment-card__radio"></div>
                            <div className="cc-payment-card__content">
                              <span className="cc-payment-card__title">{tc('tabbyPayIn4')}</span>
                              {selectedOption === 'tabby' && <div id="tabbyCard" style={{ marginTop: '0.5rem' }}></div>}
                            </div>
                            <div className="cc-payment-card__logos">
                              <Image src="/assets/images/paymentGateway/Tabby.png" width={50} height={20} alt="Tabby" style={{ objectFit: 'contain' }} />
                            </div>
                          </label>

                          <label className={`cc-payment-card ${selectedOption === 'tamara' ? 'cc-payment-card--selected' : ''}`} htmlFor="pay_tmr">
                            <input type="radio" id="pay_tmr" name="checkout_payment_method" value="tamara" checked={selectedOption === 'tamara'} onChange={handleRadioChange} />
                            <div className="cc-payment-card__radio"></div>
                            <div className="cc-payment-card__content">
                              <span className="cc-payment-card__title">{tc('tamara')}</span>
                              <div className="cc-payment-card__widget">
                                <TamaraWidget inlineType='4' inlineVariant='text' locale={locale} />
                              </div>
                            </div>
                          </label>

                          {/* Apple Pay (direct) — rendered only when the backend marks the customer eligible */}
                          <ApplePayWidget
                            locale={locale}
                            amount={(grandTotalNum - codFee).toFixed(2)}
                            disabled={isLoading}
                            isLoggedIn={isLoggedIn}
                            validateBeforePay={validateBeforePay}
                            buildOrderPayload={buildOrderPayload}
                            onProcessingChange={setIsLoading}
                          />

                          <label className={`cc-payment-card ${selectedOption === 'cod' ? 'cc-payment-card--selected' : ''}`} htmlFor="pay_cod">
                            <input type="radio" id="pay_cod" name="checkout_payment_method" value="cod" checked={selectedOption === 'cod'} onChange={handleRadioChange} />
                            <div className="cc-payment-card__radio"></div>
                            <div className="cc-payment-card__content">
                              <span className="cc-payment-card__title">{tc('cod')}</span>
                              <span className="cc-payment-card__subtitle">{tc('codSub')}{codFeeSetting > 0 && <> · {tc('codFeeNote', { amount: `${codFeeSetting.toFixed(2)}${currency.symbol}` })}</>}</span>
                            </div>
                          </label>
                        </div>

                        {/* Alerts */}
                        {error && error !== tc('choosePayment') && <div className="cc-alert cc-alert--error" role="alert">{error}</div>}
                        {success && <div className="cc-alert cc-alert--success" role="status">{success}</div>}

                        {/* Place Order */}
                        <button className="cc-btn-gold cc-place-order" type="submit" disabled={disablePlaceOrder}>
                          {isLoading ? <span>{tc('processing')}</span> : <>{tc('placeOrder', { amount: `${grandTotal}${currency.symbol}` })}</>}
                        </button>
                        <p className="cc-terms-line">
                          {tc.rich('termsLine', {
                            terms: (chunks) => <Link href={`/${locale}/terms`} target="_blank">{chunks}</Link>,
                            privacy: (chunks) => <Link href={`/${locale}/privacy`} target="_blank">{chunks}</Link>,
                          })}
                        </p>
                      </div>
                    )}
                  </section>
                </div>{/* end .cc-acc */}
              </div>{/* end .cc-checkout-left */}

              {/* ============================================
                RIGHT — STICKY ORDER SUMMARY (desktop only)
            ============================================ */}
              <div className="cc-checkout-right d-none d-xl-block">
                <div className="cc-order-summary-right">
                  <div className="cc-osr__header" onClick={() => setSummaryOpen(v => !v)} role="button" tabIndex={0}>
                    <span className="cc-osr__title">{tc('orderSummary')}</span>
                    <div className="cc-osr__header-right">
                      <span className="cc-osr__total-pill">{grandTotal}{currency.symbol}</span>
                      <svg className={`cc-osr__chevron${summaryOpen ? ' cc-osr__chevron--open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </div>
                  </div>
                  {summaryOpen && (
                    <div className="cc-osr__body">
                      {summaryItems}
                      <div className="cc-osr__divider" />
                      {summaryRows}
                    </div>
                  )}
                </div>

                <div className="cc-coupon-card">
                  {couponData ? (
                    <div className="cc-coupon-applied">
                      <div className="cc-coupon-applied__text">
                        <span className="cc-coupon-applied__code">{couponData.code}</span>
                        <span className="cc-coupon-applied__desc">{couponData.title}</span>
                      </div>
                      <button type="button" className="cc-coupon-applied__remove" onClick={removeCoupon} title={tc('removeCoupon')}>&times;</button>
                    </div>
                  ) : (
                    <>
                      <div className="cc-coupon-label-row">
                        <span className="cc-coupon-label-text">{tc('havePromo')}</span>
                        <button type="button" className="cc-coupon-view-offers" onClick={() => setShowCouponModal(true)}>{tc('viewOffers')}</button>
                      </div>
                      <div className="cc-coupon-input-wrap">
                        <input className="cc-coupon-input" type="text" placeholder={tc('enterCode')} value={couponCode} onChange={handleCouponChange} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(e); } }} />
                        <button type="button" className="cc-coupon-apply-btn" onClick={applyCoupon}>{tc('apply')}</button>
                      </div>
                    </>
                  )}
                  {couponError && <div className="cc-coupon-msg cc-coupon-msg--err">{couponError}</div>}
                  {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok">{couponSuccess}</div>}
                </div>

                <div className="cc-trust-bar cc-trust-bar--right">
                  <span className="cc-trust-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    {tc('secureCheckout')}
                  </span>
                  <span className="cc-trust-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    {tc('vatIncluded')}
                  </span>
                  <span className="cc-trust-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 7v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    {tc('fastDelivery')}
                  </span>
                </div>
              </div>
            </div>{/* end cc-checkout-layout */}

            {/* Mobile: sticky Place Order bar — the main action is always in reach */}
            {(!isGuestFlow || guestStep === 3) && (
              <div className="cc-sticky-cta d-xl-none">
                <div className="cc-sticky-cta__total">
                  <span>{tc('total')}</span>
                  <strong>{grandTotal}{currency.symbol}</strong>
                </div>
                <button className="cc-btn-gold" type="submit" disabled={disablePlaceOrder}>
                  {isLoading ? tc('processing') : tc('placeOrderShort')}
                </button>
              </div>
            )}

            {/* ── COUPON MODAL ── */}
            {showCouponModal && (
              <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
                <div className="coupon-modal" data-lenis-prevent onClick={e => e.stopPropagation()}>
                  <div className="coupon-header">
                    <h3>{tc('availableCoupons')}</h3>
                    <button className="close-btn" onClick={() => setShowCouponModal(false)}>&times;</button>
                  </div>
                  {couponLoading ? (
                    <div className="coupon-loading">{tc('loading')}</div>
                  ) : !coupons.length ? (
                    <div className="coupon-empty">{tc('noCoupons')}</div>
                  ) : (
                    <div className="coupon-body">
                      {coupons.map((c, idx) => {
                        const expired = isExpired(c.end_date);
                        return (
                          <div key={c.id || `c-${idx}`} className={`coupon-ticket ${expired ? 'expired' : ''}`}>
                            <div className="coupon-left">
                              <div className="coupon-title">{c.title || tc('specialOffer')}</div>
                              <div className="coupon-desc">{c.coupon_type === 'percent' ? tc('percentOff', { value: c.value }) : tc('sarOff', { value: c.value })}</div>
                              <div className="coupon-validity">{expired ? tc('expiredOn', { date: c.end_date?.slice(0, 10) }) : tc('validUntil', { date: c.end_date?.slice(0, 10) })}</div>
                            </div>
                            <div className="coupon-right">
                              <div className="coupon-code-box"><span className="coupon-code">{c.code}</span></div>
                              {!expired && (
                                <button className={`apply-btn ${copiedId === (c.id || `c-${idx}`) ? 'applied' : ''}`} onClick={() => handleSelectCoupon(c.code, c.id || `c-${idx}`)}>
                                  {copiedId === (c.id || `c-${idx}`) ? tc('applied') : tc('apply')}
                                </button>
                              )}
                              {expired && <div className="coupon-expired-badge">{tc('expired')}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          <style jsx>{`
          .coupon-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(2px);display:flex;justify-content:center;align-items:center;z-index:999;padding:1rem}
          .coupon-modal{background:#fff;border-radius:12px;width:480px;max-width:100%;box-shadow:0 8px 30px rgba(0,0,0,.15);border:1px solid #f0ece3;overflow:hidden}
          .coupon-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #f0ece3;background:#faf8f4}
          .coupon-header h3{margin:0;font-size:16px;font-weight:700;letter-spacing:0.02em;color:#1a1a1a}
          .close-btn{background:none;border:none;font-size:22px;color:#888;cursor:pointer;line-height:1;transition:color 0.15s}
          .close-btn:hover{color:#1a1a1a}
          .coupon-body{display:flex;flex-direction:column;gap:12px;padding:16px;max-height:55vh;overflow-y:auto}
          .coupon-ticket{display:flex;justify-content:space-between;align-items:center;border:1.5px solid #ece4d2;background:#fffdfa;border-radius:10px;padding:12px 14px;box-shadow:0 2px 6px rgba(0,0,0,.03);transition:all 0.2s ease}
          .coupon-ticket:hover{border-color:#b9a16b;box-shadow:0 3px 12px rgba(185,161,107,0.15)}
          .coupon-left{display:flex;flex-direction:column;gap:3px}
          .coupon-title{font-size:13px;font-weight:700;color:#1a1a1a}
          .coupon-desc{font-size:11.5px;color:#666;font-weight:500}
          .coupon-validity{font-size:10.5px;color:#999}
          .coupon-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
          .coupon-code{background:#f4efe4;color:#8a6c2d;font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:5px;border:1px solid #dfd2b5;letter-spacing:0.04em}
          .apply-btn{
            background: linear-gradient(135deg, #c4ad76 0%, #b9a16b 100%);
            border: 1px solid #b9a16b;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 5px 14px;
            border-radius: 6px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(185, 161, 107, 0.25);
          }
          .apply-btn:hover{
            background: linear-gradient(135deg, #b0975e 0%, #9f8448 100%);
            border-color: #9f8448;
            box-shadow: 0 3px 8px rgba(185, 161, 107, 0.35);
            transform: translateY(-1px);
          }
          .apply-btn.applied{
            background: #198754;
            border-color: #198754;
            color: #ffffff;
            box-shadow: 0 2px 5px rgba(25, 135, 84, 0.25);
          }
          .coupon-ticket.expired{opacity:.55}
          .coupon-expired-badge{font-size:10px;color:#e53935;font-weight:600}
          .coupon-loading,.coupon-empty{text-align:center;padding:28px;color:#888;font-size:13px}

          /* ── Mobile collapsible promo code ── */
          .cc-promo-mobile{border:1px solid #e8e0d0;border-radius:8px;overflow:hidden;background:#fff}
          .cc-promo-mobile__toggle{
            width:100%;display:flex;align-items:center;justify-content:space-between;
            padding:0.65rem 0.85rem;background:none;border:none;cursor:pointer;
            font-size:0.82rem;font-weight:600;color:#333;font-family:inherit;
            gap:0.5rem;
          }
          .cc-promo-mobile__toggle:hover{background:#faf8f3}
          .cc-promo-mobile__toggle-label{display:flex;align-items:center;gap:0.4rem;color:#9a7c40}
          .cc-promo-mobile__chevron{transition:transform 0.22s ease;flex-shrink:0;color:#aaa}
          .cc-promo-mobile__chevron.open{transform:rotate(180deg)}
          .cc-promo-mobile__body{
            padding:0.65rem 0.85rem 0.85rem;
            border-top:1px solid #f0ece3;
            animation:promoSlideIn 0.18s ease;
          }
          @keyframes promoSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        `}</style>

          {/* ═══ INLINE ADDRESS MODAL (logged-in) ═══ */}
          {showAddrModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) { setShowAddrModal(false); setEditingAddrIdx(null); } }}>
              <div data-lenis-prevent style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f0ece3' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.03em' }}>
                    {editingAddrIdx !== null ? tc(editingAddrIdx === 0 ? 'editHomeAddress' : 'editOtherAddress') : tc('chooseAddress')}
                  </h4>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999', lineHeight: 1 }} onClick={() => { setShowAddrModal(false); setEditingAddrIdx(null); }}>×</button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  {editingAddrIdx === null ? (
                    /* ── Address List View ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 0.25rem' }}>{tc('defaultAddressUsed')}</p>
                      {[tc('homeAddress'), tc('otherAddress')].map((label, idx) => {
                        const a = addrList[idx];
                        const isEmpty = !a.area && !a.building;
                        return (
                          <div key={label} style={{ border: `1.5px solid ${a.isDefault ? '#b9a16b' : '#e5e5e5'}`, borderRadius: '10px', padding: '0.9rem', background: a.isDefault ? '#fffdf8' : '#fff', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>{label}</span>
                                  {a.isDefault && <span style={{ fontSize: '0.65rem', background: '#b9a16b', color: '#fff', padding: '1px 7px', borderRadius: '99px', fontWeight: 700 }}>{tc('default')}</span>}
                                </div>
                                {isEmpty ? (
                                  <p style={{ fontSize: '0.82rem', color: '#aaa', margin: 0, fontStyle: 'italic' }}>{tc('noAddressSaved')}</p>
                                ) : (
                                  <>
                                    <p style={{ margin: '0 0 0.15rem', fontWeight: 600, fontSize: '0.88rem', color: '#1a1a1a' }}>{a.name}</p>
                                    {a.building && <p style={{ margin: '0 0 0.1rem', fontSize: '0.8rem', color: '#555' }}>{a.building}</p>}
                                    {a.building_name && <p style={{ margin: '0 0 0.1rem', fontSize: '0.8rem', color: '#555' }}>{locale === 'ar' ? 'مبنى: ' : 'Building: '}{a.building_name}</p>}
                                    {(a.area || a.province) && <p style={{ margin: '0 0 0.1rem', fontSize: '0.8rem', color: '#555' }}>{[a.area, a.province].filter(Boolean).join(', ')}</p>}
                                    {a.short_national_address && <p style={{ margin: '0', fontSize: '0.75rem', color: '#b9a16b', fontWeight: 600 }}>📍 {a.short_national_address}</p>}
                                  </>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flexShrink: 0 }}>
                                <button type="button" onClick={() => startEditAddr(idx)} style={{ background: '#fff', border: '1px solid #d4be8a', borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer', color: '#8a6c2d', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>{tc('edit')}</button>
                                {!a.isDefault && !isEmpty && (
                                  <button type="button" onClick={() => selectAddrAsDefault(idx)} style={{ background: 'linear-gradient(135deg, #c4ad76 0%, #b9a16b 100%)', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.75rem', cursor: 'pointer', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(185,161,107,0.3)', transition: 'all 0.15s' }}>{tc('useThis')}</button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Done button — clearly close the modal */}
                      <button
                        type="button"
                        onClick={() => { setShowAddrModal(false); setEditingAddrIdx(null); }}
                        style={{ marginTop: '0.35rem', width: '100%', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'inherit', transition: 'background 0.2s' }}
                      >
                        {tc('close')}
                      </button>
                    </div>
                  ) : (
                    /* ── Edit Form View ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button type="button" onClick={() => setEditingAddrIdx(null)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: '#b9a16b', cursor: 'pointer', textAlign: 'start', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {tc('backToAddresses')}
                      </button>

                      {/* Short National Address with auto-verify */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>
                          {locale === 'ar' ? 'العنوان الوطني المختصر *' : 'Short National Address *'}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            name="short_national_address"
                            value={addrForm.short_national_address || ''}
                            onChange={handleAddrFormChange}
                            maxLength="8"
                            style={{
                              width: '100%',
                              border: `1px solid ${addrFormErrors.short_national_address ? '#e53935' : '#ddd'}`,
                              borderRadius: '6px',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.88rem',
                              outline: 'none',
                              fontFamily: 'inherit',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          />
                          {lookupLoading.modal ? (
                            <span style={{ position: 'absolute', right: locale === 'ar' ? 'auto' : '10px', left: locale === 'ar' ? '10px' : 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#b9a16b', fontWeight: 600 }}>
                              ⏳ {locale === 'ar' ? 'تحقق…' : 'Checking…'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleLookup('modal', addrForm.short_national_address)}
                              disabled={!addrForm.short_national_address || addrForm.short_national_address.length < 8}
                              style={{
                                position: 'absolute',
                                right: locale === 'ar' ? 'auto' : '8px',
                                left: locale === 'ar' ? '8px' : 'auto',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: addrForm.short_national_address?.length === 8 ? '#fdfaf3' : 'transparent',
                                border: addrForm.short_national_address?.length === 8 ? '1px solid #d4be8a' : 'none',
                                borderRadius: '4px',
                                color: addrForm.short_national_address?.length === 8 ? '#8a6c2d' : '#bbb',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: addrForm.short_national_address?.length === 8 ? 'pointer' : 'default',
                                padding: '3px 8px',
                              }}
                            >
                              {locale === 'ar' ? 'تحقق وتعبئة' : 'Verify & Fill'}
                            </button>
                          )}
                        </div>
                        {lookupStatus.modal && (
                          <div style={{ fontSize: '0.72rem', marginTop: '3px', color: lookupStatus.modal.success ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                            {lookupStatus.modal.message}
                          </div>
                        )}
                        {!lookupStatus.modal && (
                          <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#aaa', lineHeight: 1.3 }}>{tc('egSna')}</p>
                        )}
                        {addrFormErrors.short_national_address && <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#e53935' }}>{tc(addrFormErrors.short_national_address)}</p>}
                      </div>

                      {[
                        { label: `${tc('city')} *`, field: 'area', err: addrFormErrors.area, list: 'sa-city-list' },
                        { label: `${tc('region')} *`, field: 'province', err: addrFormErrors.province, select: true },
                        { label: `${tc('districtStreet')} *`, field: 'building', err: addrFormErrors.building },
                        { label: tc('buildingApt'), field: 'building_name', err: null },
                      ].map(({ label, field, err, list, select }) => {
                        const boxStyle = { width: '100%', border: `1px solid ${err ? '#e53935' : '#ddd'}`, borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', background: '#fff' };
                        return (
                          <div key={field}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>{label}</label>
                            {select ? (
                              <select name={field} value={addrForm[field] || ''} onChange={handleAddrFormChange} style={boxStyle}>
                                <option value="">{tc('selectRegion')}</option>
                                {SAUDI_REGIONS.map(r => <option key={r.key} value={r.key}>{locale === 'ar' ? r.ar : r.en}</option>)}
                                {addrForm[field] && !SAUDI_REGIONS.some(r => r.key === addrForm[field]) && <option value={addrForm[field]}>{addrForm[field]}</option>}
                              </select>
                            ) : (
                              <input type="text" name={field} value={addrForm[field] || ''} onChange={handleAddrFormChange} list={list} style={boxStyle} />
                            )}
                            {err && <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#e53935' }}>{tc(err)}</p>}
                          </div>
                        );
                      })}

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        <input type="checkbox" name="isDefault" checked={!!addrForm.isDefault} onChange={handleAddrFormChange} />
                        {tc('setDefault')}
                      </label>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => setEditingAddrIdx(null)} style={{ flex: 1, border: '1px solid #ddd', background: '#fff', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#555' }}>{tc('cancel')}</button>
                        <button type="button" onClick={saveAddrForm} disabled={addrSaving} style={{ flex: 2, border: 'none', background: 'linear-gradient(135deg, #c4ad76 0%, #b9a16b 100%)', color: '#fff', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px rgba(185,161,107,0.3)' }}>
                          {addrSaving ? tc('saving') : tc('saveAddress')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="cc-cart-empty">
          <div className="cc-cart-empty__icon">🛍️</div>
          <h2 className="cc-cart-empty__title">{tc('emptyTitle')}</h2>
          <p className="cc-cart-empty__sub">{tc('emptySub')}</p>
          <Link href={`/${locale}/shop`} className="cc-btn-gold" style={{ width: 'auto', padding: '0 2rem', textDecoration: 'none' }}>
            {tc('exploreProducts')}
          </Link>
        </div>
      )}
    </>
  );
}
