"use client";
/**
 * SiteFooter — one responsive footer for every page (desktop, tablet, mobile; EN + AR / RTL).
 * Replaces the old Footer14 (desktop) + MobileFooter2 (mobile) pair, which left tablets
 * (768–991px) without any footer and disagreed with each other.
 *
 *  1. Trust strip   — free delivery (admin threshold), secure payment, cash on delivery
 *  2. Link columns  — Shop · Help · Company (accordions on mobile, columns from 768px)
 *     + brand block — logo, address, clickable email / phone, social
 *  3. Bottom bar    — payment methods, legal line, language + country switch
 */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../../i18n/routing";
import { useMenu } from "../../context/MenuContext";
import { useContextElement } from "@/context/Context";
import { currencyOptions, languageOptions2, socialLinks } from "@/data/footer";

// Fill these in to show them in the footer (Saudi e-commerce rules ask stores to display them)
const LEGAL = { cr: "", vat: "" };
const EMAIL = "info@ahmedalmaghribi.com";
const PHONES = ["+966 55 5073629", "+966 53 6654399"];

const slug = (s) => String(s || "").trim().split(/\s+/).join("-").toLowerCase();

const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok" };

function Column({ id, title, open, onToggle, children }) {
  return (
    <div className={`sf-col${open ? " is-open" : ""}`}>
      <h2 className="sf-col__title">
        <button type="button" className="sf-col__toggle" aria-expanded={open} aria-controls={`sf-${id}`} onClick={onToggle}>
          <span>{title}</span>
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="sf-col__heading">{title}</span>
      </h2>
      <ul id={`sf-${id}`} className="sf-col__list">{children}</ul>
    </div>
  );
}

