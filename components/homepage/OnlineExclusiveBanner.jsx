"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./OnlineExclusiveBanner.css";

/**
 * OnlineExclusiveBanner â€” editorial banner for Online Exclusive section.
 * Same structure as GiftBanner: full-bleed image + text overlay + CTA.
 */
export default function OnlineExclusiveBanner() {
    const locale = useLocale();
    const t      = useTranslations();

    return (
        <div className="oebnr" aria-label="Online Exclusive Banner">
            <div className="oebnr__inner">

                {/* Full-bleed image */}
                <Link href={`/${locale}/shop`} className="oebnr__link" tabIndex={-1}>
                    <Image
                        src="/assets/images/online-exclusive-banner.png"
                        alt="Online Exclusive â€” only available at Ahmed Al Maghribi online"
                        fill
                        sizes="(max-width: 768px) 95vw, 100vw"
                        className="oebnr__img"
                        priority={false}
                        loading="lazy"
                    />
                    <span className="oebnr__scrim" />
                </Link>

                {/* Text overlay â€” eyebrow + title + CTA */}
                <div className="oebnr__text">
                    <span className="oebnr__eyebrow">{t("Only Here, Only Now")}</span>
                    <h2 className="oebnr__title">
                        {t("Online")} <em>{t("Exclusive")}</em>
                    </h2>
                    
                    <Link href={`/${locale}/shop`} className="oebnr__cta">
                        {t("Shop Online Exclusive")}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}

