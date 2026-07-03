"use client";

import React from "react";
import { useTranslations } from "next-intl";

/**
 * TrustPillars — Section 5
 *
 * 4 trust signals displayed as icon + label + micro-text.
 * KSA-specific: COD, Authenticity, Delivery speed, Returns.
 * Static section — no animation, no JS overhead.
 *
 * API fields: shippingServiceCharges (from MenuContext — passed as prop)
 */

const TRUST_ICONS = {
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  cod: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="7" y1="15" x2="7.01" y2="15" /><line x1="11" y1="15" x2="13" y2="15" />
    </svg>
  ),
  authentic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L3.09 6.26A2 2 0 002 8.1V12c0 5.25 3.73 10.17 9 11.5 5.27-1.33 9-6.25 9-11.5V8.1a2 2 0 00-1.09-1.84L12 2z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  returns: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  ),
};

const TrustPillars = ({ shippingPrice }) => {
  const t = useTranslations("ProductDetails");

  const pillars = [
    {
      id: "delivery",
      icon: TRUST_ICONS.delivery,
      title: t("delivery.shipping"),
      text: t("delivery.expectedDeliveryText"),
    },
    {
      id: "cod",
      icon: TRUST_ICONS.cod,
      title: "Cash on Delivery",
      text: "Pay when your order arrives at your door",
    },
    {
      id: "authentic",
      icon: TRUST_ICONS.authentic,
      title: "100% Authentic",
      text: "Every product is genuine and quality-checked",
    },
    {
      id: "returns",
      icon: TRUST_ICONS.returns,
      title: "Easy Returns",
      text: t("delivery.paymentText"),
    },
  ];

  return (
    <section className="pdp-trust-pillars" aria-label="Trust signals">
      <div className="pdp-container">
        <div className="pdp-trust-pillars__grid">
          {pillars.map((p) => (
            <div key={p.id} className="pdp-trust-pillar">
              <div className="pdp-trust-pillar__icon">{p.icon}</div>
              <p className="pdp-trust-pillar__title">{p.title}</p>
              <p className="pdp-trust-pillar__text">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustPillars;
