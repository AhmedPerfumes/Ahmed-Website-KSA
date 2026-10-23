import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2';
import Terms from '@/components/otherPages/Terms'
import React from 'react'
import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "الشروط والأحكام | عطور أحمد المغربي" : "Terms & Conditions | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "الشروط والأحكام الخاصة بالتسوق والطلب عبر متجر عطور أحمد المغربي في المملكة العربية السعودية."
    : "Read the terms and conditions of Ahmed Al Maghribi Perfumes Saudi Arabia.";

  return await buildStaticPageMetadata({
    pageKey: "terms",
    locale,
    path: "terms",
    defaultTitle,
    defaultDesc,
  });
}
function Tnc() {
  return (
    <div style={{
      backgroundImage: `url(/assets/background-ivory.webp)`,
    }}>
        <Terms/>
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

export default Tnc
