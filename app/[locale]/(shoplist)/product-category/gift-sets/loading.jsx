/**
 * loading.jsx — gift-sets route
 * Next.js App Router streams this skeleton while the server-side
 * getCategorySubCategory() fetch is in-flight.
 * NOTE: Header is NOT included here — it lives in layout.jsx (always persistent).
 */
import React from "react";
import PremiumCategorySkeleton from "@/components/shoplist/premium/PremiumCategorySkeleton";

export default function GiftSetsLoading() {
  return (
    <main>
      <PremiumCategorySkeleton />
    </main>
  );
}
