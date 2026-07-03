import Footer14 from "@/components/footers/Footer14";
import PremiumCategoryHero from "@/components/shoplist/premium/PremiumCategoryHero";
import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import QuickView from "@/components/modals/QuickView";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import { headers } from "next/headers";

function getRequestOrigin() {
  const headersList = headers();
  const host =
    headersList.get("host") || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const protocol = headersList.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

async function getCategorySubCategory(categoryName, subCategoryName) {
  const origin = getRequestOrigin();
  const catSlug = categoryName.toLowerCase();
  const subSlug = subCategoryName.toLowerCase();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: origin,
      },
      body: JSON.stringify({
        category: categoryName.split("-").join(" ").toUpperCase(),
        subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
      }),
      next: {
        tags: [
          "subCategories",
          `category-${catSlug}`,
          `subcategory-${subSlug}`,
        ],
        revalidate: 604800, // 7 days
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function getProductCategorySEO(categoryName, subCategoryName) {
  const origin = getRequestOrigin();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/productCategorySEO`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: origin,
      },
      body: JSON.stringify({
        category: categoryName.split("-").join(" ").toUpperCase(),
        subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
      }),
      next: {
        tags: ["subcategorySEO"],
        revalidate: 604800, // 7 days
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("SEO API Error:", errorMessage);
    throw new Error(`SEO API Error: ${errorMessage}`);
  }
  return response.json();
}

export async function generateMetadata({ params }) {
  const { category, subcategory, locale } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
  const canonicalUrl = `${baseUrl}/${locale}/product-category/${category}/${subcategory}`;

  try {
    const data = await getProductCategorySEO(category, subcategory);
    const meta = JSON.parse(data.meta_value)[0] || {};

    const seoTitle =
      locale === "ar" && meta.seo_title_ar
        ? meta.seo_title_ar
        : meta.seo_title;

    const seoDescription =
      locale === "ar" && meta.seo_description_ar
        ? meta.seo_description_ar
        : meta.seo_description;

    return {
      metadataBase: new URL(baseUrl),
      title: seoTitle
        ? `${seoTitle} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes`
        : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
      description: seoDescription
        ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim()
        : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
      robots: { index: true, follow: true },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          en: `/en/product-category/${category}/${subcategory}`,
          ar: `/ar/product-category/${category}/${subcategory}`,
          "x-default": `/en/product-category/${category}/${subcategory}`,
        },
      },
      openGraph: {
        type: "website",
        url: canonicalUrl,
        siteName: "Ahmed Al Maghribi Perfumes",
        title: seoTitle || "Ahmed Al Maghribi Perfumes",
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

const ShopPage8 = async ({ params }) => {
  const { category, subcategory, locale } = params;

  try {
    const data = await getCategorySubCategory(category, subcategory);
    const activeDescription =
      locale === "ar" ? data.description_ar : data.description;

    const categoryLabel = category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const subcategoryLabel = subcategory
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // JSON-LD: ItemList schema
    const baseUrl =
      process.env.NEXT_PUBLIC_DEFAULT_ORIGIN ||
      "https://ksa.ahmedalmaghribi.com";

    const itemsForSchema = data.products || [];

    const itemListSchema = itemsForSchema.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${subcategoryLabel} — Ahmed Al Maghribi Perfumes`,
          url: `${baseUrl}/${locale}/product-category/${category}/${subcategory}`,
          numberOfItems: itemsForSchema.length,
          itemListElement: itemsForSchema.slice(0, 20).map((product, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: product.product_name,
            url: `${baseUrl}/${locale}/shop/${category}/${subcategory}/${(product.product_name || "")
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .trim()}`,
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

        <QuickView />

        <main>
          {/* Premium hero — replaces Banner5 */}
          <PremiumCategoryHero
            categorySlug={category}
            categoryLabel={categoryLabel}
            subcategorySlug={subcategory}
            subcategoryLabel={subcategoryLabel}
            desktopImage={data.image || null}
            mobileImage={data.mobile_image || null}
            locale={locale}
          />

          {/* Product grid — replaces Categories + Shop10 */}
          <PremiumProductGrid products={data.products || null} />

          <CollapsibleDescription
            description={activeDescription}
            locale={locale}
          />
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
    const categoryLabel = category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return (
      <>
        <main className="page-wrapper">
          <h1
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
              fontSize: "1.2rem",
            }}
          >
            {categoryLabel}
          </h1>
          <p style={{ textAlign: "center", color: "#888" }}>
            No subcategory found. Please try again later.
          </p>
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

export default ShopPage8;
