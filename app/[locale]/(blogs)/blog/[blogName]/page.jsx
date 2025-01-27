import Blog3 from "@/components/blogs/Blog3";
import BlogDetails from "@/components/blogs/BlogDetails";
import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import { allBlogs } from "@/data/blogs";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
  },
};

async function getBlog(blogName) {
  // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails?blog=${blogName.split("-").join(" ").toUpperCase()}`);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blog: blogName.split("-").join(" ").toUpperCase(),
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
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
