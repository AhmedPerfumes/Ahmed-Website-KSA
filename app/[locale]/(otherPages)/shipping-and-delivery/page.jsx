import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import Shipping from '@/components/otherPages/Shipping'
import React from 'react'
const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    metadataBase: new URL(baseUrl),
    title: "Shipping & Delivery | Ahmed Al Maghribi Perfumes",
    description: "Shipping and delivery information for Ahmed Al Maghribi Perfumes in Saudi Arabia.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: `${baseUrl}/${locale}/shipping-and-delivery`,
      languages: {
        "ar-SA": `${baseUrl}/ar/shipping-and-delivery`,
        en: `${baseUrl}/en/shipping-and-delivery`,
        "x-default": `${baseUrl}/ar/shipping-and-delivery`,
      },
    },
  };
}

function ShippingDelivery() {
  return (
    <div style={{
        backgroundImage: `url(/assets/background-ivory.webp)`,
      }}> 
        
        <Shipping/>
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

export default ShippingDelivery
