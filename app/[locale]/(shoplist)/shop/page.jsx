import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import Shop1 from "@/components/shoplist/Shop1";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};

const ShopPage = async({ searchParams }) => {
  const search = searchParams.q;
  // console.log('000', search);
  return (
    <>
      <Header14 />
      <main>
        <Shop1 search={search}/>
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

export default ShopPage;
