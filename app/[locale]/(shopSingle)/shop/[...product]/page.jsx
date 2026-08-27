import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct11 from "@/components/singleProduct/SingleProduct11";
import React from "react";
// import { allProducts } from "@/data/products";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Head from "next/head";
import { headers } from 'next/headers';
import CollapsibleDescription from "@/components/shoplist/CollapsibleDescription";

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

async function getproduct(categoryName, subCategoryName, product) {
  console.log(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: categoryName.split("-").join(" ").toUpperCase(),
      subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
      product: product.split("-").join(" ").toUpperCase(),
    })
  });
  const origin = getRequestOrigin();
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
    throw new Error('Network response was not ok');
  }
  return response.json();
}
async function getProductSEO(categoryName, subCategoryName, product) {
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
    const errorMessage = await response.text(); // Get the error message from the server
    console.error("SEO API Error:", errorMessage);
    throw new Error(`SEO API Error: ${errorMessage}`);
  }
  return response.json();
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
  const { locale } = params;
  const [categoryName, subCategoryName, product] = params.product;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;

  const canonicalUrl = `${baseUrl}/${locale}/shop/${categoryName}/${subCategoryName}/${product}`;

  try {
    const data = await getProductSEO(categoryName, subCategoryName, product);
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
      title: seoTitle ? `${seoTitle}` : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
      description: seoDescription ? seoDescription.replace(/<\/?[^>]+(>|$)/g, "").trim() : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
      alternates: {
        canonical: canonicalUrl,
        languages: {
          en: `/en/shop/${categoryName}/${subCategoryName}/${product}`,
          ar: `/ar/shop/${categoryName}/${subCategoryName}/${product}`,
          "x-default": `/en/shop/${categoryName}/${subCategoryName}/${product}`,
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

const ProductDetailsPage16 = async({ params }) => {
  const { locale } = params;
  const [ categoryName, subCategoryName, product ] = params.product;
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
        <Header14 />
        <ProductSchema
          category={categoryName}
          subcategory={subCategoryName}
          product={data}
        />
        <main className="page-wrapper">
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
      <Header14 />
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
          <MobileFooter2 />
        </div>
      </section>
    </>;
  }
}

export default ProductDetailsPage16;
