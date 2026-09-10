/**
 * Checkout Route Group Layout
 *
 * Overrides the global layout's header for all routes inside
 * (shop-cart-checkout): shop-cart, shop-checkout, shop-order-complete,
 * order-tracking, tamara-payment-redirect.
 *
 * Audit fix (CRITICAL): Full site navigation was showing during checkout,
 * creating distraction and conflicting with distraction-free benchmark.
 * This layout renders a minimal checkout header (logo + back-to-cart +
 * secure badge) while the global Header14 / MobileHeader are hidden via CSS.
 *
 * Note: Next.js nested layouts inherit the parent layout's providers and
 * scripts but CAN override which header components are rendered by
 * applying CSS to hide the global nav elements for this route group.
 * The CheckoutHeader is rendered first in this layout file.
 */

import CheckoutHeader from "@/components/headers/CheckoutHeader";
import "./checkout-layout.css";

export default function CheckoutLayout({ children }) {
    return (
        <>
            {/* Minimal checkout header — replaces full Header14 + MobileHeader */}
            <CheckoutHeader />
            {children}
        </>
    );
}
