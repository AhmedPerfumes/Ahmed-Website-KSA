import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Export from "@/components/otherPages/Contact/Export"

import Contact from "@/components/otherPages/Contact/Contact";
import LocationMap from "@/components/otherPages/Contact/LocationMap";

import React from "react";
// import Loader from "@/components/loader/Loader";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr
    ? "طلبات التصدير والتوزيع الخارجي | عطور أحمد المغربي"
    : "Export & International Distribution | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تواصل مع قسم التصدير والمبيعات الدولية لعطور أحمد المغربي. شراكات توزيع موثوقة حول العالم."
    : "Partner with Ahmed Al Maghribi Perfumes for export and international distribution. Luxury Arabian fragrances worldwide.";

  return await buildStaticPageMetadata({
    pageKey: "export",
    locale,
    path: "export",
    defaultTitle,
    defaultDesc,
  });
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
