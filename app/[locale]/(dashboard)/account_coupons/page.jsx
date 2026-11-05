import Footer14 from "@/components/footers/Footer14";
import AccountCoupons from "@/components/otherPages/AccountCoupons";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React from "react";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};

export default function AccountCouponsPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="my-account container">
          <h2 className="page-title">Your Coupons</h2>
          <div className="row">
            <DashboardSidebar />
            <AccountCoupons />
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
      <Footer14 />
    </>
  );
}
