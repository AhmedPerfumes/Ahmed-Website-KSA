import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct11 from "@/components/singleProduct/SingleProduct11";
import React from "react";
// import { allProducts } from "@/data/products";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import Head from "next/head";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: "https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png",
  },
};

async function getproduct(categoryName, subCategoryName, product) {
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: categoryName.split("-").join(" ").toUpperCase(),
      subCategory: subCategoryName.split("-").join(" ").toUpperCase(),
      product: product.split("-").join(" ").toUpperCase(),
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

// JSON-LD Schema for SEO
const ProductSchema = ({ category, subcategory, product }) => {
  let images = [
      `${process.env.NEXT_PUBLIC_API_URL}storage/${
          JSON.parse(product.images)[0]
      }`,
  ];
  JSON.parse(product.images)[1] &&
      images.push(
          `${process.env.NEXT_PUBLIC_API_URL}storage/${
              JSON.parse(product.images)[1]
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
          priceCurrency: "AED",
          price: product.price,
          url: `https://ae.ahmedalmaghribi.com/en/shop/${category}/${subcategory}/${product.product_name
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

const ProductDetailsPage16 = async({ params }) => {
  const [ categoryName, subCategoryName, product ] = params.product;
  // console.log(categoryName, subCategoryName, product);
  try {
    const data = await getproduct(categoryName, subCategoryName, product);
    console.log(data);
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
              content={`${process.env.NEXT_PUBLIC_API_URL}storage/${
                  JSON.parse(data.images)[0]
              }`}
          />
          <meta
              property="og:url"
              content={`https://ae.ahmedalmaghribi.com/en/shop/${categoryName}/${subCategoryName}/${data.product_name
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
          <meta property="product:price:currency" content="AED" />
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
        </main>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
          <Footer14 />
          
        </section>
        <section className="d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
        

        <MobileFooter2/>
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
                <MobileFooter2/>
              </div>
            </section>
          </>;
  }
}

export default ProductDetailsPage16;
