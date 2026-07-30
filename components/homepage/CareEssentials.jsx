"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./CareEssentials.css";

/**
 * CareEssentials — 2-column editorial grid after SmallBanner.
 * Each card is a tall square editorial image (with background)
 * overlaid with a title + "Shop Now" CTA — mirroring the
 * Body Care example image (Body Care / Hair Mist panels).
 */
export default function CareEssentials() {
    const locale = useLocale();
    const t = useTranslations();

    const items = [
        {
            id: "body-care",
            eyebrow: t("Body & Skin"),
            title: t("BODY CARE"),
            subtitle: t("Luxurious gels, lotions & creams"),
            img: "https://ae.ahmedalmaghribi.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fdemo8%2Favif%2Fbest-sellers.avif&w=1920&q=75",
            localImg: "/assets/images/home/demo8/best-sellers.jpg",
            link: `/product-category/gel`,
            cta: t("Shop Body Care"),
            align: "left",
        },
        {
            id: "hair-mist",
            eyebrow: t("Hair & Fragrance"),
            title: t("Hair Mist"),
            subtitle: t("Delicate scents that linger all day"),
            img: "https://ae.ahmedalmaghribi.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fdemo8%2Favif%2Fcollection-Banner.avif&w=1920&q=75",
            localImg: "/assets/images/home/demo8/collection-Banner.jpg",
            link: `/product-category/hair-mist`,
            cta: t("Shop Hair Mist"),
            align: "right",
        },
    ];

    return (
        <section className="care" aria-label="Care Essentials" id="care-essentials">
            <div className="care__inner">

                {/* ── Section heading ── */}
                <div className="care__head">
                    <span className="care__eyebrow">{t("By Ahmed Al Maghribi")}</span>
                    <h2 className="care__title">{t("Care Essentials")}</h2>
                </div>

                {/* ── 2-col grid ── */}
                <div className="care__grid">
                    {items.map((item) => (
                        <article key={item.id} className="care-card">
                            {/* Full-bleed image */}
                            <Link href={`/${locale}${item.link}`} className="care-card__link" tabIndex={-1}>
                                <Image
                                    src={item.localImg}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 767px) 95vw, 50vw"
                                    className="care-card__img"
                                    loading="lazy"
                                />
                                <span className="care-card__scrim" />
                            </Link>

                            {/* Text overlay */}
                            <div className={`care-card__body care-card__body--${item.align}`}>
                                <span className="care-card__eyebrow">{item.eyebrow}</span>
                                <h3 className="care-card__title">{item.title}</h3>
                                <p className="care-card__sub">{item.subtitle}</p>
                                <Link href={`/${locale}${item.link}`} className="care-card__cta">
                                    {item.cta}
                                    <svg viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

            </div>
        </section>
    );
}
