"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./DakhoonSection.css";

/**
 * DakhoonBanner — same structure as GiftBanner.
 * Eyebrow + title + "Shop Dakhoon" CTA overlaid on the dakhoon-bnr.avif image.
 */
export function DakhoonBanner() {
    const locale = useLocale();
    const t      = useTranslations();

    return (
        <div className="dkbnr" aria-label="Dakhoon Collection Banner">
            <div className="dkbnr__inner">

                <Link href={`/${locale}/shop/dakhoon`} className="dkbnr__link" tabIndex={-1}>
                    <Image
                        src="https://ae.ahmedalmaghribi.com/assets/images/home/demo8/avif/dakhoon-bnr.avif"
                        alt="The Essence of Arabic Dakhoon — Ancient Aromas"
                        fill
                        sizes="(max-width: 768px) 95vw, 100vw"
                        className="dkbnr__img"
                        priority={false}
                        loading="lazy"
                    />
                    <span className="dkbnr__scrim" />
                </Link>

                <div className="dkbnr__text">
                    <span className="dkbnr__eyebrow">{t("Ancient Aromas")}</span>
                    <h2 className="dkbnr__title">
                        {t("The Essence of Arabic")} <em>{t("Dakhoon")}</em>
                    </h2>
                    <Link href={`/${locale}/shop/dakhoon`} className="dkbnr__cta">
                        {t("Shop Dakhoon")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}
