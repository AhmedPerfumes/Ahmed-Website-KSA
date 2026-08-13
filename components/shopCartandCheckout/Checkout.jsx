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

export default function Checkout() {
  /* ------------------------------------------------------------------ */
  /*  STATE                                                               */
  /* ------------------------------------------------------------------ */
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedOption, setSelectedOption] = useState('cod');
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
  const [showShipping, setShowShipping] = useState(false);
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Inline address-edit modal (logged-in users)
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrList, setAddrList] = useState([
    { id:-1, name:'', email:'', mobile:'', area:'', building:'', province:'', short_national_address:'', isDefault:false },
    { id:-1, name:'', email:'', mobile:'', area:'', building:'', province:'', short_national_address:'', isDefault:false },
  ]);
  const [editingAddrIdx, setEditingAddrIdx] = useState(null); // null=list view, 0|1=edit form
  const [addrForm, setAddrForm] = useState({});
  const [addrFormErrors, setAddrFormErrors] = useState({});
  const [addrSaving, setAddrSaving] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', province: '' },
    billingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'KSA', area: '', building: '', province: '', short_national_address: '' },
    shippingAdd: false,
    note: '',
    password: '',
    otp: ''
  });

  /* ------------------------------------------------------------------ */
  /*  CONTEXT & HOOKS                                                     */
  /* ------------------------------------------------------------------ */
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext, setCartProducts } = useContextElement();
  const router = useRouter();
  const locale = useLocale();
  const { isLoggedIn } = useUser();
  const hasFetchedRef = useRef(false);
  const t = useTranslations();

  const shippingLoaded = Array.isArray(shippingServiceCharges) && shippingServiceCharges.length >= 2;
  const grandTotal = shippingLoaded
    ? (!freeShippingFlag
        ? (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2)
        : (0 + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(2))
    : totalPrice.toFixed(2);
  const vatAmount = shippingLoaded
    ? (!freeShippingFlag
        ? ((parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + vatTax.percentage/100)) + (totalPrice - totalPrice / (1 + vatTax.percentage/100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage/100))).toFixed(2)
        : (0 + (totalPrice - totalPrice / (1 + vatTax.percentage/100)) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + vatTax.percentage/100))).toFixed(2))
    : '0.00';
  const shippingCostDisplay = shippingLoaded ? shippingServiceCharges[0].price : '...';

  const disablePlaceOrder = isLoading
    || (!isLoggedIn && !isOTPVerified)
    || (isLoggedIn && formData.shippingAdd && !isOTPVerified);

  /* ------------------------------------------------------------------ */
  /*  EFFECTS                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => { setCouponDataContext(null); }, []);

  // Pre-fill form for logged-in users — but do NOT auto-skip.
  // User must still review and click Continue → to ensure address is complete.
  useEffect(() => {
    if (!isLoggedIn) return;
    let firstName='', lastName='', email='', mobile='', area='', building='', province='', short_national_address='';
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
      area = a.city || ''; building = a.address || ''; province = a.state || ''; short_national_address = a.short_national_address || '';
    }
    // Only pre-fill — do NOT setDoneSection1 or setActiveSection
    setFormData(p => ({
      ...p,
      billingAddress: { ...p.billingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, province, short_national_address },
      shippingAddress: { ...p.shippingAddress, first_name: firstName, last_name: lastName, email, mobile, area, building, province },
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
          if (stored) { try { defaultId = JSON.parse(atob(stored)).id; } catch {} }
          const base = { id:-1, ...defaultInfo, area:'', building:'', province:'', short_national_address:'', isDefault:false };
          if (data.addresses && data.addresses.length) {
            const parsed = data.addresses.map(a => ({
              id: a.id,
              name: a.name || defaultInfo.name,
              email: a.email || defaultInfo.email,
              mobile: a.phone || defaultInfo.mobile,
              area: a.city || '',
              building: a.address || '',
              province: a.state || '',
              short_national_address: a.short_national_address || '',
              isDefault: defaultId !== null ? a.id === defaultId : a.is_default === 1,
            }));
            setAddrList([parsed[0] || {...base}, parsed[1] || {...base}]);
          } else {
            setAddrList([{...base}, {...base}]);
          }
        }).catch(() => {});
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
      new window.TabbyCard({ selector: '#tabbyCard', currency: 'SAR', lang: 'en', price: finalPrice, size: 'wide', theme: 'black', header: true });
    });
    const s2 = addScript('https://checkout.tabby.ai/tabby-promo.js');
    return () => { document.body.removeChild(s1); document.body.removeChild(s2); };
  }, [selectedOption]);

  /* ------------------------------------------------------------------ */
  /*  HANDLERS (all original logic preserved verbatim)                   */
  /* ------------------------------------------------------------------ */
  const handleRadioChange = e => setSelectedOption(e.target.value);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('shipping') || name.startsWith('billing')) {
      const addr = name.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const field = name.split('.')[1];
      setFormData(p => ({ ...p, [addr]: { ...p[addr], [field]: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData(p => ({
      ...p,
      shippingAdd: !p.shippingAdd,
      shippingAddress: { first_name:'', last_name:'', mobile:'', email:'', area:'', building:'', province:'' }
    }));
    setShowShipping(v => !v);
  };

  /* ── Inline address modal handlers ── */
  const openAddrModal = () => { setEditingAddrIdx(null); setAddrFormErrors({}); setShowAddrModal(true); };

  const startEditAddr = idx => { setAddrForm({...addrList[idx]}); setAddrFormErrors({}); setEditingAddrIdx(idx); };

  const handleAddrFormChange = e => {
    const { name, value, type, checked } = e.target;
    setAddrForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectAddrAsDefault = idx => {
    // Mark chosen address as default, update localStorage + re-hydrate formData
    const chosen = addrList[idx];
    const updated = addrList.map((a, i) => ({ ...a, isDefault: i === idx }));
    setAddrList(updated);
    localStorage.setItem('address', btoa(JSON.stringify({
      id: chosen.id, name: chosen.name, email: chosen.email, phone: chosen.mobile,
      state: chosen.province, city: chosen.area, address: chosen.building,
      short_national_address: chosen.short_national_address, is_default: 1,
    })));
    // Re-hydrate formData so the address card shows the selected address
    const parts = (chosen.name || '').split(' ');
    setFormData(p => ({
      ...p,
      billingAddress: { ...p.billingAddress, first_name: parts[0]||'', last_name: parts.slice(1).join(' ')||'',
        email: chosen.email, mobile: chosen.mobile, area: chosen.area, building: chosen.building,
        province: chosen.province, short_national_address: chosen.short_national_address },
    }));
    setShowAddrModal(false);
  };

  const saveAddrForm = async () => {
    const errs = {};
    if (!addrForm.area?.trim()) errs.area = 'City is required';
    if (!addrForm.building?.trim()) errs.building = 'Full Address is required';
    if (!addrForm.province?.trim()) errs.province = 'Province is required';
    if (!addrForm.short_national_address?.trim()) errs.short_national_address = 'Short National Address is required';
    else if (!/^[A-Za-z]{4}[0-9]{4}$/.test(addrForm.short_national_address)) errs.short_national_address = 'Must be 4 letters + 4 numbers (e.g. ABCD1234)';
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
        short_national_address: defaultAddr.short_national_address, is_default: 1,
      })));
    }

    // ALWAYS re-hydrate checkout formData from the just-edited address
    // (so the address card in checkout reflects the change immediately)
    const refill = addrForm;
    const parts = (refill.name || '').split(' ');
    setFormData(p => ({
      ...p,
      billingAddress: { ...p.billingAddress, first_name: parts[0]||'', last_name: parts.slice(1).join(' ')||'',
        email: refill.email, mobile: refill.mobile, area: refill.area, building: refill.building,
        province: refill.province, short_national_address: refill.short_national_address },
    }));

    setAddrList(updated);

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
    } catch {}

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
    if (!couponCode.trim()) { setCouponError('Coupon Code is Required'); return; }
    if (!isOTPVerified && !isLoggedIn) { setCouponError('Please verify your mobile number first.'); return; }
    const eligibleItems = cartProducts.filter(i => !i.discount && !i.is_gift);
    if (!eligibleItems.length) { setCouponError('Coupon not applicable to cart items.'); setCouponCode(''); return; }
    const validCoupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    const payload = { company: 'KSA', salesType: 'EComm', couponRegistrationId: validCoupon ? validCoupon.couponRegistrationId : 0, couponCode: validCoupon ? '' : couponCode.trim(), mobileNo: user?.phone || formData.billingAddress.mobile, email: user?.email || formData.billingAddress.email };
    const res = await fetch(`${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/ActiveCoupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { setCouponError('Invalid or expired coupon code.'); setCouponCode(''); return; }
    const data = await res.json();
    let apiCoupon = data.data?.[0];
    if (apiCoupon && !validCoupon) {
      apiCoupon = { id: apiCoupon.couponCode, code: apiCoupon.couponCode, title: apiCoupon.promotionName, value: apiCoupon.value, coupon_type: apiCoupon.baseOn === 'P' ? 'percent' : 'amount', type: 'customer', end_date: apiCoupon.validTo, start_date: apiCoupon.registrationDate, couponRegistrationId: apiCoupon.couponRegistrationId, salesType: apiCoupon.salesType, company: apiCoupon.company, whsCode: apiCoupon.whsCode };
    }
    const couponToApply = validCoupon || apiCoupon;
    if (!couponToApply) { setCouponError('Invalid or expired coupon code.'); setCouponCode(''); return; }
    setCartProducts(cartProducts.map(item => ({ ...item, ...((!item.discount && !item.is_gift) ? { is_coupon: true, value: couponToApply.value, coupon_type: couponToApply.coupon_type } : {}) })));
    setCouponError(null); setCouponData(couponToApply); setCouponDataContext(couponToApply);
    setCouponSuccess(`✅ ${couponToApply.code} applied — ${couponToApply.title}`);
  };

  const mapProductsFromFormData = products => products.map(item => ({
    product_id: item.product_id, product_name: item.product_name, quantity: item.quantity,
    category_name: item.category_name, subcategory_name: item.subcategory_name,
    coupon: item.coupon, discount: item.discount,
    ...('is_coupon' in item && { is_coupon: item.is_coupon }),
    ...('is_gift' in item && { is_gift: item.is_gift }),
    ...('coupon_type' in item && { coupon_type: item.coupon_type }),
    ...('value' in item && { value: item.value }),
    ...('campaign' in item && { campaign: item.campaign }),
    ...('type' in item && { type: item.type }),
  }));

  async function onOrder(event) {
    event.preventDefault();
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      if (!window.__placeOrderTracked && cartProducts?.length) {
        window.__placeOrderTracked = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'add_payment_info', ecommerce: { currency: 'SAR', value: parseFloat(totalPrice||0), payment_type: selectedOption||'cod', items: cartProducts.filter(i => !i.is_gift).map(i => ({ item_id: i.product_id?.toString(), item_name: i.product_name, price: parseFloat(i.price||0), quantity: i.quantity||1 })) } });
        if (typeof window.fbq === 'function') window.fbq('track', 'AddPaymentInfo', { content_ids: cartProducts.filter(i=>!i.is_gift).map(i=>i.product_id?.toString()), content_type: 'product', value: parseFloat(totalPrice||0), currency: 'SAR' });
      }
    } catch(e) {}

    const short_national_address = formData.billingAddress.short_national_address?.trim();
    if (!/^[A-Za-z]{4}[0-9]{4}$/.test(short_national_address)) {
      setIsLoading(false);
      setError('Valid Short National Address is required — 4 letters + 4 numbers (e.g. ABCD1234)');
      return;
    }

    const shippingPrice = freeShippingFlag ? 0.00 : parseFloat(shippingServiceCharges[0].price);
    const shippingPriceVat = shippingPrice / 100 * vatTax.percentage;
    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1].price);
    const servicePrice = shippingServiceCharges[1].price;
    const servicePriceVat = servicePrice / 100 * vatTax.percentage;
    let userJson = null;
    if (isLoggedIn) { userJson = JSON.parse(atob(localStorage.getItem('user'))); }
    const { shippingAdd, note, password, otp, ...cleanFormData } = formData;
    const additionalFields = { ...cleanFormData, products: mapProductsFromFormData(cartProducts), payment_method: selectedOption, shippingPrice, shippingPriceVat, servicePrice, servicePriceVat, vatTax: vatTax.percentage, totalPrice, finalPrice, customer_id: userJson ? userJson.id : null, locale, couponCode, couponData };
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`, {
        method: 'POST', body: JSON.stringify(additionalFields),
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (response.status === 401) {
        ['user','token'].forEach(k => localStorage.getItem(k) && localStorage.removeItem(k));
        setError(isLoggedIn ? 'Session expired. Please login again.' : 'Verification expired. Please verify your number again.');
        setTimeout(() => window.location.reload(), 2000); return;
      }
      if (!response.ok) throw new Error('Session expired. Please refresh the page or login again.');
      const data = await response.json();

      if (data.message?.split(' ')[0] === 'Order') {
        setSuccess(data.message); setError(null); setOrderDetails(data);
        setFormData({ shippingAddress:{first_name:'',last_name:'',mobile:'',email:'',area:'',building:'',province:''}, billingAddress:{first_name:'',last_name:'',mobile:'',email:'',area:'',building:'',province:'',short_national_address:''}, shippingAdd:false });
        setTimeout(() => router.push(`/${locale}/shop-order-complete`), 1000);
      } else if (data.message === 'Redirecting to Payfort...') {
        setSuccess(data.message); setError(null);
        const form = document.createElement('form'); form.action = data.redirect_url; form.method = 'POST';
        Object.entries(data.request_params).forEach(([k,v]) => { const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; form.appendChild(i); });
        document.body.appendChild(form); form.submit(); return;
      } else if (data.message === 'Redirecting to Tabby...')   { setSuccess(data.message); setError(null); router.push(data.redirect_url); }
        else if (data.message === 'Redirecting to Paytabs...') { setSuccess(data.message); setError(null); router.push(data.redirect_url); }
        else if (data.message === 'Redirecting to Tamara...')  { setSuccess(data.message); setError(null); router.push(data.redirect_url); }
        else {
        const errField = ['qtyMessage','discountMessage','couponMessage','duplicateOrderMessage','error'].find(k => data[k]);
        if (errField) { setError(data[errField]); }
        else {
          const fErr = ['products','billingAddress.first_name','billingAddress.last_name','billingAddress.email','billingAddress.mobile','billingAddress.area','billingAddress.building','billingAddress.province'].find(k => data[k]);
          if (fErr) setError(data[fErr]);
        }
        setSuccess(null);
      }
    } catch(err) { setError(err.message); } finally { setIsLoading(false); }
  }

  async function sendOTP(e) {
    e.preventDefault(); setIsSendOTPLoading(true);
    if (!formData.billingAddress.mobile) { setOTPError('Mobile Number is Required'); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    if (!/^\d{10}$/.test(formData.billingAddress.mobile)) { setOTPError('Invalid Mobile Number'); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    setOTPError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/sendOTP`, { method:'POST', body:JSON.stringify({mobile:formData.billingAddress.mobile}), headers:{'Content-Type':'application/json'} });
      if (!res.ok) throw new Error('Failed to send OTP. Please try again.');
      const data = await res.json();
      if (data.message?.split(' ')[0] === 'OTP') { setOTPSuccess(data.message); setOTPError(null); setIsOTPButton(false); }
      else { if(data.mobile) setOTPError(data.mobile); }
    } catch(err) { setOTPError(err.message); } finally { setIsSendOTPLoading(false); }
  }

  async function verifyOTP(e) {
    e.preventDefault(); setIsSendOTPLoading(true);
    if (!formData.otp) { setOTPError('OTP is Required'); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    if (!/^\d+$/.test(formData.otp)) { setOTPError('Invalid OTP'); setOTPSuccess(null); setIsSendOTPLoading(false); return; }
    setOTPError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, { method:'POST', body:JSON.stringify({mobile:formData.billingAddress.mobile, otp:formData.otp, flag:'checkout'}), headers:{'Content-Type':'application/json'} });
      if (!res.ok) throw new Error('Failed to verify. Please try again.');
      const data = await res.json();
      if (data.message?.split(' ')[0] === 'Invalid') { setOTPSuccess(null); setOTPError(data.message); }
      else if (data.message?.split(' ')[0] === 'OTP') {
        setOTPSuccess(data.message); setIsOTPVerified(true); setOTPError(null);
        localStorage.setItem('token', data.access_token);
        // useEffect will auto-advance to section 3
      } else {
        if (data.mobile) setOTPError(data.mobile);
        if (data.otp) setOTPError(data.otp);
        setOTPSuccess(null);
      }
    } catch(err) { setOTPError(err.message); } finally { setIsSendOTPLoading(false); }
  }

  // Section 1 client-side validation + OTP check for guests
  const handleSection1Continue = () => {
    const b = formData.billingAddress;
    const errs = {};
    if (!b.first_name.trim())  errs.first_name = 'Required';
    if (!b.last_name.trim())   errs.last_name  = 'Required';
    if (!/^\d{10}$/.test(b.mobile)) errs.mobile = 'Enter a valid 10-digit number';
    if (!b.email.trim())       errs.email    = 'Required';
    if (!b.area.trim())        errs.area     = 'Required';
    if (!b.building.trim())    errs.building = 'Required';
    if (!b.province.trim())    errs.province = 'Required';
    if (!/^[A-Za-z]{4}[0-9]{4}$/.test(b.short_national_address?.trim()))
      errs.short_national_address = '4 letters + 4 numbers, e.g. ABCD1234';
    // Guest must verify OTP before continuing
    if (!isLoggedIn && !isOTPVerified) {
      errs._otp = 'Please verify your mobile number before continuing';
    }
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setDoneSection1(true);
    setActiveSection(2);
  };

  // Utility: item subtotal for order summary (discounted final price)
  const itemSubtotal = (elm) => {
    const nowGST = new Date(new Date().getTime() + 4*60*60*1000);
    const now = nowGST.toISOString().slice(0,19).replace('T',' ');
    let p = parseFloat(elm.price);
    if (elm.is_gift) return `0.00${currency.symbol}`;
    if (elm?.discount && new Date(now) >= new Date(elm.discount.start_date) && new Date(now) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type === 'percent') p = p - p/100*elm.discount.value;
      else p = elm.discount.final_price || p;
    } else if (!elm?.discount && elm?.sale_price && Number(elm.sale_price) > 0 && Number(elm.sale_price) < parseFloat(elm.price)) {
      // Legacy flat sale_price
      p = Number(elm.sale_price);
    } else if (couponData?.type === 'customer' && elm.is_coupon) {
      if (couponData.coupon_type === 'percent') p = p - p/100*couponData.value;
      else p = p - couponData.value;
    }
    return `${(p * elm.quantity).toFixed(2)}${currency.symbol}`;
  };

  // Whether an item has an active price reduction (for strikethrough display)
  const itemIsDiscounted = (elm) => {
    const nowGST = new Date(new Date().getTime() + 4*60*60*1000);
    const now = nowGST.toISOString().slice(0,19).replace('T',' ');
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

  /* ------------------------------------------------------------------ */
  /*  GUARDS                                                              */
  /* ------------------------------------------------------------------ */
  if (isMenuLoading) return <div><Pagination1 /></div>;
  if (isMenuError)   return <div>{isMenuError}</div>;

  /* ------------------------------------------------------------------ */
  /*  SECTION SUMMARIES (shown when collapsed)                           */
  /* ------------------------------------------------------------------ */
  const b = formData.billingAddress;
  const section1Summary = doneSection1
    ? `${b.first_name} ${b.last_name} · ${b.mobile} · ${b.area}`
    : '';

  /* ------------------------------------------------------------------ */
  /*  JSX                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <>
    {cartProducts.length ? (
      <>
        <FreeGiftFeature couponData={couponData}/>
        <BogoFeature/>
        <form onSubmit={onOrder}>
          <div className="cc-checkout-layout">

            {/* ============================================
                LEFT — ACCORDION
            ============================================ */}
            <div className="cc-checkout-left">
              <div className="cc-acc">

                {/* ── SECTION 1: DELIVERY ── */}
                <div className={`cc-acc-section ${activeSection===1 ? 'is-active' : doneSection1 ? 'is-completed' : 'is-locked'}`}>
                  <div className="cc-acc-header" onClick={() => doneSection1 && setActiveSection(1)} role="button" tabIndex={0}>
                    <div className="cc-acc-dot">{doneSection1 ? '✓' : '1'}</div>
                    <div className="cc-acc-title-group">
                      <span className="cc-acc-title">Delivery Details</span>
                      {doneSection1 && activeSection !== 1 && (
                        <span className="cc-acc-summary-line">{section1Summary}</span>
                      )}
                    </div>
                    {doneSection1 && activeSection !== 1 && (
                      <button type="button" className="cc-acc-edit" onClick={e => { e.stopPropagation(); setActiveSection(1); }}>Edit</button>
                    )}
                    <span className="cc-acc-chevron">{activeSection === 1 ? '▲' : '▼'}</span>
                  </div>

                  <div className="cc-acc-body">
                    {/* Field errors */}
                    {Object.keys(fieldErrors).length > 0 && (
                      <div className="cc-alert cc-alert--error">Please fix the highlighted fields below.</div>
                    )}

                    {isLoggedIn ? (
                      /* ── LOGGED-IN: Clean address card display ── */
                      <div>
                        {/* Hidden inputs to keep form data for submission */}
                        <input type="hidden" name="billingAddress.first_name" value={b.first_name} />
                        <input type="hidden" name="billingAddress.last_name" value={b.last_name} />
                        <input type="hidden" name="billingAddress.country" value="Saudi Arabia" />
                        <input type="hidden" name="billingAddress.short_national_address" value={b.short_national_address} />
                        <input type="hidden" name="billingAddress.area" value={b.area} />
                        <input type="hidden" name="billingAddress.building" value={b.building} />
                        <input type="hidden" name="billingAddress.province" value={b.province} />

                        {/* Address Summary Card */}
                        <div className="cc-address-card">
                          <div className="cc-address-card__header">
                            <div className="cc-address-card__badge">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              Default Delivery Address
                            </div>
                            <button
                              type="button"
                              className="cc-address-card__edit-btn"
                              onClick={openAddrModal}
                            >
                              Change Address
                            </button>
                          </div>

                          <div className="cc-address-card__body">
                            <p className="cc-address-card__name">{b.first_name} {b.last_name}</p>
                            {b.building && <p className="cc-address-card__line">{b.building}</p>}
                            {b.area && b.province && <p className="cc-address-card__line">{b.area}, {b.province}</p>}
                            {b.short_national_address && <p className="cc-address-card__line cc-address-card__line--sna">📍 {b.short_national_address}</p>}
                            <p className="cc-address-card__line">Saudi Arabia</p>
                          </div>
                        </div>

                        {/* Editable contact fields for logged-in */}
                        <div className="row g-2 mt-1">
                          <div className="col-12">
                            <div className="form-floating">
                              <input type="email" className={`form-control${fieldErrors.email?' border-danger':''}`} id="bill_email" placeholder="Email" name="billingAddress.email" value={b.email} onChange={handleChange} required />
                              <label htmlFor="bill_email">Email Address *</label>
                            </div>
                            {fieldErrors.email && <div className="cc-alert cc-alert--error py-1 mt-1">{fieldErrors.email}</div>}
                          </div>
                          <div className="col-12">
                            <div className="form-floating">
                              <input type="text" pattern="^\d{10}$" className={`form-control${fieldErrors.mobile?' border-danger':''}`} id="bill_mobile" placeholder="Mobile" name="billingAddress.mobile" value={b.mobile} onChange={handleChange} required />
                              <label htmlFor="bill_mobile" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Mobile Number *</label>
                            </div>
                            <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. 0500000000</p>
                            {fieldErrors.mobile && <div className="cc-alert cc-alert--error py-1 mt-1">{fieldErrors.mobile}</div>}
                          </div>
                        </div>

                        {/* Ship to different address */}
                        <div className="mt-2">
                          <div className="form-check mb-0">
                            <input className="form-check-input" type="checkbox" id="ship_diff" onChange={handleCheckboxChange}/>
                            <label className="form-check-label small" htmlFor="ship_diff">Ship to different address</label>
                          </div>
                        </div>

                        {/* Shipping address (collapsible) */}
                        {showShipping && (
                          <div className="row g-2 mt-1">
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_fn" placeholder="First Name" name="shippingAddress.first_name" value={formData.shippingAddress.first_name} onChange={handleChange} required/>
                                <label htmlFor="ship_fn">First Name *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_ln" placeholder="Last Name" name="shippingAddress.last_name" value={formData.shippingAddress.last_name} onChange={handleChange} required/>
                                <label htmlFor="ship_ln">Last Name *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_country" name="shippingAddress.country" value="Saudi Arabia" readOnly />
                                <label htmlFor="ship_country">Country</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_sna" placeholder="Short National Address" name="shippingAddress.short_national_address" value={formData.shippingAddress.short_national_address || ''} onChange={handleChange} required maxLength="8" pattern="^[A-Za-z]{4}[0-9]{4}$" />
                                <label htmlFor="ship_sna" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Short National Address *</label>
                              </div>
                              <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. ABCD1234</p>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_area" placeholder="City" name="shippingAddress.area" value={formData.shippingAddress.area} onChange={handleChange} required/>
                                <label htmlFor="ship_area">City *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_prov" placeholder="Province" name="shippingAddress.province" value={formData.shippingAddress.province} onChange={handleChange} required/>
                                <label htmlFor="ship_prov">Province *</label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_bldg" placeholder="Full Address" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required/>
                                <label htmlFor="ship_bldg">Full Address *</label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-floating">
                                <input type="email" className="form-control" id="ship_email" placeholder="Email" name="shippingAddress.email" value={formData.shippingAddress.email} onChange={handleChange} required/>
                                <label htmlFor="ship_email">Email *</label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-floating">
                                <input type="text" pattern="^\d{10}$" className="form-control" id="ship_mob" placeholder="Mobile" name="shippingAddress.mobile" value={formData.shippingAddress.mobile} onChange={handleChange} required/>
                                <label htmlFor="ship_mob" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Mobile Number *</label>
                              </div>
                              <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. 0500000000</p>
                            </div>
                          </div>
                        )}

                        {/* Add / Remove note toggle — logged-in DISABLED */}
                        {/* <div className="mt-2">
                          {!showNote ? (
                            <button type="button" className="cc-toggle-link" onClick={() => setShowNote(true)}>
                              <span className="cc-toggle-icon">+</span>
                              Add order note (optional)
                            </button>
                          ) : (
                            <div>
                              <textarea className="form-control mt-1" placeholder="Order notes…" rows="3" name="note" value={formData.note} onChange={handleChange} autoFocus />
                              <button type="button" className="cc-toggle-link" style={{marginTop:'0.35rem',color:'#c0392b'}} onClick={() => { setShowNote(false); setFormData(p=>({...p,note:''})); }}>
                                <span className="cc-toggle-icon" style={{color:'#c0392b'}}>−</span>
                                Remove order note
                              </button>
                            </div>
                          )}
                        </div> */}
                      </div>
                    ) : (
                      /* ── GUEST: Full form ── */
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.first_name?' border-danger':''}`} id="bill_fn" placeholder="First Name" name="billingAddress.first_name" value={b.first_name} onChange={handleChange} required />
                            <label htmlFor="bill_fn">First Name *</label>
                          </div>
                          {fieldErrors.first_name && <div className="cc-alert cc-alert--error py-1 mt-1">{fieldErrors.first_name}</div>}
                        </div>
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.last_name?' border-danger':''}`} id="bill_ln" placeholder="Last Name" name="billingAddress.last_name" value={b.last_name} onChange={handleChange} required />
                            <label htmlFor="bill_ln">Last Name *</label>
                          </div>
                          {fieldErrors.last_name && <div className="cc-alert cc-alert--error py-1 mt-1">{fieldErrors.last_name}</div>}
                        </div>

                        {/* Row: Country + Short National Address */}
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className="form-control" id="bill_country" name="billingAddress.country" value="Saudi Arabia" readOnly />
                            <label htmlFor="bill_country">Country</label>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.short_national_address?' border-danger':''}`} id="bill_sna" placeholder="Short National Address" name="billingAddress.short_national_address" value={b.short_national_address} onChange={handleChange} required maxLength="8" pattern="^[A-Za-z]{4}[0-9]{4}$" />
                            <label htmlFor="bill_sna" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Short National Address *</label>
                          </div>
                          <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. ABCD1234</p>
                          {fieldErrors.short_national_address && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.short_national_address}</div>}
                        </div>

                        {/* Row: City + Province */}
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.area?' border-danger':''}`} id="bill_city" placeholder="City" name="billingAddress.area" value={b.area} onChange={handleChange} required />
                            <label htmlFor="bill_city">City *</label>
                          </div>
                          {fieldErrors.area && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.area}</div>}
                        </div>
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.province?' border-danger':''}`} id="bill_prov" placeholder="Province" name="billingAddress.province" value={b.province} onChange={handleChange} required />
                            <label htmlFor="bill_prov">Province *</label>
                          </div>
                          {fieldErrors.province && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.province}</div>}
                        </div>

                        {/* Row: Full Address — full width */}
                        <div className="col-12">
                          <div className="form-floating">
                            <input type="text" className={`form-control${fieldErrors.building?' border-danger':''}`} id="bill_addr" placeholder="Full Address" name="billingAddress.building" value={b.building} onChange={handleChange} required />
                            <label htmlFor="bill_addr">Full Address *</label>
                          </div>
                          {fieldErrors.building && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.building}</div>}
                        </div>

                        {/* Row: Email + Mobile */}
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="email" className={`form-control${fieldErrors.email?' border-danger':''}`} id="bill_email" placeholder="Email" name="billingAddress.email" value={b.email} onChange={handleChange} required />
                            <label htmlFor="bill_email">Email Address *</label>
                          </div>
                          {fieldErrors.email && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.email}</div>}
                        </div>
                        <div className="col-6">
                          <div className="form-floating">
                            <input type="text" pattern="^\d{10}$" className={`form-control${fieldErrors.mobile?' border-danger':''}`} id="bill_mobile" placeholder="Mobile" name="billingAddress.mobile" value={b.mobile} onChange={handleChange} required />
                            <label htmlFor="bill_mobile" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Mobile Number *</label>
                          </div>
                          <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. 0500000000</p>
                          {fieldErrors.mobile && <div className="cc-alert cc-alert--error py-1 mt-1" style={{fontSize:'0.72rem'}}>{fieldErrors.mobile}</div>}
                        </div>

                        {/* ── INLINE OTP (guest users only) ── */}
                        <div className="col-12">
                          <div style={{background:'#fafafa',border:'1px solid #eee',borderRadius:'4px',padding:'0.85rem',marginTop:'0.25rem'}}>
                            <p style={{fontSize:'0.78rem',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',color:'#555',marginBottom:'0.6rem'}}>
                              📱 Verify Mobile Number
                            </p>

                            {OTPError   && <div className="cc-alert cc-alert--error"  style={{marginBottom:'0.5rem'}}>{OTPError}</div>}
                            {OTPSuccess && !isOTPVerified && <div className="cc-alert cc-alert--success" style={{marginBottom:'0.5rem'}}>{OTPSuccess}</div>}

                            {isOTPVerified ? (
                              <div className="cc-alert cc-alert--success" style={{margin:0}}>✅ Mobile verified successfully</div>
                            ) : isOTPButton ? (
                              <button
                                type="button"
                                className="cc-acc-continue"
                                disabled={isSendOTPLoading || !b.mobile || !/^\d{10}$/.test(b.mobile)}
                                onClick={sendOTP}
                                style={{height:'2.6rem',fontSize:'0.8rem'}}
                              >
                                {isSendOTPLoading ? 'Sending OTP…' : '📲 Send OTP to verify number'}
                              </button>
                            ) : (
                              <div style={{display:'flex',gap:'0.5rem',alignItems:'stretch'}}>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="otp_input"
                                  placeholder="Enter 4-digit OTP"
                                  name="otp"
                                  value={formData.otp}
                                  onChange={handleChange}
                                  autoFocus
                                  style={{flex:1,height:'2.8rem'}}
                                />
                                <button
                                  type="button"
                                  className="cc-acc-continue"
                                  disabled={isSendOTPLoading}
                                  onClick={verifyOTP}
                                  style={{width:'auto',padding:'0 1rem',height:'2.8rem',fontSize:'0.78rem',flex:'0 0 auto',marginTop:0}}
                                >
                                  {isSendOTPLoading ? 'Verifying…' : '✅ Verify'}
                                </button>
                                <button
                                  type="button"
                                  style={{background:'none',border:'none',fontSize:'0.72rem',color:'#aaa',textDecoration:'underline',cursor:'pointer',flex:'0 0 auto',padding:'0 0.25rem'}}
                                  onClick={sendOTP}
                                  disabled={isSendOTPLoading}
                                >
                                  Resend
                                </button>
                              </div>
                            )}

                            {fieldErrors._otp && !isOTPVerified && (
                              <div className="cc-alert cc-alert--error" style={{marginTop:'0.5rem'}}>{fieldErrors._otp}</div>
                            )}
                          </div>
                        </div>

                        {/* Optional extras */}
                        <div className="col-12">
                          <div className="d-flex gap-3 flex-wrap">
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="checkbox" id="ship_diff" onChange={handleCheckboxChange}/>
                              <label className="form-check-label small" htmlFor="ship_diff">Ship to different address</label>
                            </div>
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="checkbox" id="create_acc" onChange={() => setCreateAccount(v=>!v)}/>
                              <label className="form-check-label small" htmlFor="create_acc">Create account</label>
                            </div>
                          </div>
                        </div>

                        {/* Shipping address (collapsible) */}
                        {showShipping && (
                          <>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_fn" placeholder="First Name" name="shippingAddress.first_name" value={formData.shippingAddress.first_name} onChange={handleChange} required/>
                                <label htmlFor="ship_fn">First Name *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_ln" placeholder="Last Name" name="shippingAddress.last_name" value={formData.shippingAddress.last_name} onChange={handleChange} required/>
                                <label htmlFor="ship_ln">Last Name *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_country" name="shippingAddress.country" value="Saudi Arabia" readOnly />
                                <label htmlFor="ship_country">Country</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_sna2" placeholder="Short National Address" name="shippingAddress.short_national_address" value={formData.shippingAddress.short_national_address || ''} onChange={handleChange} required maxLength="8" pattern="^[A-Za-z]{4}[0-9]{4}$" />
                                <label htmlFor="ship_sna2" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Short National Address *</label>
                              </div>
                              <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. ABCD1234</p>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_area" placeholder="City" name="shippingAddress.area" value={formData.shippingAddress.area} onChange={handleChange} required/>
                                <label htmlFor="ship_area">City *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_prov" placeholder="Province" name="shippingAddress.province" value={formData.shippingAddress.province} onChange={handleChange} required/>
                                <label htmlFor="ship_prov">Province *</label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-floating">
                                <input type="text" className="form-control" id="ship_bldg" placeholder="Full Address" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required/>
                                <label htmlFor="ship_bldg">Full Address *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="email" className="form-control" id="ship_email" placeholder="Email" name="shippingAddress.email" value={formData.shippingAddress.email} onChange={handleChange} required/>
                                <label htmlFor="ship_email">Email *</label>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="form-floating">
                                <input type="text" pattern="^\d{10}$" className="form-control" id="ship_mob" placeholder="Mobile" name="shippingAddress.mobile" value={formData.shippingAddress.mobile} onChange={handleChange} required/>
                                <label htmlFor="ship_mob" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>Mobile Number *</label>
                              </div>
                              <p style={{fontSize:'0.65rem',color:'#aaa',margin:'2px 0 0 2px',lineHeight:1.3}}>e.g. 0500000000</p>
                            </div>
                          </>
                        )}

                        {createAccount && (
                          <div className="col-12">
                            <div className="form-floating">
                              <input type="password" className="form-control" id="acc_pass" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required/>
                              <label htmlFor="acc_pass">Password *</label>
                            </div>
                          </div>
                        )}

                        {/* Add / Remove note toggle — guest DISABLED */}
                        {/* <div className="col-12">
                          {!showNote ? (
                            <button type="button" className="cc-toggle-link" onClick={() => setShowNote(true)}>
                              <span className="cc-toggle-icon">+</span>
                              Add order note (optional)
                            </button>
                          ) : (
                            <div>
                              <textarea className="form-control mt-1" placeholder="Order notes…" rows="3" name="note" value={formData.note} onChange={handleChange} autoFocus />
                              <button type="button" className="cc-toggle-link" style={{marginTop:'0.35rem',color:'#c0392b'}} onClick={() => { setShowNote(false); setFormData(p=>({...p,note:''})); }}>
                                <span className="cc-toggle-icon" style={{color:'#c0392b'}}>−</span>
                                Remove order note
                              </button>
                            </div>
                          )}
                        </div> */}
                      </div>
                    )}


                    <button type="button" className="cc-acc-continue" onClick={handleSection1Continue}>
                      Continue →
                    </button>
                  </div>
                </div>


                {/* ── SECTION 2: PAYMENT & ORDER ── */}
                <div className={`cc-acc-section ${
                  activeSection===2 ? 'is-active'
                  : !doneSection1 ? 'is-locked'
                  : ''
                }`}>
                  <div className="cc-acc-header"
                    onClick={() => doneSection1 && setActiveSection(activeSection===2 ? 1 : 2)}
                    role="button" tabIndex={0}
                    style={{ cursor: doneSection1 ? 'pointer' : 'default' }}
                  >
                    <div className="cc-acc-dot">{isLoggedIn ? '2' : '2'}</div>
                    <div className="cc-acc-title-group">
                      <span className="cc-acc-title">Payment & Order</span>
                    </div>
                    <span className="cc-acc-chevron">{activeSection===2?'▲':'▼'}</span>
                  </div>

                  <div className="cc-acc-body">
                    {/* Mini order summary */}
                    {/* ── MOBILE-ONLY Collapsible Promo Code ── above order summary ── */}
                    <div className="d-xl-none" style={{marginBottom:'0.75rem'}}>
                      {couponData ? (
                        /* Applied state — always visible, no collapse needed */
                        <div className="cc-coupon-card" style={{padding:'0.65rem 0.75rem'}}>
                          <div className="cc-coupon-applied">
                            <span className="cc-coupon-applied__icon">🏷️</span>
                            <div className="cc-coupon-applied__text">
                              <span className="cc-coupon-applied__code">{couponData.code}</span>
                              <span className="cc-coupon-applied__desc">{couponData.title}</span>
                            </div>
                            <button type="button" className="cc-coupon-applied__remove" onClick={removeCoupon} title="Remove coupon">&times;</button>
                          </div>
                          {couponError   && <div className="cc-coupon-msg cc-coupon-msg--err">{couponError}</div>}
                          {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok">{couponSuccess}</div>}
                        </div>
                      ) : (
                        /* Collapsible input state */
                        <div className="cc-promo-mobile">
                          {/* Toggle header */}
                          <button
                            type="button"
                            className="cc-promo-mobile__toggle"
                            onClick={() => setShowCouponPanel(v => !v)}
                            aria-expanded={showCouponPanel}
                          >
                            <span className="cc-promo-mobile__toggle-label">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                              Have a Promo Code?
                            </span>
                            <svg
                              className={`cc-promo-mobile__chevron${showCouponPanel ? ' open' : ''}`}
                              width="12" height="12" viewBox="0 0 10 6" fill="none"
                            >
                              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>

                          {/* Collapsible body */}
                          {showCouponPanel && (
                            <div className="cc-promo-mobile__body">
                              <div className="cc-coupon-label-row" style={{marginBottom:'0.5rem'}}>
                                <span style={{fontSize:'0.72rem',color:'#888'}}>Enter your code below</span>
                                <button type="button" className="cc-coupon-view-offers" onClick={() => setShowCouponModal(true)}>View Offers</button>
                              </div>
                              <div className="cc-coupon-input-wrap">
                                <input
                                  className="cc-coupon-input"
                                  type="text"
                                  placeholder="Promo / Coupon code"
                                  value={couponCode}
                                  onChange={handleCouponChange}
                                  onKeyDown={e => e.key === 'Enter' && applyCoupon(e)}
                                  autoFocus
                                />
                                <button type="button" className="cc-coupon-apply-btn" onClick={applyCoupon}>Apply</button>
                              </div>
                              {couponError   && <div className="cc-coupon-msg cc-coupon-msg--err" style={{marginTop:'0.4rem'}}>{couponError}</div>}
                              {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok" style={{marginTop:'0.4rem'}}>{couponSuccess}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mini order summary */}
                    <div className="cc-order-mini">
                      <div className={`cc-order-mini__toggle ${summaryOpen?'open':''}`} onClick={() => setSummaryOpen(v=>!v)} role="button">
                        <span>Order Summary ({cartProducts.length} item{cartProducts.length!==1?'s':''})</span>
                        <span><strong>{grandTotal}{currency.symbol}</strong></span>
                        <svg width="12" height="12" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>

                      <div className={`cc-order-mini__items ${summaryOpen?'open':''}`}>
                        {cartProducts.map((elm, i) => (
                          <div key={i}>
                            <span>{he.decode(elm.product_name)} &times;{elm.quantity}</span>
                            <span>
                              {itemIsDiscounted(elm) && (
                                <span style={{textDecoration:'line-through',color:'#aaa',fontSize:'0.72rem',display:'block',fontWeight:400}}>{itemOriginalSubtotal(elm)}</span>
                              )}
                              {itemSubtotal(elm)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="cc-order-mini__totals">
                        <div>
                          <span>Subtotal</span>
                          <span>{totalPrice.toFixed(2)}{currency.symbol}</span>
                        </div>
                        <div>
                          <span>Shipping</span>
                          <span>{freeShippingFlag ? '🎉 Free' : `${shippingCostDisplay}${currency.symbol}`}</span>
                        </div>
                        <div className="total-row">
                          <span>Total (VAT incl.)</span>
                          <span>{grandTotal}{currency.symbol}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coupon: REMOVED from accordion — now exclusively in right-side "Your Order" card */}


                    {/* Tamara widget */}
                    <TamaraWidget amount={grandTotal} inlineType='2' inlineVariant='outlined' locale={locale}/>

                    {/* Payment methods — compact 2-column grid */}
                    <p className="cc-pay-label">Select Payment Method</p>
                    <div className="cc-payment-grid cc-payment-grid--compact">
                      {/* COD */}
                      <label className={`cc-payment-card ${selectedOption==='cod'?'cc-payment-card--selected':''}`} htmlFor="pay_cod">
                        <input type="radio" id="pay_cod" name="checkout_payment_method" value="cod" checked={selectedOption==='cod'} onChange={handleRadioChange}/>
                        <div className="cc-payment-card__radio"></div>
                        <div className="cc-payment-card__content">
                          <span className="cc-payment-card__title">Cash on Delivery</span>
                          <span className="cc-payment-card__subtitle">Pay when order arrives</span>
                        </div>
                      </label>

                      {/* PayTabs */}
                      <label className={`cc-payment-card ${selectedOption==='paytabs'?'cc-payment-card--selected':''}`} htmlFor="pay_pt">
                        <input type="radio" id="pay_pt" name="checkout_payment_method" value="paytabs" checked={selectedOption==='paytabs'} onChange={handleRadioChange}/>
                        <div className="cc-payment-card__radio"></div>
                        <div className="cc-payment-card__content">
                          <span className="cc-payment-card__title">Card Payment</span>
                          <div className="cc-payment-card__logos">
                            <Image src="/assets/images/paytabs-svg/mada-logo.png" alt="Mada" width={36} height={14} style={{objectFit:'contain'}}/>
                            <Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="Apple Pay" width={36} height={14} style={{objectFit:'contain'}}/>
                          </div>
                        </div>
                      </label>

                      {/* Tamara */}
                      <label className={`cc-payment-card ${selectedOption==='tamara'?'cc-payment-card--selected':''}`} htmlFor="pay_tmr">
                        <input type="radio" id="pay_tmr" name="checkout_payment_method" value="tamara" checked={selectedOption==='tamara'} onChange={handleRadioChange}/>
                        <div className="cc-payment-card__radio"></div>
                        <div className="cc-payment-card__content">
                          <span className="cc-payment-card__title">Tamara</span>
                          <div className="cc-payment-card__logos">
                            <TamaraWidget inlineType='4' inlineVariant='text' locale={locale}/>
                          </div>
                        </div>
                      </label>

                      {/* Tabby */}
                      <label className={`cc-payment-card ${selectedOption==='tabby'?'cc-payment-card--selected':''}`} htmlFor="pay_tbb">
                        <input type="radio" id="pay_tbb" name="checkout_payment_method" value="tabby" checked={selectedOption==='tabby'} onChange={handleRadioChange}/>
                        <div className="cc-payment-card__radio"></div>
                        <div className="cc-payment-card__content">
                          <span className="cc-payment-card__title">Tabby — Pay in 4</span>
                          <div className="cc-payment-card__logos">
                            <Image src="/assets/images/paymentGateway/Tabby.png" width={50} height={20} alt="Tabby" style={{objectFit:'contain'}}/>
                          </div>
                          {selectedOption==='tabby' && <div id="tabbyCard" style={{marginTop:'0.5rem'}}></div>}
                        </div>
                      </label>
                    </div>

                    {/* Terms */}
                    <div style={{fontSize:'0.76rem',color:'#888',margin:'0.5rem 0 0.75rem'}}>
                      Your data is used to process your order per our{' '}
                      <Link href={`/${locale}/privacy`} target="_blank" style={{color:'inherit',textDecoration:'underline'}}>privacy policy</Link>.
                    </div>
                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id="terms_chk" required style={{cursor:'pointer'}}/>
                      <label className="form-check-label" htmlFor="terms_chk" style={{fontSize:'0.78rem',cursor:'pointer'}}>
                        I agree to the <Link href={`/${locale}/terms`} target="_blank" style={{color:'#b9a16b',textDecoration:'underline'}}>terms and conditions</Link> <span style={{color:'red'}}>*</span>
                      </label>
                    </div>

                    {/* Alerts */}
                    {error   && <div className="cc-alert cc-alert--error" role="alert">⚠️ {error}</div>}
                    {success && <div className="cc-alert cc-alert--success" role="status">✅ {success}</div>}

                    {/* Place Order */}
                    <button className="cc-btn-gold" type="submit" disabled={disablePlaceOrder}>
                      {isLoading
                        ? <span>Processing…</span>
                        : <>Place Order &mdash; {grandTotal}{currency.symbol}</>
                      }
                    </button>
                  </div>
                </div>
              </div>{/* end .cc-acc */}
            </div>{/* end .cc-checkout-left */}

            {/* ============================================
                RIGHT — STICKY ORDER SUMMARY (desktop only)
            ============================================ */}
            <div className="cc-checkout-right d-none d-xl-block">
              <div className="cc-order-summary-right">
                {/* Header row — toggleable */}
                <div className="cc-osr__header" onClick={() => setSummaryOpen(v => !v)} role="button" tabIndex={0}>
                  <span className="cc-osr__title">{summaryOpen ? 'Hide' : 'Show'} Order Summary</span>
                  <div className="cc-osr__header-right">
                    <span className="cc-osr__total-pill">{grandTotal}{currency.symbol}</span>
                    <svg className={`cc-osr__chevron${summaryOpen?' cc-osr__chevron--open':''}`} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                </div>

                {/* Collapsible product table */}
                {summaryOpen && (
                  <div className="cc-osr__body">
                    <div className="cc-osr__col-heads">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>
                    {cartProducts.map((elm, i) => (
                      <div key={i} className="cc-osr__row">
                        <span className="cc-osr__product-name">{he.decode(elm.product_name)} <strong>&times;{elm.quantity}</strong></span>
                        <span className="cc-osr__product-price">
                          {itemIsDiscounted(elm) ? (
                            <>
                              <span className="cc-price-old">{itemOriginalSubtotal(elm)}</span>
                              <span className="cc-price-sale">{itemSubtotal(elm)}</span>
                            </>
                          ) : (
                            <span className="cc-price-regular">{itemSubtotal(elm)}</span>
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="cc-osr__divider"/>
                    <div className="cc-osr__row cc-osr__row--sub">
                      <span>Subtotal</span>
                      <span>{totalPrice.toFixed(2)}{currency.symbol}</span>
                    </div>
                    <div className="cc-osr__row cc-osr__row--sub">
                      <span>Shipping</span>
                      <span>{freeShippingFlag ? <span className="cc-osr__free">Free</span> : `${shippingCostDisplay}${currency.symbol}`}</span>
                    </div>
                    {couponData && (
                      <div className="cc-osr__row cc-osr__row--sub cc-osr__row--discount">
                        <span>Discount ({couponData.code})</span>
                        <span>&minus;{couponData.value}{couponData.coupon_type === 'percent' ? '%' : currency.symbol}</span>
                      </div>
                    )}
                    <div className="cc-osr__divider"/>
                    <div className="cc-osr__row cc-osr__row--total">
                      <span>Total</span>
                      <span>{grandTotal}{currency.symbol} <em>(Incl. {vatAmount}{currency.symbol} VAT)</em></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="cc-coupon-card">
                {couponData ? (
                  /* Applied state */
                  <div className="cc-coupon-applied">
                    <span className="cc-coupon-applied__icon">🏷️</span>
                    <div className="cc-coupon-applied__text">
                      <span className="cc-coupon-applied__code">{couponData.code}</span>
                      <span className="cc-coupon-applied__desc">{couponData.title}</span>
                    </div>
                    <button type="button" className="cc-coupon-applied__remove" onClick={removeCoupon} title="Remove coupon">&times;</button>
                  </div>
                ) : (
                  /* Input state — label + input row, View Offers link */
                  <>
                    <div className="cc-coupon-label-row">
                      <span className="cc-coupon-label-text">Have a Promo Code?</span>
                      <button type="button" className="cc-coupon-view-offers" onClick={() => setShowCouponModal(true)}>View Offers</button>
                    </div>
                    <div className="cc-coupon-input-wrap">
                      <input
                        className="cc-coupon-input"
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={handleCouponChange}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon(e)}
                      />
                      <button type="button" className="cc-coupon-apply-btn" onClick={applyCoupon}>Apply</button>
                    </div>
                  </>
                )}
                {couponError   && <div className="cc-coupon-msg cc-coupon-msg--err">{couponError}</div>}
                {couponSuccess && <div className="cc-coupon-msg cc-coupon-msg--ok">{couponSuccess}</div>}
              </div>

              {/* Trust badges below coupon */}
              <div className="cc-trust-bar cc-trust-bar--right">
                <span className="cc-trust-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Secure Checkout
                </span>
                <span className="cc-trust-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  VAT Included
                </span>
                <span className="cc-trust-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 7v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Fast Delivery
                </span>
              </div>
            </div>
          </div>{/* end cc-checkout-layout */}

          {/* ── COUPON MODAL ── */}
          {showCouponModal && (
            <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
              <div className="coupon-modal" onClick={e => e.stopPropagation()}>
                <div className="coupon-header">
                  <h3>Available Coupons</h3>
                  <button className="close-btn" onClick={() => setShowCouponModal(false)}>&times;</button>
                </div>
                {couponLoading ? (
                  <div className="coupon-loading">Loading…</div>
                ) : !coupons.length ? (
                  <div className="coupon-empty">You have no coupons</div>
                ) : (
                  <div className="coupon-body">
                    {coupons.map((c, idx) => {
                      const expired = isExpired(c.end_date);
                      return (
                        <div key={c.id||`c-${idx}`} className={`coupon-ticket ${expired?'expired':''}`}>
                          <div className="coupon-left">
                            <div className="coupon-title">{c.title || 'Special Offer'}</div>
                            <div className="coupon-desc">{c.description || (c.coupon_type==='percent'?`${c.value}% OFF`:`SAR ${c.value} OFF`)}</div>
                            <div className="coupon-validity">{expired?`Expired: ${c.end_date?.slice(0,10)}`:`Valid until: ${c.end_date?.slice(0,10)}`}</div>
                          </div>
                          <div className="coupon-right">
                            <div className="coupon-code-box"><span className="coupon-code">{c.code}</span></div>
                            {!expired && (
                              <button className={`apply-btn ${copiedId===(c.id||`c-${idx}`)?'applied':''}`} onClick={() => handleSelectCoupon(c.code, c.id||`c-${idx}`)}>
                                {copiedId===(c.id||`c-${idx}`) ? 'Applied!' : 'Apply'}
                              </button>
                            )}
                            {expired && <div className="coupon-expired-badge">Expired</div>}
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
          .coupon-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:999}
          .coupon-modal{background:#fff;border-radius:12px;width:480px;max-width:92%;box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden}
          .coupon-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #f0f0f0}
          .coupon-header h3{margin:0;font-size:18px;font-weight:600}
          .close-btn{background:none;border:none;font-size:22px;color:#888;cursor:pointer}
          .coupon-body{display:flex;flex-direction:column;gap:10px;padding:14px;max-height:55vh;overflow-y:auto}
          .coupon-ticket{display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
          .coupon-left{display:flex;flex-direction:column;gap:3px}
          .coupon-title{font-size:13px;font-weight:600;color:#222}
          .coupon-desc{font-size:11px;color:#666}
          .coupon-validity{font-size:10px;color:#aaa}
          .coupon-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
          .coupon-code{background:#f0fdf4;color:#198754;font-size:12px;font-weight:700;padding:3px 8px;border-radius:5px}
          .apply-btn{background:none;border:none;color:#b9a16b;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase}
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
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'1rem'}} onClick={e=>{ if(e.target===e.currentTarget){ setShowAddrModal(false); setEditingAddrIdx(null); } }}>
          <div style={{background:'#fff',borderRadius:'12px',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.2)'}}>
            {/* Modal Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid #f0ece3'}}>
              <h4 style={{margin:0,fontSize:'1rem',fontWeight:700,fontFamily:'inherit',letterSpacing:'0.03em'}}>
                {editingAddrIdx !== null ? `Edit ${editingAddrIdx===0?'Home':'Other'} Address` : 'Choose Delivery Address'}
              </h4>
              <button type="button" style={{background:'none',border:'none',fontSize:'1.4rem',cursor:'pointer',color:'#999',lineHeight:1}} onClick={()=>{ setShowAddrModal(false); setEditingAddrIdx(null); }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{padding:'1rem 1.25rem'}}>
              {editingAddrIdx === null ? (
                /* ── Address List View ── */
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  <p style={{fontSize:'0.8rem',color:'#888',margin:'0 0 0.25rem'}}>Your default address will be used for delivery</p>
                  {['Home Address','Other Address'].map((label, idx) => {
                    const a = addrList[idx];
                    const isEmpty = !a.area && !a.building;
                    return (
                      <div key={label} style={{border:`1.5px solid ${a.isDefault?'#b9a16b':'#e5e5e5'}`,borderRadius:'10px',padding:'0.9rem',background:a.isDefault?'#fffdf8':'#fff',position:'relative'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.5rem'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                              <span style={{fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'#888'}}>{label}</span>
                              {a.isDefault && <span style={{fontSize:'0.65rem',background:'#b9a16b',color:'#fff',padding:'1px 7px',borderRadius:'99px',fontWeight:700}}>Default</span>}
                            </div>
                            {isEmpty ? (
                              <p style={{fontSize:'0.82rem',color:'#aaa',margin:0,fontStyle:'italic'}}>No address saved</p>
                            ) : (
                              <>
                                <p style={{margin:'0 0 0.15rem',fontWeight:600,fontSize:'0.88rem',color:'#1a1a1a'}}>{a.name}</p>
                                {a.building && <p style={{margin:'0 0 0.1rem',fontSize:'0.8rem',color:'#555'}}>{a.building}</p>}
                                {(a.area||a.province) && <p style={{margin:'0 0 0.1rem',fontSize:'0.8rem',color:'#555'}}>{[a.area,a.province].filter(Boolean).join(', ')}</p>}
                                {a.short_national_address && <p style={{margin:'0',fontSize:'0.75rem',color:'#b9a16b',fontWeight:600}}>📍 {a.short_national_address}</p>}
                              </>
                            )}
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',flexShrink:0}}>
                            <button type="button" onClick={()=>startEditAddr(idx)} style={{background:'none',border:'1px solid #ddd',borderRadius:'6px',padding:'4px 12px',fontSize:'0.75rem',cursor:'pointer',color:'#555',fontWeight:600,whiteSpace:'nowrap'}}>Edit</button>
                            {!a.isDefault && !isEmpty && (
                              <button type="button" onClick={()=>selectAddrAsDefault(idx)} style={{background:'#b9a16b',border:'none',borderRadius:'6px',padding:'4px 12px',fontSize:'0.75rem',cursor:'pointer',color:'#fff',fontWeight:700,whiteSpace:'nowrap'}}>Use This</button>
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
                    style={{marginTop:'0.25rem',width:'100%',background:'#1a1a1a',color:'#fff',border:'none',borderRadius:'8px',padding:'0.65rem',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',letterSpacing:'0.04em',fontFamily:'inherit'}}
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* ── Edit Form View ── */
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  <button type="button" onClick={()=>setEditingAddrIdx(null)} style={{background:'none',border:'none',padding:0,fontSize:'0.8rem',color:'#b9a16b',cursor:'pointer',textAlign:'left',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>
                    ← Back to addresses
                  </button>

                  {[
                    {label:'City *', field:'area', type:'text', err: addrFormErrors.area},
                    {label:'Full Address *', field:'building', type:'text', err: addrFormErrors.building},
                    {label:'Province *', field:'province', type:'text', err: addrFormErrors.province},
                    {label:'Short National Address *', field:'short_national_address', type:'text', err: addrFormErrors.short_national_address, hint:'e.g. ABCD1234'},
                  ].map(({label,field,type,err,hint})=>(
                    <div key={field}>
                      <label style={{fontSize:'0.72rem',fontWeight:600,textTransform:'uppercase',color:'#888',display:'block',marginBottom:'4px'}}>{label}</label>
                      <input type={type} name={field} value={addrForm[field]||''} onChange={handleAddrFormChange}
                        style={{width:'100%',border:`1px solid ${err?'#e53935':'#ddd'}`,borderRadius:'6px',padding:'0.5rem 0.75rem',fontSize:'0.88rem',outline:'none',fontFamily:'inherit'}} />
                      {hint && <p style={{margin:'2px 0 0',fontSize:'0.65rem',color:'#aaa',lineHeight:1.3}}>{hint}</p>}
                      {err && <p style={{margin:'3px 0 0',fontSize:'0.75rem',color:'#e53935'}}>{err}</p>}
                    </div>
                  ))}

                  <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.85rem',marginTop:'0.25rem'}}>
                    <input type="checkbox" name="isDefault" checked={!!addrForm.isDefault} onChange={handleAddrFormChange} />
                    Set as default delivery address
                  </label>

                  <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
                    <button type="button" onClick={()=>setEditingAddrIdx(null)} style={{flex:1,border:'1px solid #ddd',background:'#fff',borderRadius:'8px',padding:'0.6rem',fontSize:'0.85rem',cursor:'pointer',fontWeight:600,color:'#555'}}>Cancel</button>
                    <button type="button" onClick={saveAddrForm} disabled={addrSaving} style={{flex:2,border:'none',background:'#b9a16b',color:'#fff',borderRadius:'8px',padding:'0.6rem',fontSize:'0.85rem',cursor:'pointer',fontWeight:700}}>
                      {addrSaving ? 'Saving…' : 'Save Address'}
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
        <h2 className="cc-cart-empty__title">Your bag is empty</h2>
        <p className="cc-cart-empty__sub">Add fragrances before checking out</p>
        <Link href={`/${locale}/shop`} className="cc-btn-gold" style={{width:'auto',padding:'0 2rem',textDecoration:'none'}}>
          Explore Products
        </Link>
      </div>
    )}
    </>
  );
}
