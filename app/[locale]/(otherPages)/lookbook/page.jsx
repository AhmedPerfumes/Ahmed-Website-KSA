import Footer1 from "@/components/footers/Footer1";

import Header1 from "@/components/headers/Header1";
import Lookbook from "@/components/otherPages/Lookbook";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Lookbook | Ahmed Al Maghribi Perfumes",
    description: "Explore the Ahmed Al Maghribi Perfumes lookbook — luxury fragrance collections.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/lookbook`,
      languages: {
        "ar-SA": `${baseUrl}/ar/lookbook`,
        en: `${baseUrl}/en/lookbook`,
        "x-default": `${baseUrl}/ar/lookbook`,
      },
    },
  };
}
export default function LookbookPage() {
  return (
    <>
      <Header1 />
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Lookbook />
      </main>

      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
