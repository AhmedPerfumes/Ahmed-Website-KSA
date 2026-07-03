/**
 * PremiumCategorySkeleton
 * Shown via Next.js loading.jsx while the server-side API call completes.
 * Matches the exact layout of PremiumProductGrid: heading → toolbar → grid.
 */

import React from "react";
import "./skeleton.css";

/* Number of placeholder cards to render */
const CARD_COUNT = 8;

function SkeletonCard() {
  return (
    <div className="pcs-card" aria-hidden="true">
      {/* Image area */}
      <div className="pcs-img shimmer" />

      {/* Text lines */}
      <div className="pcs-body">
        <div className="pcs-line pcs-line--name shimmer" />
        <div className="pcs-line pcs-line--name-short shimmer" />
        <div className="pcs-line pcs-line--price shimmer" />
      </div>

      {/* Actions */}
      <div className="pcs-actions">
        <div className="pcs-line pcs-line--qty shimmer" />
        <div className="pcs-line pcs-line--atc shimmer" />
      </div>
    </div>
  );
}

export default function PremiumCategorySkeleton() {
  return (
    <div className="pcs-root" aria-busy="true" aria-label="Loading products…">

      {/* ── Heading ── */}
      <div className="pcs-heading-wrap">
        <div className="pcs-heading-line shimmer" />
        <div className="pcs-heading-accent shimmer" />
      </div>

      {/* ── Toolbar ── */}
      <div className="pcs-toolbar">
        <div className="pcs-tb-pill shimmer" />
        <div className="pcs-tb-spacer" />
        <div className="pcs-tb-count shimmer" />
        <div className="pcs-tb-select shimmer" />
      </div>

      {/* ── Product grid ── */}
      <div className="pcs-grid">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

    </div>
  );
}
