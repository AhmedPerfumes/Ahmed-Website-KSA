"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./GiftBanner.css";

/**
 * GiftBanner — editorial banner with eyebrow, title, and "Explore Gift Sets" CTA
 * overlaid on the gift-set image. The CTA lives here, not in GiftSets below.
 */
export default function GiftBanner() {
    const locale = useLocale();
    const t      = useTranslations();

    return (
        <div className="gbnr" aria-label="Gift Sets Banner">
            <div className="gbnr__inner">

                {/* Full-bleed image */}
                <Link href={`/${locale}/shop/gift-sets`} className="gbnr__link" tabIndex={-1}>
                    <Image
                        src="https://ae.ahmedalmaghribi.com/assets/images/home/demo8/avif/giftset-bnr.avif"
                        alt="The Art of Gifting — luxury gift sets for every occasion"
                        fill
                        sizes="(max-width: 768px) 95vw, 100vw"
                        className="gbnr__img"
                        priority={false}
                        loading="lazy"
                    />
                    <span className="gbnr__scrim" />
                </Link>

                {/* Text overlay — eyebrow + title + CTA */}
                <div className="gbnr__text">
                    <span className="gbnr__eyebrow">{t("Elegant Treasures")}</span>
                    <h2 className="gbnr__title">
                        {t("The Art of")} <em>{t("Gifting")}</em>
                    </h2>
                    <Link href={`/${locale}/shop/gift-sets`} className="gbnr__cta">
                        {t("Explore Gift Sets")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}
