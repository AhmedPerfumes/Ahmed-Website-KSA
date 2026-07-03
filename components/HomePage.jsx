"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/homepage/HeroBanner";
import dynamic from "next/dynamic";

/* ── Below-fold sections: code-split so their JS chunks don't ship in the
   initial bundle. Combined with the idle-callback defer below, these chunks
   are neither downloaded NOR mounted until the browser reports it's idle.
   This directly reduces TBT without causing any CLS. ── */

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
 * LCP strategy: HeroBanner renders immediately with server-fetched slide data
 * (initialSliders prop from the server component). No skeleton shown if data
 * is available, so the first hero <Image priority> fires a browser preload
 * before any client JS runs.
 *
 * TBT strategy: All below-fold sections are mounted in a SINGLE batch via
 * requestIdleCallback (or setTimeout fallback). This means:
 *  1. Their JS chunks are NOT downloaded until idle time
 *  2. All their useEffect/API calls happen after LCP is already painted
 *  3. No IntersectionObserver overhead, no forced reflows, no CLS
 *
 * CLS strategy: Below-fold content mounts below the visible viewport
 * (hero is 92svh full-screen). Content appearing below the fold does NOT
 * count as CLS because it's not in the user's visible area.
 */
const HomePage = ({ initialSliders = [], initialMobileSliders = [] }) => {
    const [belowFoldReady, setBelowFoldReady] = useState(false);

    useEffect(() => {
        // Mount all below-fold sections when browser is genuinely idle.
        // requestIdleCallback fires after the browser has finished painting
        // the first frame and the main thread is free — perfect for TBT.
        if (typeof window === "undefined") return;

        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(
                () => setBelowFoldReady(true),
                { timeout: 2500 } // Force mount after 2.5s even if never idle
            );
            return () => window.cancelIdleCallback(id);
        } else {
            // Safari fallback — defer by one frame then mount
            const id = setTimeout(() => setBelowFoldReady(true), 200);
            return () => clearTimeout(id);
        }
    }, []);

    return (
        <div id="main">
            {/* ── CRITICAL PATH: renders immediately with server-fetched data ── */}
            <HeroBanner
                initialSliders={initialSliders}
                initialMobileSliders={initialMobileSliders}
            />

            {/* ── BELOW-FOLD: mounted as one batch when browser is idle ── */}
            {belowFoldReady && (
                <>
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
                </>
            )}
        </div>
    );
};

export default HomePage;
