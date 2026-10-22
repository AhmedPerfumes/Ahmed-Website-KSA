import Footer1 from "@/components/footers/Footer1";

import Header1 from "@/components/headers/Header1";

import StoreLocator from "@/components/otherPages/storelocator/StoreLocator";
import React from "react";

export const metadata = {
  title: "Store Location || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function StoreLocationPage() {
  return (
    <>
      <main className="page-wrapper">
        <StoreLocator />
      </main>
      <Footer1 />
    </>
  );
}
