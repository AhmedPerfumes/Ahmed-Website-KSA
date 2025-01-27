import Blog1 from "@/components/blogs/Blog1";

import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import React from "react";

import MobileFooter2 from "@/components/footers/MobileFooter2";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
  },
};
export default function BlogPage1() {
  return (
    <>
      <Header14 />
      <main className="page-wrapper">
        <Blog1 />
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
