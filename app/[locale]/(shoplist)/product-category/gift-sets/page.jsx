import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React, { Suspense } from "react";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import QuickView from "@/components/modals/QuickView";
import PremiumCategorySkeleton from "@/components/shoplist/premium/PremiumCategorySkeleton";
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  const { locale } = params;

  const baseUrl =
    process.env.NEXT_PUBLIC_DEFAULT_ORIGIN ||
    "https://ksa.ahmedalmaghribi.com";

  const canonicalUrl = `${baseUrl}/${locale}/product-category/gift-sets`;
  const isAr = locale === "ar";

  return {
    metadataBase: new URL(baseUrl),

    title: isAr
      ? "مجموعات الهدايا | عطور أحمد المغربي"
      : "Gift Sets | Luxury Perfume Gift Sets in Saudi Arabia | Ahmed Al Maghribi",

    description: isAr
      ? "اكتشف مجموعات الهدايا الفاخرة من أحمد المغربي. عطور راقية معبأة في صناديق هدايا أنيقة. مثالية لكل المناسبات."
      : "Explore premium perfume gift sets from Ahmed Al Maghribi — beautifully packaged luxury fragrance collections, perfect for every occasion in KSA.",

    icons: { icon: "/assets/images/ahmed-favicon.png" },

    robots: { index: true, follow: true },

    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: "/en/product-category/gift-sets",
        ar: "/ar/product-category/gift-sets",
        "x-default": "/en/product-category/gift-sets",
      },
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "Ahmed Al Maghribi Perfumes",
      title: isAr
        ? "مجموعات الهدايا الفاخرة | أحمد المغربي"
        : "Gift Sets | Ahmed Al Maghribi Perfumes",
      description: isAr
        ? "مجموعات هدايا عطرية فاخرة من أحمد المغربي"
        : "Luxury perfume gift sets from Ahmed Al Maghribi — KSA's premium fragrance house.",
      images: [
        {
          url: `${baseUrl}/assets/images/og/gift-sets-og.jpg`,
          width: 1200,
          height: 630,
          alt: isAr
            ? "مجموعات الهدايا | أحمد المغربي"
            : "Gift Sets | Ahmed Al Maghribi Perfumes",
        },
      ],
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRequestOrigin() {
  const headersList = headers();
  const host =
    headersList.get("host") || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const protocol = headersList.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

async function fetchGiftSets() {
  const origin = getRequestOrigin();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/products`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify({ category: "GIFT SETS" }),
      next: { tags: ["categories", "category-gift-sets"], revalidate: 604800 },
    }
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

// ─── Async content component (suspendable) ───────────────────────────────────

/**
 * GiftSetsContent — async RSC that fetches products.
 * Wrapped in <Suspense> so Header14 renders IMMEDIATELY while API is in-flight.
 */
async function GiftSetsContent({ locale }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_DEFAULT_ORIGIN ||
    "https://ksa.ahmedalmaghribi.com";

  try {
    const data = await fetchGiftSets();
    const activeDescription =
      locale === "ar" ? data.description_ar : data.description;

    const itemListSchema = data?.products?.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Gift Sets — Ahmed Al Maghribi Perfumes",
          url: `${baseUrl}/${locale}/product-category/gift-sets`,
          numberOfItems: data.products.length,
          itemListElement: data.products.slice(0, 20).map((product, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${baseUrl}/${locale}/shop/gift-sets/gift-sets/${(
              product.product_name || ""
            )
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .trim()}`,
            name: product.product_name,
          })),
        }
      : null;

    return (
      <>
        {itemListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
          />
        )}
        <PremiumProductGrid
          products={data.products}
          categoryLabel="Gift Sets"
          categoryLabelAr="مجموعات الهدايا"
        />
        <CollapsibleDescription description={activeDescription} locale={locale} />
      </>
    );
  } catch (error) {
    console.error(error);
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#888" }}>
        No products found. Please try again later.
      </div>
    );
  }
}

// ─── Page shell (synchronous — renders instantly) ───────────────────────────

const ShopPage5 = ({ params }) => {
  const { locale } = params;

  return (
    <>
      {/* Google Fonts preconnect — non-blocking */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Poppins:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ✅ Header renders IMMEDIATELY — no API wait */}
      <QuickView />

      <main>
        {/*
          Suspense boundary:
          • fallback = skeleton (shown instantly while API fetches)
          • content  = real product grid (streamed in when API resolves)
          Header14 above stays visible throughout.
        */}
        <Suspense fallback={<PremiumCategorySkeleton />}>
          <GiftSetsContent locale={locale} />
        </Suspense>
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
};

export default ShopPage5;
