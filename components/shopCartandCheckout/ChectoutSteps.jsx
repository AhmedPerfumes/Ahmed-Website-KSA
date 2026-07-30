"use client";
import Link from "next/link";
import { useLocale } from "next-intl";

const IconCart = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM5.17 5H2V3H0v2h2l3.6 7.59L4.25 15C4.09 15.32 4 15.65 4 16c0 1.1.9 2 2 2h14v-2H6.42c-.13 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03L23 7H5.17z"/>
  </svg>
);
const IconCheckout = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);
const IconConfirmed = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>
  </svg>
);

export default function ChectoutSteps({ step = 1 }) {
  const locale = useLocale();

  const steps = [
    { num: 1, label: "Cart",      sub: "Your items",           href: `/${locale}/shop-cart`,           Icon: IconCart      },
    { num: 2, label: "Checkout",  sub: "Shipping & payment",   href: `/${locale}/shop-checkout`,        Icon: IconCheckout  },
    { num: 3, label: "Confirmed", sub: "Order placed",         href: `/${locale}/shop-order-complete`,  Icon: IconConfirmed },
  ];

  return (
    <div className="cc-stepper">
      {steps.map((s, i) => {
        const isCompleted = step > s.num;   // steps behind current → clickable back-nav
        const isActive    = step === s.num;  // current step
        const state       = isCompleted ? 'completed' : isActive ? 'active' : 'pending';

        // Completed steps are back-nav links; active/pending are non-link spans
        const Tag      = isCompleted ? Link : 'span';
        const tagProps = isCompleted ? { href: s.href, prefetch: false } : {};

        return (
          <div
            key={i}
            style={{
              display:     'flex',
              alignItems:  'center',
              flex:        i < steps.length - 1 ? 1 : '0 0 auto',
              minWidth:    0,
            }}
          >
            <Tag className={`cc-stepper__step ${state}`} {...tagProps} style={{ textDecoration: 'none' }}>
              <div className="cc-stepper__icon-circle">
                <s.Icon />
              </div>
              <div className="cc-stepper__text">
                <strong>{s.label}</strong>
                <em>{s.sub}</em>
              </div>
            </Tag>

            {/* Separator line — filled (gold) for completed steps leading to active */}
            {i < steps.length - 1 && (
              <div className={`cc-stepper__line${isCompleted ? ' filled' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
