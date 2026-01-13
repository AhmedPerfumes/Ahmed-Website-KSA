import Blog3 from "@/components/blogs/Blog3";
import BlogDetails from "@/components/blogs/BlogDetails";
import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import { allBlogs } from "@/data/blogs";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";

// export const metadata = {
//   title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
//   description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
//   icons: {
//       icon: "/assets/images/ahmed-favicon.png",
//   },
// };

async function getBlog(blogName) {
  // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails?blog=${blogName.split("-").join(" ").toUpperCase()}`);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // blog: blogName.split("-").join(" ").toUpperCase(),
      blog: blogName,
    }),
    next: {
      tags: ["blogs"],
      revalidate: 604800 // 7 days
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
async function getBlogSEO(blogName) {
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
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/blogSEO`,
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blog: blogName.split("-").join(" ").toUpperCase(),
          }),
          next: {
            tags: ["blogSEO"],
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
  const { blogName } = params;

  try {
      const data = await getBlogSEO(blogName);
      // console.log(JSON.parse(data.meta_value)[0]);
      return {
          title: JSON.parse(data.meta_value)[0]?.seo_title ? `${JSON.parse(data.meta_value)[0]?.seo_title}` : "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
          description: JSON.parse(data.meta_value)[0]?.seo_description ? JSON.parse(data.meta_value)[0]?.seo_description?.replace(/<\/?[^>]+(>|$)/g, "").trim() : "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes."
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


const BlogDetailsPage = async({ params }) => {
  const { blogName } = params;
  // console.log(blogName);
  try {
    const data = await getBlog(blogName);
    // console.log(data);
    return (
      <>
        <Header14 />
        <main className="page-wrapper">
          <div className="mb-4 pb-4"></div>
          <BlogDetails blog={data} />
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
    return <p>Failed to load data.</p>;
  }
}

export default BlogDetailsPage;
