import Footer1 from "@/components/footers/Footer1";

import Header1 from "@/components/headers/Header1";
import Lookbook from "@/components/otherPages/Lookbook";
import React from "react";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "كتالوج الصور والتشكيلات | عطور أحمد المغربي" : "Lookbook | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "استعرض تشكيلة عطور أحمد المغربي الفاخرة، الإطلالات العطرية الحصرية، وأحدث الإصدارات."
    : "Explore the Ahmed Al Maghribi Perfumes lookbook — luxury fragrance collections and signature scents.";

  return await buildStaticPageMetadata({
    pageKey: "lookbook",
    locale,
    path: "lookbook",
    defaultTitle,
    defaultDesc,
  });
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
