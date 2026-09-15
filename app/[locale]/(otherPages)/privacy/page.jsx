import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import Privacy from '@/components/otherPages/Privacy'
import React from 'react'
const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Privacy Policy | Ahmed Al Maghribi Perfumes",
    description: "Read the privacy policy of Ahmed Al Maghribi Perfumes.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        "ar-SA": `${baseUrl}/ar/privacy`,
        en: `${baseUrl}/en/privacy`,
        "x-default": `${baseUrl}/ar/privacy`,
      },
    },
  };
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
