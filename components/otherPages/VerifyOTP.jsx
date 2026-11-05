"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function VerifyOTP() {

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Account");
  const srv = (msg, key) => (locale === "ar" || !msg ? t(key) : msg);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobile, setMobile] = useState('');

  const validateMobile = (event) => {
    const { value } = event.currentTarget;
    setMobile(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    if(mobile == '') {
     setError(t("errMobileRequired"));
     setSuccess(null);
     setIsLoading(false);
     return;
   }
   const regex = /^\d{10}$/;
   if(!regex.test(mobile)) {
     setError(t("errMobileInvalid"));
     setSuccess(null);
     setIsLoading(false);
     return;
   }
    setError(null);
    setSuccess(null);
 
    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, {
        method: 'POST',
        body: formData,
      })
 
      if (!response.ok) {
        throw new Error(t("submitFailed"));
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message.split(' ')[0] != 'Customer') {
        setError(srv(data.message, "errInvalidMobileOtp"));
        setSuccess(null);
      } else {
        setSuccess(srv(data.message, "accountVerified"));
        setError(null);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', btoa(JSON.stringify(data.data)));
        // setTimeout(() => router.push('/'), 1000);
        setTimeout(() => window.location.href = `/${locale}`, 1000);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="login-register container">
      <h2 className="d-none">{t("verifyOtp")}</h2>
        <div
          className="tab-pane fade show active"
          id="tab-item-login"
          role="tabpanel"
          aria-labelledby="login-tab"
        >
          {error ? <div style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}

          <div className="pb-3"></div>

          <div className="login-form">
            <form
              onSubmit={onSubmit}
              className="needs-validation"
            >
              <div className="form-floating mb-3">
                <input
                  name="mobile"
                  type="number"
                  className="form-control form-control_gray"
                  placeholder={t("mobileLabel")}
                  onChange={validateMobile}
                  required
                />
                <label>{t("mobileLabel")}</label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="otp"
                  type="number"
                  className="form-control form-control_gray"
                  id="customerPasswodInput"
                  placeholder={t("otpLabelShort")}
                  required
                />
                <label htmlFor="customerPasswodInput">{t("otpLabelShort")}</label>
              </div>              

              <button
                className="btn btn-primary w-100 text-uppercase"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? t("loadingBtn") : t("verifyOtp")}
              </button>
            </form>
          </div>
        </div>
    </section>
  );
}
