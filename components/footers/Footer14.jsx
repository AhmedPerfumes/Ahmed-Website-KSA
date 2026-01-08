"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  currencyOptions,
  footerLinks1,
  footerLinks2,
  footerLinks3,
  languageOptions2,
  socialLinks,
} from "@/data/footer";

import { useMenu } from "../../context/MenuContext";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../../i18n/routing";

export default function Footer14() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const handleLangChange = (e) => {
    // console.log(pathname, e.target.value);
    router.push(pathname, { locale: e.target.value });
  };

  const {
    categoriesSubCategories,
    isLoading: isMenuLoading,
    error,
  } = useMenu();

  if (isMenuLoading) {
    return <div></div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <footer className="footer footer_type_1 dark">
      <div className="footer-top container py-0">
        <div className="service-promotion horizontal container">
          <div className="row">
            <div className="col-md-4 mb-5 mb-md-0 d-flex align-items-center justify-content-center gap-3">
              <div className="service-promotion__icon">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_shipping" />
                </svg>
              </div>
              <div className="service-promotion__content-wrap">
                <h3 className="service-promotion__title h6 text-uppercase mb-1 text-white">
                  {t("Swift Complimentary Shipping")}
                </h3>
                <p className="service-promotion__content text-secondary mb-0 text-white">
                  {t("Free delivery on orders over SAR 300")}
                </p>
              </div>
            </div>
            {/* <!-- /.col-md-4 text-center--> */}

            <div className="col-md-4 mb-5 mb-md-0 d-flex align-items-center justify-content-center gap-3">
              <div className="service-promotion__icon">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_shield" />
                </svg>
              </div>
              <div className="service-promotion__content-wrap">
                <h3 className="service-promotion__title h6 text-uppercase mb-1 text-white">
                  {t("Secure Payment Solutions")}
                </h3>
                <p className="service-promotion__content text-secondary mb-0 text-white">
                  {t("Your payments are safe with our secure online system")}
                </p>
              </div>
            </div>
            {/* <!-- /.col-md-4 text-center--> */}

            <div className="col-md-4 mb-5 mb-md-0 d-flex align-items-center justify-content-center gap-3">
              <div className="service-promotion__icon">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_headphone" />
                </svg>
              </div>
              <div className="service-promotion__content-wrap">
                <h3 className="service-promotion__title h6 text-uppercase mb-1 text-white">
                  {t("Convenient Cash on Delivery")}
                </h3>
                <p className="service-promotion__content text-secondary mb-0 text-white">
                  {t("Pay conveniently upon receiving your order")}
                </p>
              </div>
            </div>
            {/* <!-- /.col-md-4 text-center--> */}
          </div>
          {/* <!-- /.row --> */}
        </div>
        {/* <!-- /.service-promotion container --> */}
      </div>
      {/* <!-- /.footer-top container --> */}

      <div className="footer-middle container">
        <div className="row row-cols-lg-5 row-cols-2">
          <div className="footer-column footer-store-info col-12 mb-4 mb-lg-0">
            <div className="logo">
              <a href="/">
              <Image
                  src="/assets/images/about/AhmedLogo.png"
                  width={100}
                  height={100}
                  alt="Ahmed"
                  className="logo__image d-block"
                />
              </a>
            </div>
            {/* <!-- /.logo --> */}
            <p className="footer-address">
              {t("Ahmed Al Maghribi Perfume Manuf")} <br />
              {t("Madinah Al Munawwarah")} <br />
              {t("Kingdom Of Saudi Arabia")} <br />
          
            </p>

            <p className="m-0">
              <strong className="fw-medium">info@ahmedalmaghribi.com</strong>
            </p>
            <p>
              <strong className="fw-medium" dir="ltr" style={{ display: 'inline-block' }}>
              {t("+966 55 5073629 / +966 53 6654399")} 
              </strong>
            </p>

            <ul className="social-links list-unstyled d-flex flex-wrap mb-0">
              {socialLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="footer__social-link d-block"
                    target="_blank"
                  >
                    <svg
                      className={link.className}
                      width={link.width}
                      height={link.height}
                      viewBox={link.viewBox}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {typeof link.icon === "string" ? (
                        <use href={link.icon} />
                      ) : (
                        link.icon
                      )}
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">{t("Company")}</h6>
            <ul className="sub-menu__list list-unstyled">
              {footerLinks1.map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={`/${locale}${elm.href}`}
                    className="menu-link menu-link_us-s"
                  >
                    {t(elm.text)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">
              {t("Categories")}
            </h6>
            <ul className="sub-menu__list list-unstyled">
              {categoriesSubCategories?.map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <Link
                    href={
                      elm.name != "Gift Sets"
                        ? `/${locale}/product-category/${elm.name
                            .split(" ")
                            .join("-")
                            .toLowerCase()}`
                        : `/${locale}/product-category/gift-sets`
                    }
                    className="menu-link menu-link_us-s"
                  >
                    {t(elm.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <!-- /.footer-column --> */}

          {/* <div className="footer-column footer-menu mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">Help</h6>
            <ul className="sub-menu__list list-unstyled">
              {footerLinks3.map((elm, i) => (
                <li key={i} className="sub-menu__item">
                  <a href={elm.href} className="menu-link menu-link_us-s">
                    {elm.text}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
          {/* <!-- /.footer-column --> */}

          <div className="footer-column footer-newsletter col-12 mb-4 mb-lg-0">
            <h6 className="sub-menu__title text-uppercase">{t("Subscribe")}</h6>
            <p>{t("Be the First")}</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="footer-newsletter__form position-relative bg-body"
            >
              <input
                className="form-control border-white shadow-none"
                type="email"
                name="email"
                placeholder={locale === 'ar' ? "عنوان البريد الإلكتروني" : "Your email address"}
                style={{
                  // Adds padding to the side where the button sits to prevent text overlap
                  paddingRight: locale === 'ar' ? '0.75rem' : '5rem', 
                  paddingLeft: locale === 'ar' ? '5rem' : '0.75rem' 
                }}
              />
              <input
                className="btn btn-link fw-medium bg-white position-absolute top-0 end-0 h-100 px-4 text-decoration-none text-dark"
                type="submit"
                value={locale === 'ar' ? "اشترك" : "JOIN"}
              />
            </form>
          </div>
          {/* <!-- /.footer-column --> */}
        </div>
        {/* <!-- /.row-cols-5 --> */}
      </div>
      {/* <!-- /.footer-middle container --> */}

            <div 
        className="footer-bottom container py-3" 
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          
          {/* Copyright Section */}
          <span className="footer-copyright text-white-50 small text-center text-md-start">
            {/* © {new Date().getFullYear()} AHMED AL MAGHRIBI PERFUMES. All rights reserved */}
            {locale === 'ar' ? `© ${new Date().getFullYear().toLocaleString('ar-EG', { useGrouping: false })} عطور أحمد المغربي. جميع الحقوق محفوظة` : `© ${new Date().getFullYear()} AHMED AL MAGHRIBI PERFUMES. All rights reserved`}
          </span>

          {/* Settings Section */}
          <div className="footer-settings d-flex align-items-center gap-3">
            <Link 
              className="text-white text-decoration-none fw-medium" 
              href={`/${locale}/order-tracking`}
              style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              {locale === 'ar' ? "تتبّع طلبك" : "Track Order"}
            </Link>

            {/* Language Selector */}
            <div className="d-flex align-items-center border-start border-white-50 ps-3" style={{ height: '20px' }}>
              <select
                id="footerSettingsLanguage"
                className="form-select form-select-sm bg-transparent border-0 text-white shadow-none"
                aria-label="Language selector"
                name="store-language"
                value={locale}
                onChange={handleLangChange}
                style={{ cursor: 'pointer', minWidth: 'auto', paddingRight: '2rem' }}
              >
                {languageOptions2.map((option, index) => (
                  <option
                    key={index}
                    className="footer-select__option"
                    value={option.value}
                  >
                    {option.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="d-flex align-items-center">
              <select
                id="footerSettingsCurrency"
                className="form-select form-select-sm bg-transparent border-0 text-white shadow-none"
                aria-label="Currency selector"
                name="store-currency"
                onChange={(e) => window.open(e.target.value, "_blank")}
                style={{ cursor: 'pointer', minWidth: 'auto' }}
              >
                {currencyOptions.map((option, index) => (
                  <option
                    key={index}
                    className="footer-select__option"
                    value={option.link}
                  >
                    {t(option.text)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* */}
        </div>
        {/* */}
      </div>
      {/* <!-- /.footer-bottom container --> */}
    </footer>
  );
}
