"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let lenis = null;

/**
 * SmoothScroll — Lenis-powered inertia scroll for the whole site.
 * Mount once in the root layout (client component only).
 *
 * iOS Safari already has excellent momentum scroll — Lenis fighting it
 * causes the jitter/bounce bug on iPhone. We skip Lenis on touch-primary
 * devices (iOS/Android) and let the browser handle native scroll.
 * Desktop mouse-wheel still gets the buttery Lenis easing.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Detect touch-primary device (iOS, Android).
    // On these devices native scroll is already smooth; Lenis causes jitter.
    const isTouchDevice =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) return; // Skip Lenis entirely on mobile/touch

    // Desktop only — initialise Lenis
    lenis = new Lenis({
      duration: 1.4,          // seconds — longer = more butter-smooth
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 0,     // never intercept touch even if this runs
      infinite: false,
    });

    // RAF loop
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // On route change: scroll to top instantly (no animation between pages)
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
