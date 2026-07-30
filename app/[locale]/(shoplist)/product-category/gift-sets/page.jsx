import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React from "react";
import QuickView from "@/components/modals/QuickView";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import { headers } from 'next/headers';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  const canonicalUrl = `${baseUrl}/${locale}/product-category/gift-sets`;
  return {
    metadataBase: new URL(baseUrl),
    title: "Gift Sets | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
    description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
    icons: { icon: "/assets/images/ahmed-favicon.png" },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: "/en/product-category/gift-sets",
        ar: "/ar/product-category/gift-sets",
        "x-default": "/en/product-category/gift-sets",
      },
    },
  };
}

function getRequestOrigin() {
  const headersList = headers();
  const host = headersList.get('host') || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

async function getCategorySubCategory(categoryName) {
  const origin = getRequestOrigin();
  const slug = categoryName.toLowerCase();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'origin': origin },
    body: JSON.stringify({ category: categoryName.split("-").join(" ").toUpperCase() }),
    next: { tags: ["categories", `category-${slug}`], revalidate: 604800 },
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

const GiftSetsPage = async ({ params }) => {
  const { locale } = params;
  const category = 'gift-sets';

  const categoryLabel = "Gift Sets";
  const categoryLabelAr = "مجموعات الهدايا";

  try {
    const data = await getCategorySubCategory(category);
    const activeDescription = locale === 'ar' ? data.description_ar : data.description;

    return data && (
      <>
        <QuickView />
        <main>
          <PremiumProductGrid
            subCategories={data.productSubCategories || null}
            products={data.products || null}
            categoryLabel={categoryLabel}
            categoryLabelAr={categoryLabelAr}
            breadcrumbItems={[
              { label: "Shop", labelAr: "المتجر", href: `/${locale}/shop` },
              { label: categoryLabel, labelAr: categoryLabelAr },
            ]}
          />
          <CollapsibleDescription description={activeDescription} locale={locale} />
        </main>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
          <Footer14 />
        </section>
        <section className="d-sm-block d-md-none bg-dark pt-5">
          <div className="MobileFooter">
            <MobileFooter2 />
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error(error);
    return (
      <>
        <main className="page-wrapper">
          <h1 style={{ textAlign: "center", padding: "4rem 1rem", fontSize: "1.2rem" }}>Gift Sets</h1>
          <p style={{ textAlign: "center", color: "#888" }}>No products found. Please try again later.</p>
        </main>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
          <Footer14 />
        </section>
        <section className="d-sm-block d-md-none bg-dark pt-5">
          <div className="MobileFooter">
            <MobileFooter2 />
          </div>
        </section>
      </>
    );
  }
};

export default GiftSetsPage;
