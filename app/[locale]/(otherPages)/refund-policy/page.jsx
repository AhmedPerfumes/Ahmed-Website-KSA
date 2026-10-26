import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import RefundPolicy from '@/components/otherPages/RefundPolicy'
import React from 'react'
import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "سياسة الاسترجاع والاسترداد والاستبدال | عطور أحمد المغربي" : "Return, Refund & Exchange Policy | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تعرف على سياسة وشروط الاسترجاع والاسترداد والاستبدال لمتجر عطور أحمد المغربي في المملكة العربية السعودية."
    : "Explore the official return, refund, and exchange policy for Ahmed Al Maghribi Perfumes in Saudi Arabia.";

  return await buildStaticPageMetadata({
    pageKey: "refund-policy",
    locale,
    path: "refund-policy",
    defaultTitle,
    defaultDesc,
  });
}

function Refund() {
  return (
    <div style={{
        backgroundImage: `url(/assets/background-ivory.webp)`,
      }}>
        <RefundPolicy/>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
          <MobileFooter2/>
        </div>
      </section>
    </div>
  )
}

export default Refund
