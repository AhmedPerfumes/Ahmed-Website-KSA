import Footer14 from "@/components/footers/Footer14";

import VerifyOTP from "@/components/otherPages/VerifyOTP";
import React from "react";


export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};
export default function VerifyOTPPage() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <VerifyOTP />
      </main>

      <div className="mb-5 pb-xl-5"></div>
      <Footer14 />
    </>
  );
}
