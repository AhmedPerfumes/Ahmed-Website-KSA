import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";




import React from "react";
// import Loader from "@/components/loader/Loader";
import CityWalk from "@/components/campagin/Citywalk";

export async function generateMetadata({ params }) {
  const { locale } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

  const canonicalUrl = `${baseUrl}/${locale}/sale`;

  return {
    metadataBase: new URL(baseUrl),

    title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",

    description: "Buy Best Perfumes Online Ahmed Perfume",

    icons: {
      icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
    },

    alternates: {
      canonical: canonicalUrl,

      languages: {
        en: "/en/sale",
        ar: "/ar/sale",
        "x-default": "/en/sale",
      },
    },
  };
}

const Citywalk = () => {
  return (
    <>
      {/* <Loader/> */}
   <CityWalk/>
    
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

export default Citywalk;
