import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import Shipping from '@/components/otherPages/Shipping'
import React from 'react'
import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "الشحن والتوصيل | عطور أحمد المغربي" : "Shipping & Delivery | Ahmed Al Maghribi Perfumes";
  const defaultDesc = isAr
    ? "معلومات الشحن والتوصيل، المدة والرسوم لجميع مناطق المملكة العربية السعودية من عطور أحمد المغربي."
    : "Shipping and delivery information, timelines, and rates across Saudi Arabia for Ahmed Al Maghribi Perfumes.";

  return await buildStaticPageMetadata({
    pageKey: "shipping-and-delivery",
    locale,
    path: "shipping-and-delivery",
    defaultTitle,
    defaultDesc,
  });
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
