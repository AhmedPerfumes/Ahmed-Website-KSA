import Footer14 from "@/components/footers/Footer14";
import PremiumProductGrid from "@/components/shoplist/premium/PremiumProductGrid";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import QuickView from "@/components/modals/QuickView";
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import { headers } from 'next/headers';

// export const metadata = {
//   title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
//   description: "Buy Best Perfumes Online Ahmed Perfume",
//   icons: {
//     icon: "https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png",
//   },
// };

function getRequestOrigin() {
  const defaultOrigin = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  try {
    const headersList = headers();
    const host = headersList.get('host') || '';
    if (!host || host.includes('localhost') || host.includes('127.0.0.1')) {
      return defaultOrigin;
    }
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    return `${protocol}://${host}`;
  } catch {
    return defaultOrigin;
  }
}

async function getCategorySubCategory(categoryName) {
  // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/products`, { 
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     category: categoryName.split("-").join(" ").toUpperCase(),
  //   })
  // });
  const origin = getRequestOrigin();
  const slug = categoryName.toLowerCase();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': origin,
    },
    body: JSON.stringify({
      category: categoryName.split("-").join(" ").toUpperCase(),
    }),
    next: {
      tags: ["categories", `category-${slug}`],
      revalidate: 604800 // 7 days
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
async function getProductCategorySEO(categoryName) {
  // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     category: categoryName.split("-").join(" ").toUpperCase(),
  //     subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
  //     product: product.split("-").join(" ").toUpperCase(),
  //   })
  // });
  const origin = getRequestOrigin();
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/productCategorySEO`,
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              'origin': origin,
          },
          body: JSON.stringify({
              category: categoryName.split("-").join(" ").toUpperCase(),
              // subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
              // product: product.split("-").join(" ").toUpperCase(),
          }),
          next: {
            tags: ["categorySEO"],
            revalidate: 604800 // 7 days
          },
      }
  );
  
  if (!response.ok) {
      const errorMessage = await response.text(); // Get the error message from the server
      console.error("SEO API Error:", errorMessage);
      throw new Error(`SEO API Error: ${errorMessage}`);
  }
  return response.json();
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const category = resolvedParams?.category;
    const locale = resolvedParams?.locale || "en";

    const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

    const canonicalUrl = `${baseUrl}/${locale}/product-category/${category}`;

    try {
        const data = await getProductCategorySEO(category);
        const meta = typeof data?.meta_value === "string" ? (JSON.parse(data.meta_value)[0] || {}) : (Array.isArray(data?.meta_value) ? (data.meta_value[0] || {}) : (data?.meta_value || {}));

        // Select Arabic SEO fields only if locale is ar and values exist
        const seoTitle =
            locale === "ar" && meta.seo_title_ar
                ? meta.seo_title_ar
                : meta.seo_title;

        const seoDescription =
            locale === "ar" && meta.seo_description_ar
                ? meta.seo_description_ar
                : meta.seo_description;

        const fullTitle = seoTitle ? `${seoTitle} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes` : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes";
        const cleanDesc = seoDescription ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim() : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.";

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ksaadmin.ahmedalmaghribi.com/";
        const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
        const ogImage = meta.seo_image
            ? `${normalizedApiUrl}storage/${meta.seo_image}`
            : `${baseUrl}/assets/images/about/ahmed-logo.png`;

        return {
            metadataBase: new URL(baseUrl),
            title: fullTitle,
            description: cleanDesc,
            icons: {
                icon: "/assets/images/ahmed-favicon.png",
                shortcut: "/assets/images/ahmed-favicon.png",
                apple: "/assets/images/ahmed-favicon.png",
            },
            alternates: {
                canonical: canonicalUrl,
                languages: {
                  "ar-SA": `${baseUrl}/ar/product-category/${category}`,
                  en: `${baseUrl}/en/product-category/${category}`,
                  "x-default": `${baseUrl}/ar/product-category/${category}`,
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
            description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes."
        };
    }
}
const ShopPage8 = async ({ params }) => {
  const { category, locale } = params;

  const arabicLabels = {
    perfumes: "العطور",
    "gift-sets": "مجموعات الهدايا",
    dakhoon: "الدخون",
    gel: "الجيل",
    "hair-mist": "عطر الشعر",
    "concentrated-parfum": "العطر المركز",
    "online-exclusive": "حصري على الإنترنت",
  };

  const categoryLabel = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const categoryLabelAr = arabicLabels[category] || categoryLabel;

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
          <h1 style={{ textAlign: "center", padding: "4rem 1rem", fontSize: "1.2rem" }}>
            {categoryLabel}
          </h1>
          <p style={{ textAlign: "center", color: "#888" }}>
            No products found. Please try again later.
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
