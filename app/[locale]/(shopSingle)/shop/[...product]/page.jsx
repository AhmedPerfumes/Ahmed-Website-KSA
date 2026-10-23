import Footer14 from "@/components/footers/Footer14";

import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct11 from "@/components/singleProduct/SingleProduct11";
import React from "react";
// import { allProducts } from "@/data/products";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Head from "next/head";
import { headers } from 'next/headers';
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";
import { sanitizeText } from "@/utlis/seoHelper";

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

async function getproduct(categoryName, subCategoryName, product) {
  const origin = getRequestOrigin();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': origin,
      },
      body: JSON.stringify({
        category: categoryName.split("-").join(" ").toUpperCase(),
        subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
        product: product.split("-").join(" ").toUpperCase(),
      }),
      next: {
        tags: ["products", `product-${product}`],
        revalidate: 604800 // 7 days
      },
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (e) {
    console.error("getproduct error:", e);
    return null;
  }
}

async function getProductSEO(categoryName, subCategoryName, product) {
  const origin = getRequestOrigin();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/productSEO`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'origin': origin,
        },
        body: JSON.stringify({
          category: categoryName.split("-").join(" ").toUpperCase(),
          subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
          product: product.split("-").join(" ").toUpperCase(),
        }),
        next: {
          tags: ["productSEO"],
          revalidate: 604800 // 7 days
        },
      }
    );

    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (e) {
    console.error("getProductSEO error:", e);
    return null;
  }
}

// JSON-LD Schema for SEO
const ProductSchema = ({ category, subcategory, product }) => {
  let images = [
    `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]
    }`,
  ];
  JSON.parse(product.images)[1] &&
    images.push(
      `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[1]
      }`
    );
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.product_name,
    image: images,
    description: product.description.replace(/<\/?[^>]+(>|$)/g, "").trim(),
    sku: product.sku,
    brand: { "@type": "Brand", name: "Ahmed Al Maghribi Perfumes" },
    offers: {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: product.price,
      url: `https://ksa.ahmedalmaghribi.com/en/shop/${category}/${subcategory}/${product.product_name
        .split(" ")
        .join("-")
        .toLowerCase()}`,
      availability:
        product.product_qty <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };
  // console.log(jsonLd);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const [categoryName, subCategoryName, product] = resolvedParams?.product || [];
  const isAr = locale === "ar";

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  const canonicalPath = `shop/${categoryName}/${subCategoryName}/${product}`;
  const canonicalUrl = `${baseUrl}/${locale}/${canonicalPath}`;

  try {
    const [seoResult, prodResult] = await Promise.allSettled([
      getProductSEO(categoryName, subCategoryName, product),
      getproduct(categoryName, subCategoryName, product),
    ]);

    const data = seoResult.status === "fulfilled" ? seoResult.value : null;
    const prodData = prodResult.status === "fulfilled" ? prodResult.value : null;

    let meta = {};
    if (data?.meta_value) {
      if (typeof data.meta_value === "string") {
        try {
          const parsed = JSON.parse(data.meta_value);
          meta = Array.isArray(parsed) ? (parsed[0] || {}) : (parsed || {});
        } catch {
          meta = {};
        }
      } else if (Array.isArray(data.meta_value)) {
        meta = data.meta_value[0] || {};
      } else {
        meta = data.meta_value || {};
      }
    }

    // Resolve product name (from product data or URL slug)
    const rawProdSlug = product ? product.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";
    const prodNameAr = prodData?.product_name_ar?.trim();
    const prodNameEn = prodData?.product_name?.trim() || rawProdSlug;
    const prodName = isAr ? (prodNameAr || prodNameEn) : prodNameEn;

    // Title resolution
    const seoTitle = isAr && meta.seo_title_ar ? meta.seo_title_ar : meta.seo_title;
    const defaultTitle = isAr
      ? (prodName ? `${prodName} | عطور أحمد المغربي` : "أفضل العطور الفاخرة | أحمد المغربي للعطور")
      : (prodName ? `${prodName} | Ahmed Al Maghribi Perfumes` : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes");
    const title = seoTitle || defaultTitle;

    // Description resolution
    const seoDescription = isAr && meta.seo_description_ar ? meta.seo_description_ar : meta.seo_description;
    const prodDesc = prodData?.description ? sanitizeText(prodData.description) : "";
    const defaultDesc = isAr
      ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي. عطور عربية أصيلة، بخور، دخون، ومجموعات هدايا فاخرة."
      : "Discover luxury Arabic perfumes, oud, dakhoon & gift sets from Ahmed Al Maghribi — Saudi Arabia's premier fragrance house.";
    const cleanDescription = seoDescription
      ? sanitizeText(seoDescription)
      : (prodDesc || defaultDesc);

    // Image resolution:
    // 1. Dedicated meta.seo_image from CMS
    // 2. First product bottle photo from prodData.images
    // 3. Brand default fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://adminksa.ahmedalmaghribi.com/";
    const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;

    let ogImage = `${baseUrl}/assets/images/about/ahmed-logo.png`;
    if (meta.seo_image) {
      ogImage = `${normalizedApiUrl}storage/${meta.seo_image}`;
    } else if (prodData?.images) {
      try {
        const parsedImgs = typeof prodData.images === "string" ? JSON.parse(prodData.images) : prodData.images;
        if (Array.isArray(parsedImgs) && parsedImgs[0]) {
          ogImage = `${normalizedApiUrl}storage/${parsedImgs[0]}`;
        }
      } catch {}
    }

    return {
      metadataBase: new URL(baseUrl),
      title: title,
      description: cleanDescription,
      icons: {
        icon: "/assets/images/ahmed-favicon.png",
        shortcut: "/assets/images/ahmed-favicon.png",
        apple: "/assets/images/ahmed-favicon.png",
      },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "ar-SA": `${baseUrl}/ar/${canonicalPath}`,
          en: `${baseUrl}/en/${canonicalPath}`,
          "x-default": `${baseUrl}/ar/${canonicalPath}`,
        },
      },
      openGraph: {
        type: "website",
        locale: isAr ? "ar_SA" : "en_US",
        url: canonicalUrl,
        siteName: "Ahmed Al Maghribi Perfumes",
        title: title,
        description: cleanDescription,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: cleanDescription,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    const fallbackTitle = isAr
      ? "عطور أحمد المغربي | الموقع الرسمي في السعودية"
      : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes";
    const fallbackDesc = isAr
      ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي. عطور عربية أصيلة، بخور، دخون، ومجموعات هدايا فاخرة."
      : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.";
    return {
      metadataBase: new URL(baseUrl),
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "ar-SA": `${baseUrl}/ar/${canonicalPath}`,
          en: `${baseUrl}/en/${canonicalPath}`,
          "x-default": `${baseUrl}/ar/${canonicalPath}`,
        },
      },
      openGraph: {
        type: "website",
        locale: isAr ? "ar_SA" : "en_US",
        url: canonicalUrl,
        siteName: "Ahmed Al Maghribi Perfumes",
        title: fallbackTitle,
        description: fallbackDesc,
        images: [
          {
            url: `${baseUrl}/assets/images/about/ahmed-logo.png`,
            width: 1200,
            height: 630,
            alt: fallbackTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDesc,
        images: [`${baseUrl}/assets/images/about/ahmed-logo.png`],
      },
    };
  }
}

const ProductDetailsPage16 = async ({ params }) => {
  const {locale} = params;
  const [categoryName, subCategoryName, product] = params.product;
  // console.log(categoryName, subCategoryName, product);
  try {
    const data = await getproduct(categoryName, subCategoryName, product);
    const activeDescription = locale === 'ar' ? (data.seo_content_ar || data.seo_content) : data.seo_content;
    const title = locale === 'ar' ? "عن هذا المنتج" : "About this Product";
    // console.log(data);
    return (
      <>
        <Head>
          {/* Manually Adding Open Graph Product Tags */}
          <meta property="og:title" content={data.product_name} />
          <meta
            property="og:description"
            content={data.description
              .replace(/<\/?[^>]+(>|$)/g, "")
              .trim()}
          />
          <meta
            property="og:image"
            content={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(data.images)[0]
              }`}
          />
          <meta
            property="og:url"
            content={`https://ksa.ahmedalmaghribi.com/en/shop/${categoryName}/${subCategoryName}/${data.product_name
              .split(" ")
              .join("-")
              .toLowerCase()}`}
          />
          <meta property="og:type" content="product" />{" "}
          {/* Manual Fix */}
          <meta
            property="product:price:amount"
            content={data.price}
          />
          <meta property="product:price:currency" content="SAR" />
          <meta
            property="product:brand"
            content="Ahmed Al Maghribi Perfumes"
          />
        </Head>
        <ProductSchema
                    category={categoryName}
                    subcategory={subCategoryName}
                    product={data}
                />
        <main>
          <div className="mb-md-1 pb-md-3"></div>
          <SingleProduct11 category={ categoryName } subcategory={ subCategoryName } product={ data } />
          <RelatedSlider relatedProds={ data.related_prods }/>
          <CollapsibleDescription description={activeDescription} title={title} />
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
  } catch (error) {
    console.error(error);
    return <>
            <main className="page-wrapper text-center">
              <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Product Found</h2>
              {/* <RelatedSlider relatedProds={ null }/> */}
              <a href='/' className="btn btn-primary w-50 text-uppercase mb-3 mx-auto">Continue Shopping</a>
            </main>
            <section className="d-none d-lg-block" style={{ height: "100%" }}>
              <Footer14 />
            </section>
            <section className="d-sm-block d-md-none bg-dark pt-5  ">
              <div className="MobileFooter">
                <MobileFooter2/>
              </div>
            </section>
          </>;
  }
}

export default ProductDetailsPage16;
