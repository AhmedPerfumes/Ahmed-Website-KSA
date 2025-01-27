import Footer14 from '@/components/footers/Footer14'
import MobileFooter2 from '@/components/footers/MobileFooter2'
import Header14 from '@/components/headers/Header14'
import Privacy from '@/components/otherPages/Privacy'
import React from 'react'
export const metadata = {
    title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
    description: "Buy Best Perfumes Online Ahmed Perfume",
    icons: {
      icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
    },
  };
export default function PrivacyPolicy() {
  return (
      <div style={{
          backgroundImage: `url(/assets/background-ivory.webp)`,
        }}>
          <Header14/>
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
