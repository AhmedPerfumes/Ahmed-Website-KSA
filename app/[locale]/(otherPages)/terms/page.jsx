import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2';
import Terms from '@/components/otherPages/Terms'
import React from 'react'
const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Terms & Conditions | Ahmed Al Maghribi Perfumes",
    description: "Read the terms and conditions of Ahmed Al Maghribi Perfumes.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/terms`,
      languages: {
        "ar-SA": `${baseUrl}/ar/terms`,
        en: `${baseUrl}/en/terms`,
        "x-default": `${baseUrl}/ar/terms`,
      },
    },
  };
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
