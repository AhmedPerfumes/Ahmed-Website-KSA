"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { fetchDiscountOffers } from "@/utlis/productsCache";
import "./OffersBanner.css";

/**
 * OffersBanner — editorial image banner that sits above Exclusive Offers.
 * Matches the same contained structure as GiftBanner / DakhoonBanner.
 * Automatically yields when SpecialOffers displays an active dynamic promotion banner.
 */
export default function OffersBanner() {
    const locale = useLocale();
    const [hasDynamicPromoBanner, setHasDynamicPromoBanner] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const discounts = await fetchDiscountOffers();
                const activePromo = Array.isArray(discounts) ? discounts[0] : null;
                if (activePromo?.image) {
                    setHasDynamicPromoBanner(true);
                }
            } catch {
                setHasDynamicPromoBanner(false);
            }
        })();
    }, []);

    if (hasDynamicPromoBanner) {
        return null;
    }

    return (
        <div className="offbnr" aria-label="Exclusive Offers Banner">
            <div className="offbnr__inner">
                <Link href={`/${locale}/shop`} className="offbnr__link" tabIndex={-1}>
                    <Image
                        src="/assets/images/home/demo8/collection-Banner.jpg"
                        alt="Collection — Ahmed Al Maghribi Perfumes"
                        fill
                        sizes="(max-width: 768px) 95vw, 100vw"
                        className="offbnr__img"
                        priority={false}
                        loading="lazy"
                    />
                    <span className="offbnr__scrim" />
                </Link>
            </div>
        </div>
    );
}
