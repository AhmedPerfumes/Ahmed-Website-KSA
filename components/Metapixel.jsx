// "use client";
// import React, { useEffect } from "react";
// import { usePathname, useSearchParams } from "next/navigation";

// export const FacebookPixelEvents = () => {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     import("react-facebook-pixel")
//       .then((x) => x.default)
//       .then((ReactPixel) => {
//         ReactPixel.init("235034997951707"); // Replace with your Facebook Pixel ID
//         ReactPixel.pageView();

//         // Example: Track a conversion event with a token
//         // const conversionToken = "EAADhP2FyWZAMBO6CAWMq5YxAjtKauCOOulAhpS3ZAvDJ2NP7XXUrOhR9u7ZCzZComTVtFxVFM6c2SZA0yAztBPLoX5UqecbwC3Kss4tvlk0wvMcp4Fx45tT5838bQgO8HUWd6z6It4zZA8uxPNiBzvNLlXkW9rg55Kv5GraBn2sxaN8kzFuHBICRbooLPAY1xyQAZDZD"; // Replace with your dynamic token logic

//         // ReactPixel.track("Lead", {
//         //   currency: "AED", // Adjust as needed
//         //   value: '100.0', // Adjust the value as appropriate for your use case
//         //   token: conversionToken, // Add the token
//         // });
//       });
//   }, [pathname, searchParams]);

//   return null;
// };

"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const FacebookPixelEvents = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [cartData, setCartData] = useState({ items: [], total: 0 });

    useEffect(() => {
        const loadFacebookPixel = () => {
            if (!window.fbq) {
                (function (f, b, e, v, n, t, s) {
                    if (f.fbq) return;
                    n = f.fbq = function () {
                        n.callMethod
                            ? n.callMethod.apply(n, arguments)
                            : n.queue.push(arguments);
                    };
                    if (!f._fbq) f._fbq = n;
                    n.push = n;
                    n.loaded = !0;
                    n.version = "2.0";
                    n.queue = [];
                    t = b.createElement(e);
                    t.async = !0;
                    t.src = v;
                    s = b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t, s);
                })(
                    window,
                    document,
                    "script",
                    "https://connect.facebook.net/en_US/fbevents.js"
                );

                fbq("init", "378810655103461"); // Replace with your Pixel ID
                fbq("track", "PageView");
            }
        };

        loadFacebookPixel();

        // Track PageView on route change
        fbq("track", "PageView");

        // Track InitiateCheckout when user visits the checkout page
        if (pathname.includes("en/shop/checkout")) {
            fbq("track", "InitiateCheckout", {
                content_ids: cartData.items.map((item) => item.id), // Pass actual product IDs
                content_type: "product",
                value: cartData.total, // Total cart value
                currency: "KSA",
            });
        }
    }, [pathname, searchParams, cartData]);

    return null;
};
