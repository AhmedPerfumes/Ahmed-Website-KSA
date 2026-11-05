"use client";

/**
 * Direct Apple Pay checkout widget (PayTabs Direct Payment API).
 *
 * Visibility is decided by the backend only: the widget asks
 * `GET api/applePay/config` with the customer's bearer token and renders
 * nothing unless the server answers `{ eligible: true }`. No customer ID is
 * read or compared here; Laravel re-checks the allowlist on every call.
 *
 * Flow: click → sync pre-checks → new ApplePaySession(...).begin()
 *   onvalidatemerchant  → POST api/applePay/validateMerchant
 *   onpaymentauthorized → POST api/storeOrder (payment_method: applepay)
 *                       → POST api/applePay/charge (server-side amount + PayTabs)
 */

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_URL;
const SDK_SRC = "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";
const DEFAULT_NETWORKS = ["mada", "visa", "masterCard"];
const DEFAULT_CAPABILITIES = ["supports3DS", "supportsDebit", "supportsCredit"];

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const firstError = (data) => {
  const key = ["qtyMessage", "discountMessage", "couponMessage", "duplicateOrderMessage", "error", "payment_method", "message"].find(k => data?.[k]);
  if (!key) return null;
  return Array.isArray(data[key]) ? data[key][0] : data[key];
};

// Highest Apple Pay JS version the device supports (mada needs >= 5)
const pickVersion = () => [14, 12, 10, 6, 5, 3].find(v => {
  try { return window.ApplePaySession.supportsVersion(v); } catch { return false; }
});

