"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

/**
 * FAQSection — Section 13
 *
 * SEO-critical section. Renders an accordion of product-relevant FAQs.
 * Uses JSON-LD FAQPage schema injected inline for Google rich results.
 *
 * FAQ content is dynamically generated based on:
 *   - product.fragrance_type
 *   - product.category
 *   - product.longevity
 *   - product.sillage
 *   - Static trust Q&As (COD, returns, authenticity)
 *
 * Lazy-loaded in LuxuryPDP.jsx.
 * Purely CSS-driven accordion (no Framer Motion) for performance.
 *
 * API fields: product.longevity, product.sillage, product.fragrance_type,
 *             product.category, product.occasion
 */

const ChevronIcon = () => (
  <svg
    className="pdp-faq__chevron"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FAQItem = ({ question, answer, isOpen, onToggle, idx }) => (
  <div
    className={`pdp-faq__item ${isOpen ? "open" : ""}`}
    itemScope
    itemProp="mainEntity"
    itemType="https://schema.org/Question"
  >
    <button
      className="pdp-faq__question"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${idx}`}
      id={`faq-question-${idx}`}
    >
      <span itemProp="name">{question}</span>
      <ChevronIcon />
    </button>

    <div
      className="pdp-faq__answer"
      id={`faq-answer-${idx}`}
      role="region"
      aria-labelledby={`faq-question-${idx}`}
      itemScope
      itemProp="acceptedAnswer"
      itemType="https://schema.org/Answer"
    >
      <span itemProp="text">{answer}</span>
    </div>
  </div>
);

const buildFAQs = (product, t) => {
  const faqs = [];

  // Dynamic Q1 — Longevity
  if (product?.longevity) {
    faqs.push({
      q: "How long does this perfume last?",
      a: `${product.product_name ? `${product.product_name} has` : "This fragrance has"} a longevity of ${product.longevity}. For best results, apply to pulse points after moisturizing.`,
    });
  }

  // Dynamic Q2 — Sillage / Projection
  if (product?.sillage) {
    faqs.push({
      q: "What is the sillage (trail/projection) of this fragrance?",
      a: `The sillage of this fragrance is ${product.sillage}, meaning it leaves a ${product.sillage.toLowerCase()} scent trail around you.`,
    });
  }

  // Dynamic Q3 — Occasion
  if (product?.occasion) {
    faqs.push({
      q: "When is the best time to wear this perfume?",
      a: `This fragrance is recommended for: ${product.occasion}. It is ${product.fragrance_category ? `a ${product.fragrance_category} scent` : "a versatile fragrance"} that suits these occasions perfectly.`,
    });
  }

  // Static Q4 — COD (KSA critical)
  faqs.push({
    q: "Is Cash on Delivery (COD) available?",
    a: "Yes! We offer Cash on Delivery across Saudi Arabia. Simply select COD at checkout. No card required.",
  });

  // Static Q5 — Authenticity
  faqs.push({
    q: "Are your perfumes 100% authentic and original?",
    a: "Absolutely. All products at Ahmed Al Maghribi Perfumes are 100% genuine and sourced directly. We never sell imitations or replicas.",
  });

  // Static Q6 — Shipping
  faqs.push({
    q: "How long does delivery take in Saudi Arabia?",
    a: "Standard delivery within Saudi Arabia takes 3-5 business days. Express options may be available at checkout.",
  });

  // Static Q7 — Returns
  faqs.push({
    q: "What is your return policy?",
    a: "We offer hassle-free returns within the return window for unopened, unused products. Contact our customer care team to initiate a return.",
  });

  // Dynamic Q8 — Fragrance type
  if (product?.fragrance_type) {
    faqs.push({
      q: `What type of fragrance is this — EDP, EDT, or Parfum?`,
      a: `This product is classified as ${product.fragrance_type.replace(/_/g, " ")}. Different concentrations affect how long the scent lasts and its intensity.`,
    });
  }

  return faqs;
};

const FAQSection = ({ product }) => {
  const t = useTranslations("ProductDetails");
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = buildFAQs(product, t);

  if (faqs.length === 0) return null;

  // Build JSON-LD for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <section className="pdp-faq" aria-labelledby="faq-heading">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="pdp-container">
        <header className="pdp-section-header">
          <span className="pdp-section-eyebrow">Questions & Answers</span>
          <h2 className="pdp-section-title" id="faq-heading">
            Frequently Asked Questions
          </h2>
        </header>

        <div
          className="pdp-faq__list"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              idx={idx}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
