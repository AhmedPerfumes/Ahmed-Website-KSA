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
  paymentMethods,
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
 {/* Payment Methods Section */}
         
            <div 
        className="footer-bottom container py-3" 
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
           <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-white-50 small me-2" style={{ whiteSpace: 'nowrap' }}>
              {locale === 'ar' ? "طرق الدفع:" : "Payment Methods:"}
            </span>
            <div className="d-flex align-items-center gap-3 flex-wrap" style={{ flexWrap: 'wrap' }}>
              {paymentMethods.map((method, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px' }}>
                  {method.component === "paytabs-full" ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="20" viewBox="0 0 77 16">
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
                      <span style={{ color: '#ccc', fontSize: '12px' }}>|</span>
                      <Image src="/assets/images/paytabs-svg/UnionPay_logo.png" alt="Union Pay" width={45} height={16} style={{ height: '16px', width: 'auto' }} />
                      <Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="Apple Pay" width={45} height={16} style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                      <Image src="/assets/images/paytabs-svg/Samsung_Pay_Logo.png" alt="Samsung Pay" width={45} height={16} style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                       <Image src="/assets/images/paytabs-svg/mada-logo.png" alt="Mada" width={50} height={20} />
                    </div>
                  ) : (
                    <Image
                      src={method.image}
                      alt={method.alt}
                      width={60}
                      height={32}
                      style={{ height: '20px', width: 'auto', maxWidth: '80px', objectFit: 'contain' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
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
