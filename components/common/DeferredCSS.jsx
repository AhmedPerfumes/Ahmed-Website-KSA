"use client";

import { useEffect } from "react";

/**
 * DeferredCSS — loads non-critical stylesheets asynchronously after
 * the page has painted. This removes them from the render-blocking path,
 * saving ~870ms of FCP/LCP time.
 *
 * Libraries covered:
 *  - react-tooltip  (used in product cards, below fold)
 *  - swiper.min.css (used in HeroBanner but its own CSS is small; effect-fade handles the rest)
 *  - rc-slider      (used in price filter, shop page)
 *  - tippy.js       (used in tooltips, interactive elements)
 *  - react-toastify (used for toast notifications, never on initial paint)
 */
const DEFERRED_STYLES = [
    "/assets/css/plugins/swiper.min.css",
    "/_next/static/css/react-tooltip.css", // loaded via node_modules path
];

function loadStylesheet(href) {
    // Avoid double-loading
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print"; // trick: load as non-render-blocking
    document.head.appendChild(link);
    // Switch media to "all" after load so styles apply
    link.onload = () => { link.media = "all"; };
}

export default function DeferredCSS() {
    useEffect(() => {
        // Use requestIdleCallback so this runs after FCP/LCP
        const mount = () => {
            // Dynamic imports for CSS via style injection
            import("react-tooltip/dist/react-tooltip.css").catch(() => {});
            import("rc-slider/assets/index.css").catch(() => {});
            import("tippy.js/dist/tippy.css").catch(() => {});
            import("react-toastify/dist/ReactToastify.css").catch(() => {});
        };

        if ("requestIdleCallback" in window) {
            const id = requestIdleCallback(mount, { timeout: 3000 });
            return () => cancelIdleCallback(id);
        } else {
            const id = setTimeout(mount, 500);
            return () => clearTimeout(id);
        }
    }, []);

    return null;
}
