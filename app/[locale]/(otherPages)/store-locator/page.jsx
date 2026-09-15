import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'


import StoreLocator from "@/components/otherPages/StoreLocator";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Store Locator | Ahmed Al Maghribi Perfumes KSA",
    description: "Discover Ahmed Al Maghribi Perfumes stores all over Saudi Arabia.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/store-locator`,
      languages: {
        "ar-SA": `${baseUrl}/ar/store-locator`,
        en: `${baseUrl}/en/store-locator`,
        "x-default": `${baseUrl}/ar/store-locator`,
      },
    },
  };
}
export default function StoreLocationPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <StoreLocator />
      </main>

      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
          <MobileFooter2/>
        </div>
      </section>
    </>
  );
}
