import Footer14 from "@/components/footers/Footer14";
import Cart from "@/components/shopCartandCheckout/Cart";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import { getTranslations } from "next-intl/server";

import React from "react";

export async function generateMetadata({ params: { locale } }) {
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "سلة التسوق | عطور أحمد المغربي"
      : "Shopping Cart | Ahmed Al Maghribi Perfumes",
    description: isAr
      ? "سلة التسوق الخاصة بك في متجر عطور أحمد المغربي."
      : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
    icons: {
      icon: "/assets/images/ahmed-favicon.png",
    },
  };
}

<<<<<<< HEAD
export default function CartPage({ params: { locale } }) {
  const isAr = locale === "ar";
=======
export default async function () {
  const t = await getTranslations("CartPage");
>>>>>>> arshad
  return (
    <>
      <main className="page-wrapper">
        <section className="shop-checkout container">
<<<<<<< HEAD
          <h1 className="page-title">{isAr ? "سلة التسوق" : "Cart"}</h1>
          <ChectoutSteps step={1} />
=======
          <h1 className="page-title">{t("pageTitle")}</h1>
          <ChectoutSteps />
>>>>>>> arshad
          <Cart />
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
