import Blog1 from "@/components/blogs/Blog1";

import Footer14 from "@/components/footers/Footer14";

import React from "react";

import { buildPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const title = isAr
    ? "المدونة ومقالات العطور | عطور أحمد المغربي"
    : "Fragrance Blog & Articles | Ahmed Al Maghribi Perfumes";
  const description = isAr
    ? "اكتشف أسرار العطور العربية، العود، البخور، ونصائح اختيار العطر المثالي من خبراء أحمد المغربي."
    : "Discover fragrance guides, the art of Arabic perfumery, oud insights, and perfume styling tips from Ahmed Al Maghribi.";

  return buildPageMetadata({
    locale,
    path: "blog",
    title,
    description,
  });
}
export default function BlogPage1() {
  return (
    <>
      <main className="page-wrapper">
        <Blog1 />
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
