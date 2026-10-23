import Footer14 from '@/components/footers/Footer14';
import MobileFooter2 from '@/components/footers/MobileFooter2';
import Header14 from "@/components/headers/Header14";
import StoreLocator from "@/components/otherPages/storelocator/StoreLocator";
import React from "react";

import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isArabic = locale === "ar";

  const defaultTitle = isArabic
    ? "محدد مواقع الفروع | أحمد المغربي للعطور السعودية"
    : "Store Locator | Ahmed Al Maghribi Perfumes KSA";
  const defaultDesc = isArabic
    ? "اعثر على أقرب فرع لأحمد المغربي للعطور في السعودية، واكتشف العطور الفاخرة، والعطور العربية، والعود، وروائحنا المميزة."
    : "Find your nearest Ahmed Al Maghribi Perfumes store in Saudi Arabia (KSA) and explore luxury perfumes, Arabian fragrances, oud and signature scents.";

  return await buildStaticPageMetadata({
    pageKey: "store-locator",
    locale,
    path: "store-locator",
    defaultTitle,
    defaultDesc,
  });
}

async function getStores() {
  const token = process.env.STORE_LOCATOR;
  if (!token) {
    console.error("STORE_LOCATOR token is missing in .env");
    return [];
  }

  try {
    const res = await fetch("https://prod-backend.rightchoice.ai/v1/store-details/", {
      headers: {
        Authorization: token.trim(),
      },
      next: {
        revalidate: 60 * 60 * 24 * 7, // Cached for 7 days (604,800 seconds)
        tags: ["store-locator"],
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch stores: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data?.result || [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

export default async function StoreLocationPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const stores = await getStores();

  return (
    <>
      <main>
        <StoreLocator initialStores={stores} locale={locale} />
      </main>

      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
          <MobileFooter2 />
        </div>
      </section>
    </>
  );
}
