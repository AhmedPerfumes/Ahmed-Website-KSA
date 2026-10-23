import HomePage8 from "./(homes)/home-8/page";
import { buildStaticPageMetadata } from "@/utlis/seoHelper";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  const isAr = locale === "ar";

  const defaultTitle = isAr
    ? "أفضل العطور الفاخرة | أحمد المغربي للعطور"
    : "Buy Luxury Perfumes Online in Saudi Arabia | Ahmed Al Maghribi";

  const defaultDesc = isAr
    ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي. عطور عربية أصيلة، بخور، دخون، ومجموعات هدايا فاخرة. شحن سريع في المملكة العربية السعودية."
    : "Discover luxury Arabic perfumes, oud, dakhoon & gift sets from Ahmed Al Maghribi — Saudi Arabia's premier fragrance house. Fast delivery across KSA.";

  return await buildStaticPageMetadata({
    pageKey: "home",
    locale,
    path: "",
    defaultTitle,
    defaultDesc,
  });
}

export default function Home() {
  return (
    <>
      <HomePage8 />
    </>
  );
}
