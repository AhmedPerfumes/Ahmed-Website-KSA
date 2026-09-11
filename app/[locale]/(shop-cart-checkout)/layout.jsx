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
 *
 * The `.checkout-scope` wrapper div is CRITICAL — checkout-layout.css uses
 * `body:has(.checkout-scope)` to scope all header-hiding rules so they are
 * ONLY active while this layout is mounted. Once the user navigates to
 * a non-checkout page (e.g. homepage), this wrapper is unmounted and the
 * global header reappears correctly.
 */

import CheckoutHeader from "@/components/headers/CheckoutHeader";
import "./checkout-layout.css";

export default function CheckoutLayout({ children }) {
    return (
        <div className="checkout-scope">
            {/* Minimal checkout header — replaces full Header14 + MobileHeader */}
            <CheckoutHeader />
            {children}
        </div>
    );
}
