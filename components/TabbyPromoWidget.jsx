"use client";
/**
 * TabbyPromoWidget.jsx
 *
 * Self-contained Tabby instalment widget — mirrors TamaraWidget's pattern
 * so it is equally stable across re-renders:
 *
 *  • Loads tabby-promo.js once via <script> (not appended inside an effect
 *    that fires on every price change — that was re-creating the script tag
 *    and nuking the injected HTML each time).
 *  • Exposes a `key` prop via `widgetKey` — parent passes `key={widgetKey}`
 *    to force a full remount when price genuinely changes, exactly the same
 *    trick Tamara uses with `key={tamara-widget-${amount}}`.
 *  • Uses a `<div data-tabby-promo>` slot so TabbyPromo can inject into it
 *    without React interfering.
 */

import { useEffect, useRef, useState } from "react";

const TabbyPromoWidget = ({
  price   = 0,
  currency = "SAR",
  lang     = "en",
  source   = "cart",
  publicKey   = "pk_test_019228fd-8e52-3ecd-f813-bf11dc8e2118",
  merchantCode = "assaaste",
}) => {
  const [isClient, setIsClient] = useState(false);
  const containerRef    = useRef(null);

  // Guard: only run client-side (mirrors TamaraWidget's isClient pattern)
  useEffect(() => { setIsClient(true); }, []);

  // Load script once — never re-append
  useEffect(() => {
    if (!isClient) return;
    const scriptId = "tabby-promo-js";
    let cancelled = false;
    let timer = null;
    let attempts = 0;

    // NOTE: never wipe + re-init the same element. Tabby renders with Preact and
    // caches its root per element, so re-rendering into a cleared node can leave it
    // blank ("shows then disappears"). A price/lang change instead swaps in a fresh
    // container element via the `key` below, and we init that one exactly once.
    const attemptInit = () => {
      if (cancelled || !containerRef.current) return;
      try {
        if (window.TabbyPromo) {
          if (containerRef.current.dataset.tabbyInit === "1") return;
          containerRef.current.dataset.tabbyInit = "1";
          new window.TabbyPromo({
            selector: `#${containerRef.current.id}`,
            currency,
            price: parseFloat(price) || 0,
            lang: lang === "ar" ? "ar" : "en",
            source,
            publicKey,
            merchantCode,
          });
        } else if (attempts < 12) {
          // Script not ready yet — retry (max ~6s)
          attempts += 1;
          timer = setTimeout(attemptInit, 500);
        }
      } catch (_) {}
    };

    if (document.getElementById(scriptId)) {
      // Script already in DOM (possibly still loading) — init / poll until ready
      attemptInit();
    } else {
      const s = document.createElement("script");
      s.id    = scriptId;
      s.src   = "https://checkout.tabby.ai/tabby-promo.js";
      s.async = true;
      s.onload = attemptInit;
      document.body.appendChild(s);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isClient, price, lang]); // fresh container (via key) when price or lang changes

  if (!isClient) return null;

  // Unique, stable container ID per widget instance
  const containerId = `tabby-promo-${source}`;

  return (
    <div
      key={`${parseFloat(price) || 0}-${lang}`}
      id={containerId}
      ref={containerRef}
      aria-label="Tabby — Pay in 4 instalments"
      style={{ minHeight: 0 }}
    />
  );
};

export default TabbyPromoWidget;
