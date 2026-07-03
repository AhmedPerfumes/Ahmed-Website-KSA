import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React, { Suspense } from "react";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import QuickView from "@/components/modals/QuickView";
import PremiumCategorySkeleton from "@/components/shoplist/premium/PremiumCategorySkeleton";
import { headers } from "next/headers";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRequestOrigin() {
  const headersList = headers();
  const host =
    headersList.get("host") || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const protocol = headersList.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

async function getCategorySubCategory(categoryName) {
  const origin = getRequestOrigin();
  const slug = categoryName.toLowerCase();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/products`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify({
        category: categoryName.split("-").join(" ").toUpperCase(),
      }),
      next: {
        tags: ["categories", `category-${slug}`],
        revalidate: 604800,
      },
    }
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

async function getProductCategorySEO(categoryName) {
  const origin = getRequestOrigin();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/productCategorySEO`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify({
        category: categoryName.split("-").join(" ").toUpperCase(),
      }),
      next: { tags: ["categorySEO"], revalidate: 604800 },
    }
  );
  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("SEO API Error:", errorMessage);
    throw new Error(`SEO API Error: ${errorMessage}`);
  }
  return response.json();
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { category, locale } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const canonicalUrl = `${baseUrl}/${locale}/product-category/${category}`;

  try {
    const data = await getProductCategorySEO(category);
    const meta = JSON.parse(data.meta_value)[0] || {};

    const seoTitle =
      locale === "ar" && meta.seo_title_ar
        ? meta.seo_title_ar
        : meta.seo_title;

    const seoDescription =
      locale === "ar" && meta.seo_description_ar
        ? meta.seo_description_ar
        : meta.seo_description;

    const categoryLabel = category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      metadataBase: new URL(baseUrl),
      title: seoTitle
        ? `${seoTitle} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes`
        : `${categoryLabel} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes`,
      description: seoDescription
        ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim()
        : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
      robots: { index: true, follow: true },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          en: `/en/product-category/${category}`,
          ar: `/ar/product-category/${category}`,
          "x-default": `/en/product-category/${category}`,
        },
      },
      openGraph: {
        type: "website",
        url: canonicalUrl,
        siteName: "Ahmed Al Maghribi Perfumes",
        title: seoTitle || `${categoryLabel} — Ahmed Al Maghribi Perfumes`,
        description: seoDescription
          ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim()
          : "Luxury Arabic perfumes, oud, dakhoon & gift sets.",
        images: meta.seo_image
          ? [
              {
                url: `${process.env.NEXT_PUBLIC_API_URL}storage/${meta.seo_image}`,
                width: 1200,
                height: 630,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
      description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
    };
  }
}

// ─── Arabic labels lookup ────────────────────────────────────────────────────

const arabicLabels = {
  perfumes: "العطور",
  "gift-sets": "مجموعات الهدايا",
  dakhoon: "الدخون",
  gel: "الجيل",
  "hair-mist": "عطر الشعر",
  "concentrated-parfum": "العطر المركز",
  "online-exclusive": "حصري على الإنترنت",
};

// ─── Async content component (suspendable) ───────────────────────────────────

/**
 * CategoryContent — async RSC that fetches products for a given category.
 * Wrapped in <Suspense> so Header14 renders IMMEDIATELY while API is in-flight.
 */
async function CategoryContent({ category, locale }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_DEFAULT_ORIGIN ||
    "https://ksa.ahmedalmaghribi.com";

  const categoryLabel = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const categoryLabelAr = arabicLabels[category] || categoryLabel;

  try {
    const data = await getCategorySubCategory(category);
    const activeDescription =
      locale === "ar" ? data.description_ar : data.description;

    const allProducts = data.products || [];
    const allSubCatProducts =
      data.productSubCategories?.flatMap((sc) => sc.products || []) || [];
    const itemsForSchema = allProducts.length ? allProducts : allSubCatProducts;

    const itemListSchema = itemsForSchema.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${categoryLabel} — Ahmed Al Maghribi Perfumes`,
          url: `${baseUrl}/${locale}/product-category/${category}`,
          numberOfItems: itemsForSchema.length,
          itemListElement: itemsForSchema.slice(0, 20).map((product, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: product.product_name,
            url: `${baseUrl}/${locale}/shop/${category}/${category}/${(
              product.product_name || ""
            )
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .trim()}`,
          })),
        }
      : null;

    return data ? (
      <>
        {itemListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
          />
        )}
        <PremiumProductGrid
          subCategories={data.productSubCategories || null}
          products={data.products || null}
          categoryLabel={categoryLabel}
          categoryLabelAr={categoryLabelAr}
        />
        <CollapsibleDescription description={activeDescription} locale={locale} />
      </>
    ) : null;
  } catch (error) {
    console.error(error);
    const label = category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#888" }}>
        <h1 style={{ fontSize: "1.2rem" }}>{label}</h1>
        <p>No products found. Please try again later.</p>
      </div>
    );
  }
}

// ─── Page shell (synchronous — renders instantly) ────────────────────────────

const ShopPage8 = ({ params }) => {
  const { category, locale } = params;

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
          <CategoryContent category={category} locale={locale} />
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

export default ShopPage8;
