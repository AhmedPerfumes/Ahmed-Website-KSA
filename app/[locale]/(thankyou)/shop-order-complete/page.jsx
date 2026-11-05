import Footer14 from "@/components/footers/Footer14";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import OrderCompleted from "@/components/shopCartandCheckout/OrderCompleted";

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
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title">ORDER RECEIVED</h2>
          <ChectoutSteps step={3} />
          <OrderCompleted />
        </section>
      </main>
      <Footer14 />
    </>
  );
}
