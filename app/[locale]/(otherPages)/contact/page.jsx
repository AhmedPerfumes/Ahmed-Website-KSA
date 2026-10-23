import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// import Loader from "@/components/loader/Loader";
import Contact from "@/components/otherPages/Contact/Contact";
import LocationMap from "@/components/otherPages/Contact/LocationMap";

import React from "react";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "اتصل بنا | عطور أحمد المغربي" : "Contact Us | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تواصل مع عطور أحمد المغربي. ابحث عن متاجرنا أو اتصل بنا أو أرسل رسالة."
    : "Get in touch with Ahmed Al Maghribi Perfumes. Find our stores, call us, or send a message.";

  return await buildStaticPageMetadata({
    pageKey: "contact",
    locale,
    path: "contact",
    defaultTitle,
    defaultDesc,
  });
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
