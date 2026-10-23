import { getStaticPageSEO } from "./staticPageSeo";

const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
const DEFAULT_OG_IMAGE = `${DEFAULT_ORIGIN}/assets/images/about/ahmed-logo.png`;
const DEFAULT_FAVICON = "/assets/images/ahmed-favicon.png";

/**
 * Clean HTML tags from a text string.
 */
export function sanitizeText(text) {
  if (!text) return "";
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

/**
 * Construct standard Next.js metadata with proper OpenGraph, Twitter, and canonical alternates.
 */
export function buildPageMetadata({
  locale = "en",
  path = "",
  title,
  description,
  image,
  robots,
  type = "website",
  extraAlternates,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || DEFAULT_ORIGIN;
  const isAr = locale === "ar";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const canonicalUrl = cleanPath ? `${baseUrl}/${locale}/${cleanPath}` : `${baseUrl}/${locale}`;
  const cleanDesc = sanitizeText(description);
  const ogImageUrl = image || DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: cleanDesc,
    ...(robots ? { robots } : { robots: { index: true, follow: true, googleBot: { index: true, follow: true } } }),
    icons: {
      icon: DEFAULT_FAVICON,
      shortcut: DEFAULT_FAVICON,
      apple: DEFAULT_FAVICON,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: extraAlternates || {
        "ar-SA": cleanPath ? `${baseUrl}/ar/${cleanPath}` : `${baseUrl}/ar`,
        en: cleanPath ? `${baseUrl}/en/${cleanPath}` : `${baseUrl}/en`,
        "x-default": cleanPath ? `${baseUrl}/ar/${cleanPath}` : `${baseUrl}/ar`,
      },
    },
    openGraph: {
      type,
      locale: isAr ? "ar_SA" : "en_US",
      url: canonicalUrl,
      siteName: "Ahmed Al Maghribi Perfumes",
      title,
      description: cleanDesc,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title || "Ahmed Al Maghribi Perfumes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDesc,
      images: [ogImageUrl],
    },
  };
}

/**
 * Fetch static page SEO from backend and construct complete metadata.
 */
export async function buildStaticPageMetadata({
  pageKey,
  locale = "en",
  path,
  defaultTitle,
  defaultDesc,
  defaultImage,
}) {
  const isAr = locale === "ar";
  const seoData = await getStaticPageSEO(pageKey);
  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || DEFAULT_ORIGIN;

  const resolvedTitle = isAr && seoData?.seo_title_ar ? seoData.seo_title_ar : (seoData?.seo_title || defaultTitle);
  const resolvedDesc = isAr && seoData?.seo_description_ar ? seoData.seo_description_ar : (seoData?.seo_description || defaultDesc);
  const ogImage = seoData?.seo_image || defaultImage || DEFAULT_OG_IMAGE;

  return buildPageMetadata({
    locale,
    path: path !== undefined ? path : pageKey,
    title: resolvedTitle,
    description: resolvedDesc,
    image: ogImage,
    robots: seoData?.index === "noindex"
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  });
}
