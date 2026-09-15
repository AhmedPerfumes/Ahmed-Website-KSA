import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// import Loader from "@/components/loader/Loader";
import About from "@/components/otherPages/about/About";
import Clients from "@/components/otherPages/about/Clients";
import Services from "@/components/otherPages/about/Services";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "About Us | Ahmed Al Maghribi Perfumes",
    description: "Learn about Ahmed Al Maghribi Perfumes — Saudi Arabia's premier luxury fragrance house.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        "ar-SA": `${baseUrl}/ar/about`,
        en: `${baseUrl}/en/about`,
        "x-default": `${baseUrl}/ar/about`,
      },
    },
  };
}
export default function AboutPage() {
  return (
    <>
    {/* <Loader/> */}
      <main className="">
        {/* <div className="mb-4 pb-4"></div> */}
        <About />
        {/* <Services /> */}
        {/* <Clients /> */}
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
