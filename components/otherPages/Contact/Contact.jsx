"use client";

import React, { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

const PHONES = "+966 55 5073629 / +966 53 6654399";
const SUPPORT_EMAIL = "customersupport@ahmedalmaghribi.com";
const INFO_EMAIL = "info@ahmedalmaghribi.com";

export default function Contact() {
  const t = useTranslations("ContactPage");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const formRef = useRef(null);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(formRef.current);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/contact`, { method: "POST", body: formData });
      if (!response.ok) throw new Error(t("submitFailed"));
      const data = await response.json();
      if (data.message?.split(" ")[0] != "Contact") {
        setError(data.message || t("submitFailed"));
        setSuccess(null);
      } else {
        setSuccess(t("submitSuccess"));
        setError(null);
        formRef.current.reset();
      }
    } catch (err) {
      setError(err.message || t("submitFailed"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="contact-us">
      {/* Map — Madinah Al Munawwarah */}
      <div className="row">
        <div className="col-12">
          <div className="map-container">
            <iframe
              title={t("mapTitle")}
              src={`https://www.google.com/maps?q=${encodeURIComponent("Ahmed Al Maghribi Perfumes, Madinah, Saudi Arabia")}&hl=${locale}&z=12&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center">
        <div className="row">
          {/* Form */}
          <div className="col-lg-6 mb-5">
            <div className="contact-us__form">
              <form className="needs-validation mx-lg-5" onSubmit={onSubmit} ref={formRef}>
                <h4 className="pt-5 fs-3">{t("formTitle")}</h4>
                <p className="fs-5">{t("formIntro")}</p>
                {error ? <div style={{ color: "#b3261e" }} role="alert">{error}</div> : success && <div style={{ color: "#2e7d32" }} role="status">{success}</div>}
                <div className="form-floating my-4">
                  <input type="text" name="name" className="form-control" id="contact_us_name" placeholder={t("name")} autoComplete="name" required />
                  <label htmlFor="contact_us_name">{t("name")} *</label>
                </div>
                <div className="form-floating my-4">
                  <input type="email" name="email" className="form-control" id="contact_us_email" placeholder={t("email")} autoComplete="email" inputMode="email" dir="ltr" required />
                  <label htmlFor="contact_us_email">{t("email")} *</label>
                </div>
                <div className="form-floating my-4">
                  <input type="text" name="subject" className="form-control" id="contact_us_subject" placeholder={t("subject")} required />
                  <label htmlFor="contact_us_subject">{t("subject")} *</label>
                </div>
                <div className="my-4">
                  <textarea name="message" className="form-control form-control_gray" placeholder={t("message")} aria-label={t("message")} cols="30" rows="8" required></textarea>
                </div>
                <div className="my-4">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? t("sending") : t("submit")}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact information */}
          <div className="col-lg-6">
            <h4 className="pt-5 mb-4 fs-3">{t("serviceTitle")}</h4>
            <p className="mb-2 fs-5">1. {t("service1")}</p>
            <p className="mb-2 fs-5">
              2. {t.rich("service2", { email: () => <b><a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr">{SUPPORT_EMAIL}</a></b> })}
            </p>
            <p className="mb-2 fs-5">3. {t("service3")}</p>

            <h4 className="pt-5 mb-4 fs-3">{t("infoTitle")}</h4>
            <p className="mb-2 fs-5">{t("address")}</p>
            <p className="mb-2 fs-5">{t("emailLabel")}: <a href={`mailto:${INFO_EMAIL}`} dir="ltr">{INFO_EMAIL}</a></p>
            <p className="mb-2 fs-5">{t("phoneLabel")}: <a href={`tel:${PHONES.split(" / ")[0].replace(/\s/g, "")}`} dir="ltr">{PHONES}</a></p>

            <h4 className="pt-4 mb-2 fs-3">{t("hoursTitle")}</h4>
            <p className="mb-2 fs-5">{t("hoursWeek")}</p>
            <p className="fs-5">{t("hoursClosed")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
