"use client";

import HeroBanner from "@/components/homepage/HeroBanner";
import dynamic from "next/dynamic";

/* ── Below-fold sections: code-split so their JS chunks don't ship in the
   initial bundle. Loaded on demand but mounted immediately so the footer
   never floats above content regardless of whether HeroBanner is on or off. ── */

const BestSellers         = dynamic(() => import("@/components/homepage/BestSellers"),        { ssr: false });
const CollectionShowcase  = dynamic(() => import("@/components/homepage/CollectionShowcase"),  { ssr: false });
const OffersBanner        = dynamic(() => import("@/components/homepage/OffersBanner"),        { ssr: false });
const SpecialOffers       = dynamic(() => import("@/components/homepage/SpecialOffers"),       { ssr: false });
const NewArrivals         = dynamic(() => import("@/components/homepage/NewArrivals"),         { ssr: false });
const OnlineExclusiveBanner = dynamic(() => import("@/components/homepage/OnlineExclusiveBanner"), { ssr: false });
const OnlineExclusive     = dynamic(() => import("@/components/homepage/OnlineExclusive"),     { ssr: false });
const GiftBanner          = dynamic(() => import("@/components/homepage/GiftBanner"),          { ssr: false });
const GiftSets            = dynamic(() => import("@/components/homepage/GiftSets"),            { ssr: false });
const DakhoonBanner       = dynamic(
    () => import("@/components/homepage/DakhoonBanner").then((m) => ({ default: m.DakhoonBanner })),
    { ssr: false }
);
const DakhoonSection      = dynamic(() => import("@/components/homepage/DakhoonSection"),      { ssr: false });
const CareEssentials      = dynamic(() => import("@/components/homepage/CareEssentials"),      { ssr: false });
const SmallBanner         = dynamic(() => import("@/components/homepage/SmallBanner"),         { ssr: false });

/**
 * HomePage — Ahmed Al Maghribi Perfumes (KSA)
 *
 * HeroBanner can be toggled on/off freely by commenting/uncommenting it.
 * When ON  → hero fills the viewport; sections load below it (no layout shift).
 * When OFF → sections render immediately; footer always stays below content.
 *
 * Code-splitting: all below-fold components use dynamic() so their JS chunks
 * are NOT included in the initial bundle — they download only when mounted.
 * Each section manages its own loading skeleton internally.
 */
const HomePage = ({ initialSliders = [], initialMobileSliders = [] }) => {
    return (
        <div id="main">
            {/* ── Toggle on/off freely — no layout side-effects either way ── */}
            <HeroBanner
                initialSliders={initialSliders}
                initialMobileSliders={initialMobileSliders}
            />

            <BestSellers />
            <CollectionShowcase />
            <OffersBanner />
            <SpecialOffers />
            <NewArrivals />
            <OnlineExclusiveBanner />
            <OnlineExclusive />
            <GiftBanner />
            <GiftSets />
            <DakhoonBanner />
            <DakhoonSection />
            <CareEssentials />
            <SmallBanner />
        </div>
    );
};

export default HomePage;
