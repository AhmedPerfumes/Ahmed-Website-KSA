"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import "./checkout-header.css";

/**
 * CheckoutHeader — minimal distraction-free header for the checkout flow.
 *
 * Shows:
 *  • Ahmed Al Maghribi logo (links to homepage)
 *  • Progress indicator: "Secure Checkout"
 *  • Security badge (lock icon)
 *  • Back-to-cart link
 *
 * Deliberately excludes: full navigation, cart icon, promo banner,
 * mobile hamburger, search, language switcher — per audit requirement.
 */
export default function CheckoutHeader() {
    const locale = useLocale();

    return (
        <header className="ck-header" role="banner" aria-label="Checkout">
            <div className="ck-header__inner">

                {/* ← Back to cart (left) */}
                <Link
                    href={`/${locale}/shop-cart`}
                    className="ck-header__back"
                    aria-label="Return to cart"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    <span className="ck-header__back-text">Cart</span>
                </Link>

                {/* Logo (centre) */}
                <Link href={`/${locale}`} className="ck-header__logo" aria-label="Ahmed Al Maghribi — Home">
                    <Image
                        src="/assets/images/logo/Desktop.svg"
                        alt="Ahmed Al Maghribi Perfumes"
                        width={68}
                        height={68}
                        priority
                        style={{ objectFit: "contain" }}
                    />
                </Link>

                {/* Secure badge (right) */}
                <div className="ck-header__secure" aria-label="Secure checkout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Secure Checkout</span>
                </div>
            </div>
        </header>
    );
}
