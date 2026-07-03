"use client";

import React, { useState } from "react";

/**
 * TrustBar — Section 1
 * Sticky announcement strip above all content.
 * Dismissible, persists in sessionStorage.
 * No API dependency — driven by translation keys or props.
 */
const TrustBar = ({ text, link, linkText }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("pdp_trustbar_dismissed", "1"); } catch (_) {}
  };

  // Don't render if dismissed
  if (dismissed) return null;

  return (
    <div className="pdp-trust-bar" role="status" aria-live="polite">
      <div className="pdp-trust-bar__text">
        <span>{text || "Free delivery on orders above 200 SAR"}</span>
        {link && linkText && (
          <>
            <span className="pdp-trust-bar__sep" aria-hidden="true">·</span>
            <a href={link} className="pdp-trust-bar__link">{linkText}</a>
          </>
        )}
      </div>
      <button
        className="pdp-trust-bar__close"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        ✕
      </button>
    </div>
  );
};

export default TrustBar;
