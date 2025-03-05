import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
import Checkout from "@/components/shopCartandCheckout/Checkout";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import MobileFooter2 from "@/components/footers/MobileFooter2";

import React from "react";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};

export default function () {
  return (
    <>
      <Header14 />
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title">Shipping and Checkout</h2>
          <ChectoutSteps />
          <Checkout />
        </section>
      </main>
      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
        
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5  ">
      <div className="MobileFooter">
      

      <MobileFooter2/>
      </div>
      </section>
    </>
  );
}
