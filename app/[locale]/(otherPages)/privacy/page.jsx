import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import Privacy from '@/components/otherPages/Privacy'
import React from 'react'
import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "سياسة الخصوصية | عطور أحمد المغربي" : "Privacy Policy | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "تعرف على سياسة الخصوصية وحماية البيانات لدى متجر عطور أحمد المغربي في المملكة العربية السعودية."
    : "Read the privacy policy and data protection practices of Ahmed Al Maghribi Perfumes.";

  return await buildStaticPageMetadata({
    pageKey: "privacy",
    locale,
    path: "privacy",
    defaultTitle,
    defaultDesc,
  });
}
export default function PrivacyPolicy() {
  return (
      <div style={{
          backgroundImage: `url(/assets/background-ivory.webp)`,
        }}>
        <Privacy/>
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
