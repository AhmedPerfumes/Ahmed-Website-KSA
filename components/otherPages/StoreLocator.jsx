"use client";
import React, { useState } from "react";
// import StoreMap from "./StoreMap";
// import { storesLocations } from "@/data/storeLocations";
import Script from "next/script";

export default function StoreLocator() {
  return (
    <>
      <Script
        src="https://cdnsl.brandwizard.io/dist/widget.min.js"
        strategy="afterInteractive"
      />
      <div data-rd-locator="0e48bf7a-d1e5-40c2-b777-a3482e3b7af5"></div>
    </>
  );
}
