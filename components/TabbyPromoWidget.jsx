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
  const scriptLoadedRef = useRef(false);
  const containerRef    = useRef(null);
  const initAttempts    = useRef(0);

  // Guard: only run client-side (mirrors TamaraWidget's isClient pattern)
  useEffect(() => { setIsClient(true); }, []);

  // Load script once — never re-append
  useEffect(() => {
    if (!isClient) return;
    const scriptId = "tabby-promo-js";

    const attemptInit = () => {
      if (!containerRef.current) return;
      try {
        if (window.TabbyPromo) {
          // Clear previous injection so TabbyPromo writes fresh HTML
          containerRef.current.innerHTML = "";
          new window.TabbyPromo({
            selector: `#${containerRef.current.id}`,
            currency,
            price: parseFloat(price) || 0,
            lang: lang === "ar" ? "ar" : "en",
            source,
            publicKey,
            merchantCode,
          });
          scriptLoadedRef.current = true;
        } else if (initAttempts.current < 12) {
          // Script not ready yet — retry with back-off (max ~6s)
          initAttempts.current += 1;
          setTimeout(attemptInit, 500);
        }
      } catch (_) {}
    };

    if (document.getElementById(scriptId)) {
      // Script already in DOM — just init
      attemptInit();
    } else {
      const s = document.createElement("script");
      s.id    = scriptId;
      s.src   = "https://checkout.tabby.ai/tabby-promo.js";
      s.async = true;
      s.onload = attemptInit;
      document.body.appendChild(s);
    }
  }, [isClient, price, lang]); // re-init when price or lang changes

  if (!isClient) return null;

  // Unique, stable container ID per widget instance
  const containerId = `tabby-promo-${source}`;

  return (
    <div
      id={containerId}
      ref={containerRef}
      aria-label="Tabby — Pay in 4 instalments"
      style={{ minHeight: 0 }}
    />
  );
};

export default TabbyPromoWidget;
