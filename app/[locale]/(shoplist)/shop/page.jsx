import Footer14 from "@/components/footers/Footer14";
import PremiumShopGrid from "@/components/shoplist/premium/PremiumShopGrid";
import QuickView from "@/components/modals/QuickView";
import React from "react";
import MobileFooter2 from "@/components/footers/MobileFooter2";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params, searchParams }) {
  const locale   = params?.locale || "en";
  const search   = searchParams?.q || "";
  const isAr     = locale === "ar";

  const canonicalUrl = `${baseUrl}/${locale}/shop${search ? `?q=${encodeURIComponent(search)}` : ""}`;

  const title = isAr
    ? search
      ? `نتائج البحث: ${search} | أحمد المغربي للعطور`
      : "جميع العطور والمنتجات | أحمد المغربي للعطور"
    : search
      ? `Search results: ${search} | Ahmed Al Maghribi Perfumes`
      : "Shop All Perfumes & Fragrances | Ahmed Al Maghribi Perfumes";

  const description = isAr
    ? "تسوّق جميع منتجات أحمد المغربي: عطور فاخرة، بخور، دخون، جيل، ومجموعات هدايا. شحن سريع داخل المملكة العربية السعودية."
    : "Shop the full range of Ahmed Al Maghribi fragrances — luxury perfumes, oud, dakhoon, hair mist, gel, and gift sets. Fast delivery across Saudi Arabia.";

  const ogImage = `${baseUrl}/assets/images/ahmed-og-image.jpg`;

  // JSON-LD: CollectionPage for the shop
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isAr ? "جميع منتجات أحمد المغربي" : "Ahmed Al Maghribi — All Products",
    description,
    url: canonicalUrl,
    inLanguage: isAr ? "ar-SA" : "en",
    publisher: {
      "@type": "Organization",
      name: "Ahmed Al Maghribi Perfumes",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/assets/images/ahmed-favicon.png`,
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${baseUrl}/${locale}/` },
        { "@type": "ListItem", position: 2, name: isAr ? "جميع المنتجات" : "Shop", item: canonicalUrl },
      ],
    },
  };

  return {
    metadataBase: new URL(baseUrl),

    title,
    description,

    keywords: isAr
      ? "عطور, عطر فاخر, بخور, دخون, هدايا, أحمد المغربي, عطور عربية, المملكة العربية السعودية"
      : "perfumes Saudi Arabia, buy perfumes KSA, Arabic perfumes, oud, dakhoon, gift sets, Ahmed Al Maghribi",

    robots: { index: !search, follow: true }, // noindex search result pages

    alternates: {
      canonical: canonicalUrl,
      languages: {
        en:          `/en/shop${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        ar:          `/ar/shop${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        "x-default": `/en/shop`,
      },
    },

    openGraph: {
      type:        "website",
      locale:      isAr ? "ar_SA" : "en_US",
      url:         canonicalUrl,
      siteName:    "Ahmed Al Maghribi Perfumes",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ahmed Al Maghribi — Luxury Fragrance House" }],
    },

    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
    },

    // Pass JSON-LD as extra field (rendered via script tag below)
    other: {
      "ld+json": JSON.stringify(jsonLd),
    },
  };
}

const ShopPage = async ({ params, searchParams }) => {
  const locale   = params?.locale || "en";
  const search   = searchParams?.q;
  const isAr     = locale === "ar";

  const canonicalUrl = `${baseUrl}/${locale}/shop`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isAr ? "جميع منتجات أحمد المغربي" : "Ahmed Al Maghribi — All Products",
    url: canonicalUrl,
    inLanguage: isAr ? "ar-SA" : "en",
    publisher: {
      "@type": "Organization",
      name: "Ahmed Al Maghribi Perfumes",
      url: baseUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home",  item: `${baseUrl}/${locale}/` },
        { "@type": "ListItem", position: 2, name: isAr ? "جميع المنتجات" : "Shop", item: canonicalUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <QuickView />
      <main>
        <PremiumShopGrid search={search} />
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
};

export default ShopPage;
