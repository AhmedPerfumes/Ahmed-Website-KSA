"use client";

import "./Footer14.css";
import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import Image from "next/image";
import {
  currencyOptions,
  footerLinks1,
  footerLinks2,
  footerLinks3,
  languageOptions2,
  socialLinks,
  paymentMethods
} from "@/data/footer";

import Button from "@mui/material/Button";

import { useLocale, useTranslations } from "next-intl";

import { useMenu } from '../../context/MenuContext';

export default function MobileFooter2() {

  const locale = useLocale();
  const t = useTranslations();

  const { categoriesSubCategories, isLoading: isMenuLoading, error } = useMenu();

  if (isMenuLoading) {
    return <div></div>;
  }
  if (error) {
    return <div>{ error }</div>;
  }

  return (
    <div className="mb-5">
      <div className="footer-column footer-newsletter col-12 mb-4 mb-lg-0 d-flex flex-column align-items-center">
        <h6 className="sub-menu__title text-uppercase text-white text-center">
          {t("Subscribe")}
          
        </h6>
        <p className="text-white text-center">
        {t("Be the First")}
        </p>
        <form className="footer-newsletter__form position-relative bg-body w-75 d-flex ">
          <input
            className="form-control border-white"
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
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          {t("Company")}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
        >
          <ul className="sub-menu__list list-unstyled text-white">
            {footerLinks1.map((elm, i) => (
              <li key={i} className="sub-menu__item text-white">
                <a
                  href={`/${locale}${elm.href}`}
                  className="menu-link menu-link_us-s text-white"
                >
                  {t(elm.text)}
                </a>
              </li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          {t("Categories")}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "black",
            color: "white",
          }}
        >
          <ul className="sub-menu__list list-unstyled">
            {categoriesSubCategories?.map((elm, i) => (
              <li key={i} className="sub-menu__item">
                <a
                  href={elm.name != 'Gift Sets' ? `/${locale}/product-category/${elm.name.split(' ').join('-').toLowerCase()}` : `/${locale}/product-category/gift-sets`}
                  className="menu-link menu-link_us-s text-white"
                >
                  {t(elm.name)}
                </a>
              </li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
      <div className="footer-column footer-store-info col-12 mb-4 mb-lg-0">
        <div className="logo d-flex justify-content-center">
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
        <p className="footer-address text-white text-center">
         {t("Ahmed Al Maghribi Perfume Manuf")} <br />
              {t("Madinah Al Munawwarah")} <br />
              {t("Kingdom Of Saudi Arabia")} <br />
        </p>

        <p className="m-0 text-white text-center">
          <strong className="fw-medium">info@ahmedalmaghribi.com</strong>
        </p>
        <p className="text-center">
          <strong dir="ltr" className="fw-medium text-white text-center">
          {t("+966 55 5073629 / +966 53 6654399 / +966 50 6125444")} 
          </strong>
        </p>

        <ul className="social-links list-unstyled d-flex flex-wrap mb-0 text-white justify-content-center">
          {socialLinks.map((link, index) => (
            <li key={index}>
              <a href={link.href} className="footer__social-link d-block">
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
              </a>
            </li>
          ))}
        </ul>
      </div>

      
      <div className="footer-bottom container text-white py-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">

           {/* Payment Methods Section */}
          <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
            <span className="text-white-50 small" style={{ whiteSpace: 'nowrap' }}>
              {locale === 'ar' ? "طرق الدفع:" : "Payment Methods:"}
            </span>
            <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
              {paymentMethods.map((method, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px' }}>
                  {method.component === "paytabs-full" ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: 'wrap', justifyContent: 'center' }}>
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
                      {/* <Image src="/assets/images/paytabs-svg/Samsung_Pay_Logo.png" alt="Samsung Pay" width={45} height={16} style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)' }} /> */}
                      <Image src="/assets/images/paytabs-svg/mada.webp" alt="Mada" width={50} height={20} />
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
          
          {/* Settings / Link Section */}
          <div className="footer-settings d-flex align-items-center">
            <a className="text-white text-decoration-none fw-medium" href={`/${locale}/order-tracking`} style={{ fontSize: '0.9rem' }}>
              {locale === 'ar' ? "تتبّع طلبك" : "Track Order"}
            </a>
          </div>

          {/* Copyright Section */}
          <span className="footer-copyright small text-white-50 mb-2 mb-md-0">
            {locale === 'ar' ? `© ${new Date().getFullYear().toLocaleString('ar-EG', { useGrouping: false })} عطور أحمد المغربي. جميع الحقوق محفوظة` : `© ${new Date().getFullYear()} AHMED AL MAGHRIBI PERFUMES. All rights reserved` }
          </span>

        </div>
      </div>
    </div>
  );
}
