"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import "./OffersBanner.css";

/**
 * OffersBanner — editorial image banner that sits above Exclusive Offers.
 * Matches the same contained structure as GiftBanner / DakhoonBanner.
 */
export default function OffersBanner() {
    const locale = useLocale();

    return (
        <div className="offbnr" aria-label="Exclusive Offers Banner">
            <div className="offbnr__inner">
                <Link href={`/${locale}/shop/special-offers`} className="offbnr__link" tabIndex={-1}>
                    <Image
                        src="https://assaf.ae/cdn/shop/files/Frankel_2000x.jpg?v=1764520098"
                        alt="Exclusive Offers — Ahmed Al Maghribi Perfumes"
                        fill
                        sizes="(max-width: 768px) 95vw, 100vw"
                        className="offbnr__img"
                        priority={false}
                        loading="lazy"
                        unoptimized
                    />
                    <span className="offbnr__scrim" />
                </Link>
            </div>
        </div>
    );
}
