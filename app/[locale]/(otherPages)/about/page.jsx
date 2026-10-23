import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// import Loader from "@/components/loader/Loader";
import About from "@/components/otherPages/about/About";
import Clients from "@/components/otherPages/about/Clients";
import Services from "@/components/otherPages/about/Services";
import React from "react";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "من نحن | عطور أحمد المغربي" : "About Us | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تعرف على عطور أحمد المغربي — بيت العطور الفاخر الأول في المملكة العربية السعودية."
    : "Learn about Ahmed Al Maghribi Perfumes — Saudi Arabia's premier luxury fragrance house.";

  return await buildStaticPageMetadata({
    pageKey: "about",
    locale,
    path: "about",
    defaultTitle,
    defaultDesc,
  });
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
