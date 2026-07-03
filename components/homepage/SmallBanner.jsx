"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./SmallBanner.css";

/**
 * SmallBanner — Dark cinematic band with heritage message + CTA.
 * Placed below the gift sets carousel as a visual break.
 */
export default function SmallBanner() {
    const locale = useLocale();
    const t = useTranslations();

    return (
        <section className="small-banner" aria-label={t("Crafted with Passion")} id="small-banner">
            <div className="small-banner__inner">
                <span className="small-banner__eyebrow">
                    {t("Since 2003")}
                </span>
                <h2 className="small-banner__title">
                    {t("Crafted with")} <em>{t("Passion")}</em>
                </h2>
                <p className="small-banner__desc">
                    {t(
                        "For over 20 years Ahmed Al Maghribi Perfumes has been dedicated to creating luxurious timeless scents Using only the finest natural ingredients we ensure every fragrance is crafted with precision and excellence offering lasting quality"
                    )}
                </p>
                <Link
                    href={`/${locale}/shop`}
                    className="small-banner__cta"
                >
                    {t("Explore All")}
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
