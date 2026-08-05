/**
 * SARSymbol.jsx
 * Official new Saudi Riyal symbol (approved Feb 2025, Unicode 17.0 U+20C1).
 * Rendered as inline SVG for maximum font-independent compatibility.
 *
 * Usage:
 *   import SARSymbol from "@/components/common/SARSymbol";
 *   <SARSymbol />                    — 1em, inherits currentColor
 *   <SARSymbol size="0.9em" />
 */

"use client";

/**
 * The new Saudi Riyal symbol is stylised Arabic ر (rāʾ) with two horizontal
 * crossbars, approved by King Salman on 20 Feb 2025 and encoded as U+20C1 in
 * Unicode 17.0.  We render it as an SVG so it works on all browsers/fonts
 * without requiring Unicode 17.0 font support.
 */
export default function SARSymbol({ size = "1em", color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill={color}
      aria-label="Saudi Riyal"
      role="img"
      focusable="false"
      className={className}
      style={{ display: "inline-block", verticalAlign: "-0.15em", lineHeight: 1, flexShrink: 0, ...style }}
    >
      {/* Body of the ر curve */}
      <path d="M14.5 2.5 C14.5 2.5 15 2.5 15 3 L15 9 C15 12.5 12 14 9 15 C7 15.7 6 17 6 19 L6 19.5 C6 19.8 5.7 20 5.5 20 L3.5 20 C3.2 20 3 19.8 3 19.5 L3 19 C3 15.5 5.5 13.5 8.5 12.3 C11 11.3 12 10 12 8.5 L12 5.5 L5.5 5.5 C5.2 5.5 5 5.3 5 5 L5 3 C5 2.7 5.2 2.5 5.5 2.5 Z" />
      {/* Top crossbar */}
      <rect x="3" y="7.5" width="12" height="1.5" rx="0.6" />
      {/* Lower crossbar */}
      <rect x="3" y="10.5" width="9.5" height="1.5" rx="0.6" />
    </svg>
  );
}
