"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function ResetPasswordOTP() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Account");
  // Backend messages are English-only — on Arabic pages show our own translated message
  const srv = (msg, key) => (locale === "ar" || !msg ? t(key) : msg);

  // Steps: 1 = mobile, 2 = otp, 3 = new password
  const [step, setStep] = useState(1);

  // Form state
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [mobileError, setMobileError] = useState(null); // ✅ Step-1-only error
  const [resendTimer, setResendTimer] = useState(0);

  // Animations/UX
  const [stepKey, setStepKey] = useState(1); // to retrigger step fade
  const [msgVisible, setMsgVisible] = useState(false);
  const [showOtpSuccessIcon, setShowOtpSuccessIcon] = useState(false);

  // Refs for autofocus
  const mobileRef = useRef(null);
  const otpRef = useRef(null);
  const newPassRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🚫 Block access if logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (user) {
        router.replace(`/${locale}/account_dashboard`);
      }
    } catch {}
  }, [router, locale]);

  // Autofocus based on step
  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 1 && mobileRef.current) mobileRef.current.focus();
      if (step === 2 && otpRef.current) otpRef.current.focus();
      if (step === 3 && newPassRef.current) newPassRef.current.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [step]);

  // Fade in messages when they change
  useEffect(() => {
    if (message || error) {
      setMsgVisible(true);
      if (message) {
        const tm = setTimeout(() => setMsgVisible(false), 3000);
        return () => clearTimeout(tm);
      }
    } else {
      setMsgVisible(false);
    }
  }, [message, error]);

  // Helpers
  const isValidUAEMobile = /^05\d{8}$/.test(mobile);
  const bumpStepKey = () => setStepKey((k) => k + 1);

  // Start resend countdown
  const startResendTimer = () => {
    setResendTimer(60);
    const timerInterval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1 & resend: Send OTP
  const handleSendOTP = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  setMessage(null);
  setError(null);
  setMobileError(null);

  // ✅ Block before API if invalid
  if (!isValidUAEMobile) {
    setMobileError(t("errKsaMobile"));
    return; // stop here
  }

  setLoading(true);
  try {
    const res = await fetch(`${baseUrl}api/sendOTP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: mobile.trim(), flag: "fpassword" }),
    });
    const data = await res.json();

    if (res.ok && data.message?.toLowerCase().includes("otp sent")) {
      // ✅ Only go to step 2 if OTP actually sent
      setMobileError(null);
      setMessage(srv(data.message, "otpSent"));
      setStep(2);
      bumpStepKey();
      startResendTimer();
    } else {
      // stay in Step 1
      setMobileError(srv(data.message, "otpSendFailed"));
    }
  } catch {
    setMobileError(t("somethingWrong"));
  } finally {
    setLoading(false);
  }
};


  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setMobileError(null); // ensure Step-1-only error never shows here

    try {
      const res = await fetch(`${baseUrl}api/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobile.trim(),
          otp: otp.trim(),
          flag: "fpassword",
        }),
      });
      const data = await res.json();

      if (res.ok && data.message?.toLowerCase().includes("verified")) {
        setCustomerId(data?.data?.id ?? null);
        if (data?.access_token) setAccessToken(data.access_token);

        setMessage(srv(data.message, "otpVerified"));
        setShowOtpSuccessIcon(true);
        setTimeout(() => {
          setMessage(null);
          setShowOtpSuccessIcon(false);
        }, 1800);

        setStep(3);
        bumpStepKey();
      } else {
        setError(srv(data.message, "errInvalidMobileOtp"));
      }
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError(t("errPwd6"));
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("errPwdNoMatch"));
      setLoading(false);
      return;
    }

    try {
      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${baseUrl}api/customerUpdate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer_id: customerId,
          customer_password: newPassword,
          flag: "fpassword",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(srv(data.message, "pwdUpdated"));
        setTimeout(() => router.replace(`/${locale}/login_register`), 1500);
      } else {
        setError(srv(data.message, "pwdUpdateFailed"));
      }
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP click
  const handleResendOTP = async () => {
    await handleSendOTP(); // will re-validate mobile and send OTP again
    setStep(2);
    bumpStepKey();
  };

  return (
    <section className="login-register container">
      <h2 className="section-title text-center fs-3 mb-xl-4">
        {step === 1 && t("resetTitle")}
        {step === 2 && t("verifyOtp")}
        {step === 3 && t("setNewTitle")}
      </h2>

      {/* OTP success check icon */}
      {showOtpSuccessIcon && (
        <div className="d-flex justify-content-center mb-2 fade-in">
          <span aria-hidden="true" title={t("verified")} className="check-wrap">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" opacity="0.2"></circle>
              <path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </span>
        </div>
      )}

      {/* Messages (global, not Step-1 validation) */}
      <div className={`min-h-24 ${msgVisible ? "msg-visible" : "msg-hidden"}`}>
        {message && <p className="sub-menu__title border-bottom text-center m-0">{message}</p>}
        {error && <p className="text-danger text-center m-0">{error}</p>}
      </div>

      {/* Step container with fade */}
      <div key={stepKey} className="reset-form step-fade">
        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="needs-validation">
            <div className="form-floating mb-1">
              <input
                ref={mobileRef}
                type="text"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobile(val);
                  // clear inline error as user edits
                  if (mobileError) setMobileError(null);
                }}
                className="form-control"
                placeholder={t("mobileLabel")}
                required
                aria-invalid={!!mobileError}
                aria-describedby="uae-mobile-help"
              />
              <label>{t("mobileLabel")}</label>
            </div>

            {/* ✅ Step-1-only inline warning */}
            {mobileError && (
              <small id="uae-mobile-help" className="text-danger">
                {mobileError}
              </small>
            )}

            <button
              className="btn btn-primary w-100 mt-2"
              type="submit"
              disabled={loading /* Let server-side error show if needed */}
            >
              {loading ? t("sendingOtp") : t("sendOtp")}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="needs-validation">
            <div className="form-floating mb-3">
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-control"
                placeholder={t("otpLabel")}
                required
              />
              <label>{t("otpLabel")}</label>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary text-white flex-1 w-50"
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep(1);
                  bumpStepKey();
                }}
              >
                {t("changeMobile")}
              </button>

              <button
                className="btn btn-primary flex-1 w-50"
                type="submit"
                disabled={loading || !otp.trim()}
              >
                {loading ? t("verifying") : t("verifyOtp")}
              </button>
            </div>

            <div className="text-center mt-3">
              {resendTimer > 0 ? (
                <small className="text-muted">{t("resendIn", { seconds: resendTimer })}</small>
              ) : (
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  {t("resendOtp")}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="needs-validation">
            <div className="form-floating mb-3">
              <input
                ref={newPassRef}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                placeholder={t("newPasswordLabel")}
                required
                minLength={6}
              />
              <label>{t("newPasswordLabel")}</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder={t("confirmPasswordLabel")}
                required
                minLength={6}
              />
              <label>{t("confirmPasswordLabel")}</label>
            </div>
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? t("updating") : t("saveNewPassword")}
            </button>
          </form>
        )}

        <div className="customer-option mt-4 text-center">
          <span className="text-secondary">{t("backTo")}</span>{" "}
          <Link href={`/${locale}/login_register`} className="btn-text">
            {t("login")}
          </Link>
        </div>
      </div>

      {/* minimal styles for fades and icon */}
      <style jsx>{`
        .step-fade {
          animation: fadeIn 280ms ease both;
        }
        .fade-in {
          animation: fadeIn 220ms ease both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .min-h-24 { min-height: 24px; }
        .msg-visible { opacity: 1; transition: opacity 200ms ease; }
        .msg-hidden { opacity: 0; transition: opacity 200ms ease; }
        .check-wrap { display: inline-flex; color: #28a745; }
      `}</style>
    </section>
  );
}
