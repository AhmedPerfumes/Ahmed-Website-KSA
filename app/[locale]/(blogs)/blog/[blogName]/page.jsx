import Blog3 from "@/components/blogs/Blog3";
import BlogDetails from "@/components/blogs/BlogDetails";
import Footer14 from "@/components/footers/Footer14";

import { allBlogs } from "@/data/blogs";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import { headers } from 'next/headers';

// export const metadata = {
//   title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
//   description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
//   icons: {
//       icon: "/assets/images/ahmed-favicon.png",
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

async function getBlog(blogName) {
  // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails?blog=${blogName.split("-").join(" ").toUpperCase()}`);
  const origin = getRequestOrigin();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/getBlogDetails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': origin,
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
  const origin = getRequestOrigin();
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/blogSEO`,
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              'origin': origin,
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
  const resolvedParams = await params;
  const { blogName } = resolvedParams || {};
  const locale = resolvedParams?.locale || "en";

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

  const canonicalUrl = `${baseUrl}/${locale}/blog/${blogName}`;

  try {
      const data = await getBlogSEO(blogName);
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
              "ar-SA": `${baseUrl}/ar/blog/${blogName}`,
              en: `${baseUrl}/en/blog/${blogName}`,
              "x-default": `${baseUrl}/ar/blog/${blogName}`,
            },
          },
          openGraph: {
            type: "article",
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


const BlogDetailsPage = async({ params }) => {
  const { blogName } = params;
  // console.log(blogName);
  try {
    const data = await getBlog(blogName);
    // console.log(data);
    return (
      <>
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
