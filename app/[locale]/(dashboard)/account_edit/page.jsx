import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Header14 from "@/components/headers/Header14";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import EditAccount from "@/components/otherPages/EditAccount";
import React from "react";

export const metadata = {
  title: "Dashboard Account Edit || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function AccountEditPage() {
  return (
    <>
      <Header14 />
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="my-account container">
          <h2 className="page-title">Account Details</h2>
          <div className="row">
            <DashboardSidebar />
            <EditAccount />
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
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
