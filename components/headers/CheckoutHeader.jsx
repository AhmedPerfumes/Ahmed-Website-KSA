"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import "./checkout-header.css";

/**
 * CheckoutHeader — luxury distraction-free header for the checkout flow.
 *
 * Ahmed Al Maghribi Perfumes
 * Features:
 *  • 3-column CSS Grid: guarantees the brand logo is mathematically centered on all devices
 *  • Desktop: generous padding, pill-styled back link, and trust badge
 *  • Mobile: symmetrical 38px touch targets for back button and security badge, with perfectly aligned logo
 *  • Fully bilingual: Arabic (RTL) & English (LTR) support
 */
export default function CheckoutHeader() {
    const locale = useLocale();
    const isRtl = locale === "ar";

    return (
        <header className="ck-header" role="banner" aria-label={isRtl ? "شريط الدفع الآمن" : "Checkout Header"}>
            <div className="ck-header__inner">

                {/* Left column: ← Back to Cart */}
                <div className="ck-header__col ck-header__col--left">
                    <Link
                        href={`/${locale}/shop-cart`}
                        className="ck-header__back"
                        aria-label={isRtl ? "العودة إلى السلة" : "Return to cart"}
                    >
                        <svg
                            className="ck-header__back-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span className="ck-header__back-text">
                            {isRtl ? "السلة" : "Cart"}
                        </span>
                    </Link>
                </div>

                {/* Center column: Ahmed Al Maghribi Logo */}
                <div className="ck-header__col ck-header__col--center">
                    <Link
                        href={`/${locale}`}
                        className="ck-header__logo"
                        aria-label={isRtl ? "أحمد المغربي للعطور — الرئيسية" : "Ahmed Al Maghribi — Home"}
                    >
                        <Image
                            src="/assets/images/logo/Desktop.svg"
                            alt="Ahmed Al Maghribi Perfumes"
                            width={110}
                            height={52}
                            priority
                            className="ck-header__logo-img"
                        />
                    </Link>
                </div>

                {/* Right column: Secure Checkout Trust Badge */}
                <div className="ck-header__col ck-header__col--right">
                    <div
                        className="ck-header__secure"
                        role="status"
                        aria-label={isRtl ? "دفع آمن ومشفّر 100%" : "100% Secure Checkout"}
                    >
                        <span className="ck-header__secure-dot" aria-hidden="true" />
                        <svg
                            className="ck-header__secure-icon"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="ck-header__secure-text">
                            {isRtl ? "دفع آمن" : "Secure Checkout"}
                        </span>
                    </div>
                </div>

            </div>
        </header>
    );
}

