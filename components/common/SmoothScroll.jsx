"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let lenis = null;

/**
 * SmoothScroll — Lenis-powered inertia scroll for the whole site.
 * Mount once in the root layout (client component only).
 * Lenis intercepts mouse-wheel / touch events and applies smooth easing.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialise Lenis
    lenis = new Lenis({
      duration: 1.4,          // seconds — longer = more butter-smooth
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
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
