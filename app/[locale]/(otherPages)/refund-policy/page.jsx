import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import RefundPolicy from '@/components/otherPages/RefundPolicy'
import React from 'react'
const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Refund Policy | Ahmed Al Maghribi Perfumes",
    description: "Read the refund and return policy of Ahmed Al Maghribi Perfumes.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/refund-policy`,
      languages: {
        "ar-SA": `${baseUrl}/ar/refund-policy`,
        en: `${baseUrl}/en/refund-policy`,
        "x-default": `${baseUrl}/ar/refund-policy`,
      },
    },
  };
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
