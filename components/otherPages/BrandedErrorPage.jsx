"use client";
/**
 * BrandedErrorPage — used by app/[locale]/not-found.jsx (404) and app/[locale]/error.jsx (runtime error).
 * Search, the main categories, clear "keep shopping" links and a best-sellers row,
 * so a dead end still leads back into the store. Fully bilingual + RTL.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import { fetchBestSelling } from "@/utlis/productsCache";
import { linePrice, productImageUrl, productHref } from "@/utlis/cartPricing";

const slug = (s) => String(s || "").trim().split(/\s+/).join("-").toLowerCase();

export default function BrandedErrorPage({ variant = "notFound", onRetry }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("ErrorPage");
  const tAll = useTranslations();
  const { categoriesSubCategories, currency } = useMenu();
  const [q, setQ] = useState("");
  const [best, setBest] = useState([]);

  useEffect(() => {
    let off = false;
    fetchBestSelling().then((all) => {
      if (off || !all) return;
      const list = Array.isArray(all.all) ? all.all : Object.values(all).flat().filter(Boolean);
      const seen = new Set();
      setBest(list.filter((p) => p?.product_id && !seen.has(p.product_id) && seen.add(p.product_id) && productImageUrl(p)).slice(0, 4));
    }).catch(() => {});
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: variant === "notFound" ? "page_404" : "page_error", page_path: window.location.pathname });
    } catch { /* ignore */ }
    return () => { off = true; };
  }, [variant]);

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.replace(/&amp;/g, "").replace(/[^\w\s؀-ۿ-]/g, "").replace(/\s+/g, " ").trim();
    window.location.href = term ? `/${locale}/shop?q=${term.split(" ").join("-")}` : `/${locale}/shop`;
  };

  const categories = (categoriesSubCategories || []).slice(0, 6).map((c) => ({
    label: tAll.has(c.name) ? tAll(c.name) : c.name,
    href: c.name !== "Gift Sets" ? `/${locale}/product-category/${slug(c.name)}` : `/${locale}/product-category/gift-sets`,
  }));

  const isNotFound = variant === "notFound";

  return (
    <section className="err-page" aria-labelledby="err-title">
      <div className="err-page__inner">
        <p className="err-page__code" aria-hidden="true">{isNotFound ? "404" : "!"}</p>
        <h1 id="err-title" className="err-page__title">{isNotFound ? t("notFoundTitle") : t("errorTitle")}</h1>
        <p className="err-page__text">{isNotFound ? t("notFoundText") : t("errorText")}</p>

        <form className="err-page__search" role="search" onSubmit={onSearch}>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            enterKeyHint="search"
          />
          <button type="submit" aria-label={t("search")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <span>{t("search")}</span>
          </button>
        </form>

        <div className="err-page__ctas">
          {!isNotFound && onRetry && (
            <button type="button" className="err-btn err-btn--dark" onClick={onRetry}>{t("tryAgain")}</button>
          )}
          <Link href={`/${locale}/shop`} className={`err-btn ${isNotFound ? "err-btn--dark" : "err-btn--outline"}`}>{t("continueShopping")}</Link>
          <Link href={`/${locale}`} className="err-btn err-btn--outline">{t("backHome")}</Link>
        </div>

        {categories.length > 0 && (
          <nav className="err-page__cats" aria-label={t("browse")}>
            <p className="err-page__label">{t("browse")}</p>
            <ul>
              {categories.map((c) => <li key={c.href}><Link href={c.href}>{c.label}</Link></li>)}
              <li><Link href={`/${locale}/sale`}>{tAll.has("Sale") ? tAll("Sale") : "Sale"}</Link></li>
            </ul>
          </nav>
        )}
      </div>

      {best.length > 0 && (
        <div className="err-page__best">
          <p className="err-page__label">{t("bestSellers")}</p>
          <div className="err-page__grid">
            {best.map((p) => {
              const name = isAr && p.product_name_ar?.trim() ? p.product_name_ar : he.decode(p.product_name || "");
              const price = linePrice(p);
              const href = productHref(p, locale) || `/${locale}/shop`;
              return (
                <Link key={p.product_id} href={href} className="err-card">
                  <span className="err-card__img"><Image src={productImageUrl(p)} alt={name} fill sizes="(max-width: 767px) 45vw, 220px" style={{ objectFit: "cover" }} /></span>
                  <span className="err-card__name">{name}</span>
                  <span className="err-card__price">{price.unit.toFixed(2)} {currency?.symbol}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <p className="err-page__help">
        {t.rich("help", { link: (c) => <Link href={`/${locale}/contact`}>{c}</Link> })}
      </p>
    </section>
  );
}
