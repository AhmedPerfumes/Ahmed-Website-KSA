import Footer14 from "@/components/footers/Footer14";
import AccountLoyalty from "@/components/otherPages/AccountLoyalty";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import React from "react";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};

export default function AccountLoyaltyPage() {
  const t = useTranslations("Account");
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <section className="my-account container">
          <h2 className="page-title">{t("pageLoyalty")}</h2>
          <div className="row">
            <DashboardSidebar />
            <AccountLoyalty />
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
      <Footer14 />
    </>
  );
}
