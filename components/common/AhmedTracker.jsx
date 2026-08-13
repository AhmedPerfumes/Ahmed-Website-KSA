"use client";

import { useEffect } from "react";
import { AhmedTracker } from "@/lib/tracker";

export default function AhmedTrackerComponent() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost/ahmed-admin-ksa/public/";
      const formattedBase = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
      const endpoint = `${formattedBase}api/tracker/collect`;

      AhmedTracker.init(endpoint);
      window.AhmedTracker = AhmedTracker;
    }
  }, []);

  return null;
}
