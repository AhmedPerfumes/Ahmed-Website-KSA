import FooterWithoutTrans from "@/components/footers/FooterWithoutTrans";

import HeaderWithoutTrans from "@/components/headers/HeaderWithoutTrans";
import RelatedSliderWithoutTrans from "@/components/singleProduct/RelatedSliderWithoutTrans";
import SingleProductWithoutTrans from "@/components/singleProduct/SingleProductWithoutTrans";
import React from "react";
import { allProducts } from "@/data/products";
import MobileFooterWithoutTrans2 from "@/components/footers/MobileFooterWithoutTrans2";
import { headers } from 'next/headers';

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: "https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png",
  },
};

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
      tags: ["products"],
      revalidate: 604800 // 7 days
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
const ProductDetailsPage16 = async({ params }) => {
  const [ categoryName, subCategoryName, product ] = params.product;
  // console.log(categoryName, subCategoryName, product);
  try {
    const data = await getproduct(categoryName, subCategoryName, product);
    // console.log(data);
    return (
      <>
        <HeaderWithoutTrans />
        <main className="page-wrapper">
          <div className="mb-md-1 pb-md-3"></div>
          <SingleProductWithoutTrans category={ categoryName } subcategory={ subCategoryName } product={ data } />
          <RelatedSliderWithoutTrans relatedProds={ data.related_prods }/>
        </main>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
          <FooterWithoutTrans />
          
        </section>
        <section className="d-sm-block d-md-none bg-dark pt-5  ">
        <div className="MobileFooter">
        

        <MobileFooterWithoutTrans2/>
        </div>
      </section>
      </>
    );
  } catch (error) {
    console.error(error);
      return <>
                <HeaderWithoutTrans />
                <main className="page-wrapper text-center">
                  <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Product Found</h2>
                  {/* <RelatedSlider relatedProds={ null }/> */}
                  <a href='/' className="btn btn-primary w-50 text-uppercase mb-3 mx-auto">Continue Shopping</a>
                </main>
                <section className="d-none d-lg-block" style={{ height: "100%" }}>
                  <FooterWithoutTrans />
                </section>
                <section className="d-sm-block d-md-none bg-dark pt-5  ">
                  <div className="MobileFooter">
                    <MobileFooterWithoutTrans2/>
                  </div>
                </section>
              </>;
  }
}

export default ProductDetailsPage16;
