import React from "react";
import BrandedErrorPage from "@/components/otherPages/BrandedErrorPage";
import Footer14 from "@/components/footers/Footer14";

export const metadata = {
  title: "Page not found | Ahmed Al Maghribi Perfumes",
  description: "The page you were looking for could not be found. Search our perfumes or browse the collection.",
  robots: { index: false, follow: true },
  icons: { icon: "/assets/images/ahmed-favicon.png" },
};

export default function NotFound() {
  return (
    <>
      <main className="page-wrapper">
        <BrandedErrorPage variant="notFound" />
      </main>
      <Footer14 />
    </>
  );
}
