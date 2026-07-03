import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Export from "@/components/otherPages/Contact/Export"

import Contact from "@/components/otherPages/Contact/Contact";
import LocationMap from "@/components/otherPages/Contact/LocationMap";

import React from "react";
// import Loader from "@/components/loader/Loader";

export async function generateMetadata({ params }) {
  const { locale } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

  const canonicalUrl = `${baseUrl}/${locale}/export`;

  return {
    metadataBase: new URL(baseUrl),

    title: "Gift Sets | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",

    description:
      "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",

    icons: {
      icon: "/assets/images/ahmed-favicon.png",
    },

    alternates: {
      canonical: canonicalUrl,

      languages: {
        en: "/en/export",
        ar: "/ar/export",
        "x-default": "/en/export",
      },
    },
  };
}

const ExportPage = () => {
  return (
    <>
      {/* <Loader/> */}
      <Export />
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

export default ExportPage;