export default function ApplePayWidget({ locale, amount, disabled, isLoggedIn, validateBeforePay, buildOrderPayload, onProcessingChange }) {
  const tc = useTranslations("CheckoutPage");
  const router = useRouter();

  const [config, setConfig] = useState(null);   // server config when eligible
  const [canPay, setCanPay] = useState(false);  // device/browser supports Apple Pay
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'info', text }

  const buttonRef = useRef(null);
  const busyRef = useRef(false);   // hard guard against double clicks / double submits
  const clickRef = useRef(null);   // latest click handler (custom element listener)

  /* ---------- 1. Server-side eligibility ---------- */
  useEffect(() => {
    setConfig(null);
    const token = localStorage.getItem("token");
    if (!isLoggedIn || !token) return;
    const ctrl = new AbortController();
    fetch(`${API}api/applePay/config`, { headers: authHeaders(), signal: ctrl.signal, cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.eligible === true && data.merchant_id) setConfig(data); })
      .catch(() => { /* fail closed: widget stays hidden */ });
    return () => ctrl.abort();
  }, [isLoggedIn]);

  /* ---------- 2. Device capability (after SDK loads) ---------- */
  const checkDevice = () => {
    try {
      setCanPay(!!(window.ApplePaySession && pickVersion() && window.ApplePaySession.canMakePayments()));
    } catch {
      setCanPay(false); // e.g. insecure context
    }
  };

  const setBusy = (v) => {
    busyRef.current = v;
    setProcessing(v);
    onProcessingChange?.(v);
  };

  const fail = (text) => { setBusy(false); setMessage({ type: "error", text: text || tc("applePayFailed") }); };

  const goToResult = (orderCode) => {
    router.push(`/${locale}/shop-order-payment-complete?q=${btoa(orderCode)}`);
  };

  /* ---------- 3. Click → open Apple Pay sheet ---------- */
  clickRef.current = () => {
    if (busyRef.current || disabled || !config) return;
    setMessage(null);

    const precheckError = validateBeforePay?.();
    if (precheckError) { setMessage({ type: "error", text: precheckError }); return; }

    const version = pickVersion();
    const total = Number(amount).toFixed(2);
    if (!version || !(Number(total) > 0)) { setMessage({ type: "error", text: tc("applePayFailed") }); return; }

    // Snapshot the order payload now so it matches the amount shown in the sheet
    const orderPayload = { ...buildOrderPayload("applepay"), payment_method: "applepay" };
    let networks = config.supported_networks?.length ? config.supported_networks : DEFAULT_NETWORKS;
    if (version < 5) networks = networks.filter(n => n !== "mada");

    let session;
    try {
      // Must be created synchronously inside the user gesture
      session = new window.ApplePaySession(version, {
        countryCode: config.country_code || "SA",
        currencyCode: config.currency_code || "SAR",
        supportedNetworks: networks,
        merchantCapabilities: config.merchant_capabilities?.length ? config.merchant_capabilities : DEFAULT_CAPABILITIES,
        total: { label: config.display_name || "Ahmed Al Maghribi", amount: total, type: "final" },
      });
    } catch {
      setMessage({ type: "error", text: tc("applePayFailed") });
      return;
    }

    setBusy(true);
    let orderCode = null; // reused if the customer retries with another card in the same sheet

    session.onvalidatemerchant = async (event) => {
      try {
        const res = await fetch(`${API}api/applePay/validateMerchant`, {
          method: "POST", headers: authHeaders(), body: JSON.stringify({ validation_url: event.validationURL }),
        });
        const data = res.ok ? await res.json() : null;
        if (!data?.merchant_session) throw new Error("validation");
        session.completeMerchantValidation(data.merchant_session);
      } catch {
        try { session.abort(); } catch { }
        fail(tc("applePayUnavailable"));
      }
    };

    session.onpaymentauthorized = async (event) => {
      const S = window.ApplePaySession;
      // a) Create the order once (server recalculates the amount)
      if (!orderCode) {
        try {
          const res = await fetch(`${API}api/storeOrder`, { method: "POST", headers: authHeaders(), body: JSON.stringify(orderPayload) });
          if (res.status === 401) { session.completePayment(S.STATUS_FAILURE); fail(tc("sessionExpiredLogin")); return; }
          if (res.status === 403) { session.completePayment(S.STATUS_FAILURE); fail(tc("applePayUnavailable")); return; }
          const data = await res.json().catch(() => null);
          if (!res.ok || data?.message !== "ApplePay order created" || !data.order_id) {
            session.completePayment(S.STATUS_FAILURE);
            fail(firstError(data));
            return;
          }
          orderCode = data.order_id;
        } catch {
          session.completePayment(S.STATUS_FAILURE);
          fail();
          return;
        }
      }

      // b) Charge through Laravel → PayTabs
      let result = null;
      try {
        const res = await fetch(`${API}api/applePay/charge`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ order_code: orderCode, display_total: total, apple_pay_token: event.payment.token }),
        });
        result = await res.json().catch(() => null);
        if (!res.ok && !result?.status) result = { status: res.status >= 500 ? "pending" : "failed", message: firstError(result) };
      } catch {
        result = { status: "pending" }; // network error: outcome unknown, server is the source of truth
      }

      if (result?.status === "success") {
        session.completePayment(S.STATUS_SUCCESS);
        setMessage({ type: "info", text: tc("applePaySuccess") });
        goToResult(orderCode);
      } else if (result?.status === "pending") {
        // Outcome unknown: don't invite a retry (possible double charge);
        // the result page polls the real payment status from the server.
        session.completePayment(S.STATUS_SUCCESS);
        setMessage({ type: "info", text: tc("applePayVerifying") });
        goToResult(orderCode);
      } else {
        session.completePayment(S.STATUS_FAILURE);
        fail(result?.message || tc("applePayDeclined"));
      }
    };

    session.oncancel = () => {
      setBusy(false);
      setMessage({ type: "info", text: tc("applePayCancelled") });
    };

    try { session.begin(); } catch { fail(); }
  };

  /* ---------- 4. Bind click on the <apple-pay-button> custom element ---------- */
  const visible = !!config && canPay;
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const onClick = () => clickRef.current?.();
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [visible]);

  if (!config) return null;

  return (
    <>
      <Script src={SDK_SRC} strategy="afterInteractive" crossOrigin="anonymous" onReady={checkDevice} />
      {visible && (
        <div className={`cc-applepay ${processing ? "cc-applepay--busy" : ""} ${disabled && !processing ? "cc-applepay--disabled" : ""}`} aria-busy={processing}>
          <div className="cc-applepay__head">
            <span className="cc-applepay__title">{tc("applePayTitle")}</span>
            <span className="cc-applepay__subtitle">{tc("applePaySub")}</span>
          </div>
          <apple-pay-button
            ref={buttonRef}
            buttonstyle="black"
            type="buy"
            locale={locale === "ar" ? "ar-SA" : "en-US"}
          ></apple-pay-button>
          {processing && <div className="cc-applepay__overlay"><span>{tc("processing")}</span></div>}
          {message && (
            <div className={`cc-applepay__msg cc-applepay__msg--${message.type}`} role={message.type === "error" ? "alert" : "status"}>
              {message.text}
            </div>
          )}
          <div className="cc-applepay__divider"><span>{tc("applePayOr")}</span></div>
        </div>
      )}
    </>
  );
}
