"use client";
import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const FacebookPixelEvents = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("235034997951707"); // Replace with your Facebook Pixel ID
        ReactPixel.pageView();

        // Example: Track a conversion event with a token
        // const conversionToken = "EAADhP2FyWZAMBO6CAWMq5YxAjtKauCOOulAhpS3ZAvDJ2NP7XXUrOhR9u7ZCzZComTVtFxVFM6c2SZA0yAztBPLoX5UqecbwC3Kss4tvlk0wvMcp4Fx45tT5838bQgO8HUWd6z6It4zZA8uxPNiBzvNLlXkW9rg55Kv5GraBn2sxaN8kzFuHBICRbooLPAY1xyQAZDZD"; // Replace with your dynamic token logic

        // ReactPixel.track("Lead", {
        //   currency: "AED", // Adjust as needed
        //   value: '100.0', // Adjust the value as appropriate for your use case
        //   token: conversionToken, // Add the token
        // });
      });
  }, [pathname, searchParams]);

  return null;
};
