import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// import Loader from "@/components/loader/Loader";
import Shop10 from "@/components/shoplist/shop10/Shop10";
import React from "react";

import Shop5 from "@/components/shoplist/Shop5";

import RelatedSlider from "@/components/singleProduct/RelatedSlider";

import QuickView from "@/components/modals/QuickView";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
  },
};

async function getCategorySubCategory(categoryName) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: categoryName.split("-").join(" ").toUpperCase(),
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

// export default function ShopPage5() {
  const ShopPage5 = async () => {
    const category = 'gift-sets';
    console.log(category);
    try {
      const data = await getCategorySubCategory(category);
      console.log(data);
      return data && (
      <>
        <QuickView />
        <Header14 />
        <main>
          <Shop5 />
          <Shop10 products={ data.products }/>
        </main>

        <section className=" d-none d-lg-block" style={{ height: "100%" }}>
          <Footer14 />
        </section>
        <section className=" d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
          <MobileFooter2/>
        </div>
      </section>
        {/* <Footer1 /> */}
      </>
    );
  } catch (error) {
    console.error(error);
    return <><Header14 />
            <main className="page-wrapper">
              <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Category Found</h2>
              <RelatedSlider relatedProds={ null }/>
            </main>
            <section className="d-none d-lg-block" style={{ height: "100%" }}>
              <Footer14 />
            </section>
            <section className="d-sm-block d-md-none bg-dark pt-5  ">
              <div className="MobileFooter">
                <MobileFooter2/>
              </div>
            </section></>;
  }
}

export default ShopPage5;
