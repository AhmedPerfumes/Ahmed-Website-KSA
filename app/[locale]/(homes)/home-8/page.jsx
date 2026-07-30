import Footer14 from "@/components/footers/Footer14";
import HomePage from "@/components/HomePage";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import React from "react";
import NewsLetter from "@/components/modals/NewsLetter";

/**
 * Server Component — fetches hero sliders at request time so:
 * 1. The first hero <Image> is in the SSR HTML (Next.js adds <link rel="preload"> automatically)
 * 2. The browser starts downloading the hero image BEFORE any JS runs
 * 3. LCP drops from ~35s → ~3–6s
 *
 * `revalidate: 120` means Next.js caches the API response for 2 min (ISR),
 * so the server never blocks on a slow API after the first cache fill.
 */
async function fetchInitialSliders() {
    const controller = new AbortController();
    // Abort after 4 seconds — if API is slow (common on localhost),
    // fail fast so TTFB stays low. On production the API is faster.
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}api/productCategoriesTemp`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
                signal: controller.signal,
                next: { revalidate: 120 }, // ISR: cache for 2 min on production
            }
        );
        clearTimeout(timer);
        if (!res.ok) return { homeSliders: [], homeMobileSliders: [] };
        const data = await res.json();
        return {
            homeSliders: Array.isArray(data?.home_sliders) ? data.home_sliders : [],
            homeMobileSliders: Array.isArray(data?.home_mobile_sliders) ? data.home_mobile_sliders : [],
        };
    } catch {
        clearTimeout(timer);
        // Timeout or network error — HeroBanner will fall back to MenuContext
        return { homeSliders: [], homeMobileSliders: [] };
    }
}

export default async function HomePage8() {
    const { homeSliders, homeMobileSliders } = await fetchInitialSliders();

    // Build the /_next/image preload URL — this MUST match what the browser requests.
    // Next.js Image with fill + sizes="100vw" on a mobile device (390px @ 2x DPR)
    // picks w=828 (smallest deviceSize > 780px). The preload must use the same URL.
    const firstSlide = homeSliders?.[0] || homeMobileSliders?.[0];
    const rawImageUrl = firstSlide?.image
        ? `${process.env.NEXT_PUBLIC_API_URL}storage/${firstSlide.image}`
        : null;
    const heroPreloadUrl = rawImageUrl
        ? `/_next/image?url=${encodeURIComponent(rawImageUrl)}&w=828&q=75`
        : null;

    return (
        <div style={{ backgroundImage: `url(/assets/background-ivory.webp)` }}>
            {/*
             * Preload the page background texture — at 210 KiB it can be the LCP
             * candidate on mobile. CSS background images are NOT auto-preloaded.
             */}
            <link rel="preload" as="image" href="/assets/background-ivory.webp" fetchPriority="low" />

            {/*
             * Preload the LCP hero image using the exact /_next/image URL.
             * fetchpriority="high" tells the browser to prioritize this above
             * all other resource downloads. The URL format matches what Next.js
             * Image actually requests on a 390px mobile @ 2x DPR device.
             */}
            {heroPreloadUrl && (
                <link
                    rel="preload"
                    as="image"
                    href={heroPreloadUrl}
                    fetchPriority="high"
                    imageSizes="100vw"
                />
            )}

            <NewsLetter />

            <div className="d-none d-lg-block" />
            <div className="d-sm-block d-md-none" />

            <main id="main-content" aria-label="Homepage content">
                <HomePage
                    initialSliders={homeSliders}
                    initialMobileSliders={homeMobileSliders}
                />
            </main>

            <section className="d-none d-md-block" style={{ height: "100%" }}>
                <Footer14 />
            </section>
            <section className="d-sm-block d-md-none bg-dark pt-5">
                <div className="MobileFooter">
                    <MobileFooter2 />
                </div>
            </section>
        </div>
    );
}
