"use client";

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
