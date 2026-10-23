import React from "react";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import CityWalk from "@/components/campagin/Citywalk";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr
    ? "عروض وتخفيضات العطور | عطور أحمد المغربي"
    : "Sale & Special Fragrance Offers | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تسوق أفضل عروض وتخفيضات العطور الفاخرة، البخور، والدخون بأسعار مميزة داخل المملكة العربية السعودية."
    : "Shop luxury perfumes, oud, and fragrance sets on sale at special discounted prices with fast delivery across KSA.";

  return await buildStaticPageMetadata({
    pageKey: "sale",
    locale,
    path: "sale",
    defaultTitle,
    defaultDesc,
  });
}

const Citywalk = () => {
  return (
    <div className="page-wrapper pt-0 min-vh-100 d-flex flex-column">
      {/* Main Content Area */}
      <main className="flex-grow-1">
        <CityWalk />
      </main>

      {/* Responsive Footer Strategy */}
      <footer>
        {/* Desktop Footer */}
        <section className="d-none d-lg-block border-top">
          <Footer14 />
        </section>

        {/* Mobile Footer */}
        <section className="d-block d-lg-none bg-dark pt-5 pb-4">
          <div className="container">
            <div className="MobileFooter">
              <MobileFooter2 />
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default Citywalk;