export default function SiteFooter() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("SiteFooter");
  const tAll = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { categoriesSubCategories } = useMenu();
  const { freeShippingThreshold } = useContextElement();
  const [openCol, setOpenCol] = useState(null);
  const toggle = (id) => setOpenCol((c) => (c === id ? null : id));

  const num = (n) => new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { useGrouping: false }).format(n);
  const year = num(new Date().getFullYear());
  const L = (href) => `/${locale}${href}`;
  const label = (key) => (tAll.has(key) ? tAll(key) : key);

  const categories = (categoriesSubCategories || []).map((c) => ({
    text: label(c.name),
    href: c.name !== "Gift Sets" ? L(`/product-category/${slug(c.name)}`) : L("/product-category/gift-sets"),
  }));

  const help = [
    { text: t("trackOrder"), href: L("/order-tracking") },
    { text: t("shipping"), href: L("/shipping-and-delivery") },
    { text: t("returns"), href: L("/refund-policy") },
    { text: t("storeLocator"), href: L("/store-locator") },
    { text: t("contact"), href: L("/contact") },
  ];
  const company = [
    { text: t("about"), href: L("/about") },
    { text: t("blog"), href: L("/blog") },
    { text: t("privacy"), href: L("/privacy") },
    { text: t("terms"), href: L("/terms") },
  ];

  return (
    <footer className="sf" aria-label={t("aria")}>
      {/* 1 ── Trust strip */}
      <div className="sf-trust">
        <div className="sf-wrap sf-trust__grid">
          <div className="sf-trust__item">
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none" aria-hidden="true"><use href="#icon_shipping" /></svg>
            <div>
              <p className="sf-trust__title">{t("trustShipTitle")}</p>
              <p className="sf-trust__text">{t("trustShipText", { amount: num(freeShippingThreshold) })}</p>
            </div>
          </div>
          <div className="sf-trust__item">
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none" aria-hidden="true"><use href="#icon_shield" /></svg>
            <div>
              <p className="sf-trust__title">{t("trustPayTitle")}</p>
              <p className="sf-trust__text">{t("trustPayText")}</p>
            </div>
          </div>
          <div className="sf-trust__item">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v5M18 9.5v5" />
            </svg>
            <div>
              <p className="sf-trust__title">{t("trustCodTitle")}</p>
              <p className="sf-trust__text">{t("trustCodText")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 ── Brand + link columns */}
      <div className="sf-wrap sf-main">
        <div className="sf-brand">
          <Link href={L("")} className="sf-brand__logo" aria-label={t("home")}>
            <Image src="/assets/images/about/AhmedLogo.png" width={92} height={92} alt="Ahmed Al Maghribi" />
          </Link>
          <address className="sf-brand__address">
            {t("company")}<br />
            {t("city")}<br />
            {t("country")}
          </address>
          <ul className="sf-brand__contact">
            <li>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              <a href={`mailto:${EMAIL}`} dir="ltr">{EMAIL}</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" /></svg>
              <span>
                {PHONES.map((p, i) => (
                  <span key={p}>{i > 0 && " · "}<a href={`tel:${p.replace(/\s/g, "")}`} dir="ltr">{p}</a></span>
                ))}
              </span>
            </li>
          </ul>
          <ul className="sf-social" aria-label={t("follow")}>
            {socialLinks.map((link) => {
              const key = Object.keys(SOCIAL_LABELS).find((k) => link.className?.includes(k));
              return (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[key] || "Social"}>
                    <svg className={link.className} width={link.width} height={link.height} viewBox={link.viewBox} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {typeof link.icon === "string" ? <use href={link.icon} /> : link.icon}
                    </svg>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav className="sf-cols" aria-label={t("aria")}>
          <Column id="shop" title={t("shop")} open={openCol === "shop"} onToggle={() => toggle("shop")}>
            {categories.map((c) => <li key={c.href}><Link href={c.href}>{c.text}</Link></li>)}
            <li><Link href={L("/sale")}>{label("Sale")}</Link></li>
          </Column>
          <Column id="help" title={t("help")} open={openCol === "help"} onToggle={() => toggle("help")}>
            {help.map((c) => <li key={c.href}><Link href={c.href}>{c.text}</Link></li>)}
          </Column>
          <Column id="company" title={t("companyCol")} open={openCol === "company"} onToggle={() => toggle("company")}>
            {company.map((c) => <li key={c.href}><Link href={c.href}>{c.text}</Link></li>)}
          </Column>
        </nav>
      </div>

      {/* 3 ── Bottom bar */}
      <div className="sf-bottom">
        <div className="sf-wrap sf-bottom__grid">
          <ul className="sf-pay" aria-label={t("payments")}>
            <li><Image src="/assets/images/paytabs-svg/mada.webp" alt="mada" width={46} height={18} /></li>
            <li className="sf-pay__chip" aria-label="Visa">VISA</li>
            <li className="sf-pay__chip sf-pay__chip--mc" aria-label="Mastercard"><span /><span /></li>
            <li><Image src="/assets/images/paytabs-svg/Apple_Pay_logo.png" alt="Apple Pay" width={40} height={16} className="sf-pay__invert" /></li>
            <li><Image src="/assets/images/paymentGateway/Tabby.png" alt="Tabby" width={44} height={18} /></li>
            <li className="sf-pay__chip sf-pay__chip--tamara">tamara</li>
            <li className="sf-pay__chip sf-pay__chip--cod">{t("cod")}</li>
          </ul>

          <div className="sf-settings">
            <label className="sf-select">
              <span className="visually-hidden">{t("language")}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              <select value={locale} onChange={(e) => router.push(pathname, { locale: e.target.value })} aria-label={t("language")}>
                {languageOptions2.map((o) => <option key={o.value} value={o.value}>{o.text}</option>)}
              </select>
            </label>
            <label className="sf-select">
              <span className="visually-hidden">{t("countryLabel")}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
              <select
                name="footer-country"
                defaultValue={currencyOptions[0]?.link}
                onChange={(e) => { if (e.target.value !== currencyOptions[0]?.link) window.location.href = e.target.value; }}
                aria-label={t("countryLabel")}
              >
                {currencyOptions.map((o) => <option key={o.link} value={o.link}>{label(o.text)}</option>)}
              </select>
            </label>
          </div>

          <p className="sf-legal">
            {t("copyright", { year })}
            {LEGAL.cr && <span> · {t("cr")}: <bdi>{LEGAL.cr}</bdi></span>}
            {LEGAL.vat && <span> · {t("vat")}: <bdi>{LEGAL.vat}</bdi></span>}
          </p>
        </div>
      </div>
    </footer>
  );
}
