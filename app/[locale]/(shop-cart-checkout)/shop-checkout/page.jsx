import Footer14 from "@/components/footers/Footer14";
import Checkout from "@/components/shopCartandCheckout/Checkout";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";

import React from "react";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};
export default function () {
  const t= useTranslations();
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title">{t("Shipping and Checkout")}</h2>
          <ChectoutSteps step={2} />
          <Checkout />
        </section>
      </main>
      <Footer14 />
    </>
  );
}
