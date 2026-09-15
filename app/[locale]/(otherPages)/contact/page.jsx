import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// import Loader from "@/components/loader/Loader";
import Contact from "@/components/otherPages/Contact/Contact";
import LocationMap from "@/components/otherPages/Contact/LocationMap";

import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Contact Us | Ahmed Al Maghribi Perfumes",
    description: "Get in touch with Ahmed Al Maghribi Perfumes. Find our stores, call us, or send a message.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        "ar-SA": `${baseUrl}/ar/contact`,
        en: `${baseUrl}/en/contact`,
        "x-default": `${baseUrl}/ar/contact`,
      },
    },
  };
}
export default function ContactPage() {
  return (
    <>
    {/* <Loader/> */}
        <Contact />
      <main className="page-wrapper">
    

        <section className="google-map mb-5">
          <h2 className="d-none">Contact US</h2>
        </section>
      </main>
      <div className="mb-5 pb-xl-5"></div>
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
