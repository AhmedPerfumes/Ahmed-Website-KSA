import Footer14 from "@/components/footers/Footer14";
import PremiumCategoryHero from "@/components/shoplist/premium/PremiumCategoryHero";
import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import QuickView from "@/components/modals/QuickView";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import { headers } from "next/headers";

function getRequestOrigin() {
  const defaultOrigin = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  try {
    const headersList = headers();
    const host = headersList.get("host") || "";
    if (!host || host.includes("localhost") || host.includes("127.0.0.1")) {
      return defaultOrigin;
    }
    const protocol = headersList.get("x-forwarded-proto") || "https";
    return `${protocol}://${host}`;
  } catch {
    return defaultOrigin;
  }
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
  const resolvedParams = await params;
  const { category, subcategory } = resolvedParams || {};
  const locale = resolvedParams?.locale || "en";

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  const canonicalUrl = `${baseUrl}/${locale}/product-category/${category}/${subcategory}`;

  try {
    const data = await getProductCategorySEO(category, subcategory);
    const meta = typeof data?.meta_value === "string" ? (JSON.parse(data.meta_value)[0] || {}) : (Array.isArray(data?.meta_value) ? (data.meta_value[0] || {}) : (data?.meta_value || {}));

    const seoTitle =
      locale === "ar" && meta.seo_title_ar
        ? meta.seo_title_ar
        : meta.seo_title;

    const seoDescription =
      locale === "ar" && meta.seo_description_ar
        ? meta.seo_description_ar
        : meta.seo_description;

    const fullTitle = seoTitle
      ? `${seoTitle} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes`
      : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes";
    const cleanDesc = seoDescription
      ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim()
      : "Luxury Arabic perfumes, oud, dakhoon & gift sets.";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ksaadmin.ahmedalmaghribi.com/";
    const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
    const ogImage = meta.seo_image
      ? `${normalizedApiUrl}storage/${meta.seo_image}`
      : `${baseUrl}/assets/images/about/ahmed-logo.png`;

    return {
      metadataBase: new URL(baseUrl),
      title: fullTitle,
      description: cleanDesc,
      robots: { index: true, follow: true },
      icons: {
        icon: "/assets/images/ahmed-favicon.png",
        shortcut: "/assets/images/ahmed-favicon.png",
        apple: "/assets/images/ahmed-favicon.png",
      },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "ar-SA": `${baseUrl}/ar/product-category/${category}/${subcategory}`,
          en: `${baseUrl}/en/product-category/${category}/${subcategory}`,
          "x-default": `${baseUrl}/ar/product-category/${category}/${subcategory}`,
        },
      },
      openGraph: {
        type: "website",
        locale: locale === "ar" ? "ar_SA" : "en_US",
        url: canonicalUrl,
        siteName: "Ahmed Al Maghribi Perfumes",
        title: fullTitle,
        description: cleanDesc,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: fullTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description: cleanDesc,
        images: [ogImage],
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

    // Arabic labels for heading and breadcrumb
    const arabicCategoryLabels = {
      perfumes: "العطور",
      "gift-sets": "مجموعات الهدايا",
      dakhoon: "الدخون",
      gel: "الجيل",
      "hair-mist": "عطر الشعر",
      "concentrated-parfum": "العطر المركز",
      "online-exclusive": "حصري على الإنترنت",
    };
    const categoryLabelAr = arabicCategoryLabels[category] || categoryLabel;
    // Use Arabic sub-category name from API if available, else fall back to slug
    const subcategoryLabelAr = data.name_ar || subcategoryLabel;

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

          {/* Product grid */}
          <PremiumProductGrid
            products={data.products || null}
            categoryLabel={subcategoryLabel}
            categoryLabelAr={subcategoryLabelAr}
            breadcrumbItems={[
              {
                label: "Shop",
                labelAr: "المتجر",
                href: `/${locale}/shop`,
              },
              {
                label: categoryLabel,
                labelAr: categoryLabelAr,
                href: `/${locale}/product-category/${category}`,
              },
              {
                label: subcategoryLabel,
                labelAr: subcategoryLabelAr,
              },
            ]}
          />

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
