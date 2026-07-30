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
  const headersList = headers();
  const host = headersList.get('host') || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN; // e.g., 'localhost:3000' or 'yourdomain.com'
  const protocol = headersList.get('x-forwarded-proto') || 'https'; // or 'https'
  
  // if (!host) {
  //   // Fallback for local development or edge cases
  //   return process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || 'http://localhost:3000';
  // }

  return `${protocol}://${host}`;
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
    const { category, locale } = params;

    const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;

    const canonicalUrl = `${baseUrl}/${locale}/product-category/${category}`;

    try {
        const data = await getProductCategorySEO(category);
        // console.log(JSON.parse(data.meta_value)[0]);
        const meta = JSON.parse(data.meta_value)[0] || {};

        // Select Arabic SEO fields only if locale is ar and values exist
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
            title: seoTitle ? `${seoTitle} | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes` : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
            description: seoDescription ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim() : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
            alternates: {
                canonical: canonicalUrl,
                languages: {
                  en: `/en/product-category/${category}`,
                  ar: `/ar/product-category/${category}`,
                  "x-default": `/en/product-category/${category}`,
                },
            },
            // openGraph: {
            //     // title: data.product_name,
            //     // description: data.description.replace(/<\/?[^>]+(>|$)/g, "").trim(),
            //     // url: `https://ae.ahmedalmaghribi.com/en/shop/${categoryName}/${subCategoryName}/${data.product_name
            //     //     .split(" ")
            //     //     .join("-")
            //     //     .toLowerCase()}`,
            //     images: `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(data.meta_value)[0]?.seo_image}`,
            //     // type: "product.item",
            // }
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
