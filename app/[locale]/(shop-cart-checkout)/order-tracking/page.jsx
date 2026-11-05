import Footer14 from "@/components/footers/Footer14";
import OrderTrack from "@/components/shopCartandCheckout/OrderTrack";

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
        <OrderTrack />
      </main>
      <Footer14 />
    </>
  );
}
