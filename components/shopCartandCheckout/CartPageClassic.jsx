import Footer14 from "@/components/footers/Footer14";
import Cart from "@/components/shopCartandCheckout/Cart";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import { getTranslations } from "next-intl/server";

import React from "react";


// Old /shop-cart page, kept for rollback: render <CartPageClassic /> from shop-cart/page.jsx to restore it.
export default async function CartPageClassic() {
  const t = await getTranslations("CartPage");
  return (
    <>
      <main className="page-wrapper">
        <section className="shop-checkout container">
          <h1 className="page-title">{t("pageTitle")}</h1>
          <ChectoutSteps />
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
