import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";


import Header14 from "@/components/headers/Header14";


import React from "react";
// import Loader from "@/components/loader/Loader";
import CityWalk from "@/components/campagin/Citywalk";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
  },
};

const Citywalk = () => {
  return (
    <>
      {/* <Loader/> */}
      <Header14 />
   <CityWalk/>
    
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

export default Citywalk;
