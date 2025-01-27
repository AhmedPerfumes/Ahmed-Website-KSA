import FooterWithoutTrans from "@/components/footers/FooterWithoutTrans";

import HeaderWithoutTrans from "@/components/headers/HeaderWithoutTrans";
import RelatedSliderWithoutTrans from "@/components/singleProduct/RelatedSliderWithoutTrans";
import SingleProductWithoutTrans from "@/components/singleProduct/SingleProductWithoutTrans";
import React from "react";
import { allProducts } from "@/data/products";
import MobileFooterWithoutTrans2 from "@/components/footers/MobileFooterWithoutTrans2";

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
const ProductDetailsPage16 = async({ params }) => {
  const [ categoryName, subCategoryName, product ] = params.product;
  console.log(categoryName, subCategoryName, product);
  try {
    const data = await getproduct(categoryName, subCategoryName, product);
    console.log(data);
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
    return <p>Failed to load user data.</p>;
  }
}

export default ProductDetailsPage16;
