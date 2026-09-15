import Blog1 from "@/components/blogs/Blog1";

import Footer14 from "@/components/footers/Footer14";

import Header14 from "@/components/headers/Header14";
import React from "react";

import MobileFooter2 from "@/components/footers/MobileFooter2";

// export const metadata = {
//   title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
//   description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
//   icons: {
//       icon: "/assets/images/ahmed-favicon.png",
//   },
// };

export async function generateMetadata({ params }) {
  const { locale } = params;

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

  const canonicalUrl = `${baseUrl}/${locale}/blog`;

  return {
    metadataBase: new URL(baseUrl),

    title: "Blogs | Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",

    description:
      "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",

    icons: {
      icon: "/assets/images/ahmed-favicon.png",
    },

    alternates: {
      canonical: canonicalUrl,

      languages: {
        en: `${baseUrl}/en/blog`,
        ar: `${baseUrl}/ar/blog`,
        "x-default": `${baseUrl}/en/blog`,
      },
    },
  };
}

export default function BlogPage1() {
  return (
    <>
      <Header14 />
      <main className="page-wrapper">
        <Blog1 />
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
}
