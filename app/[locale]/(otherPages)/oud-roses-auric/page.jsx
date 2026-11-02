import React from "react";
import Script from "next/script";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import VideoSection from "@/components/Auric/VideoSection";
import NoteSection from "@/components/Auric/NoteSection";
import FamilySection from "@/components/Auric/FamilySection";
import HeroSection from "@/components/Auric/HeroSection";
import JourneySection from "@/components/Auric/JourneySection";
import HeroSection2 from "@/components/otherPages/oud-roses-auric/HeroSection";
import "@/components/Auric/auric.scss";

// Central English config for Auric Landing Page
const AURIC_CONFIG_EN = {
  isArabic: false,
  edition: "imperial",
  title: "Oud & Roses Auric",
  subtitle: "The Evolution of an Icon",
  heroTitleLine1: "OUD & ROSES",
  heroTitleLine2: "AURIC",
  description:
    "An embodiment of majestic opulence and royal craftsmanship — Auric unites the depth of precious oud with velvet amber and intoxicating florals.",
  videoTopText: "The Evolution of an Icon",
  videoTitle: "Oud & Roses Auric",
  videoDescription:
    "A founder’s signature. A house’s evolution. A gift to the people who made the journey possible.",
  storyTitle: "A Story That Changed the House",
  storyTitlePart1: "A Story That Changed",
  storyTitlePart2: "The House",
  storyText:
    "Some fragrances become successful. Others change the direction of a house forever. Oud & Roses became a signature fragrance whose story reached far beyond its origins. Auric honours that legacy and the people who carried the story forward.",
  founderCredit: "Inspired by the vision of our founder, Mr. Kafeel Ahmed",
  ctaButtonText: "Explore Auric",
  bottleImg: "/assets/auric-bottle.png",
  comparisonBeforeImg: "/assets/images/oud-roses.png",
  comparisonAfterImg: "/assets/auric-bottle.png",
  comparisonBeforeLabel: "Oud & Roses",
  comparisonAfterLabel: "Auric",
  videoSrc: "/assets/videos/auric/auric-video.mp4",
  notesImages: {
    top: "/assets/images/auric/top.jpeg",
    mid: "/assets/images/auric/heart.jpeg",
    base: "/assets/images/auric/base.jpeg",
  },
  notesTiers: ["Top Notes", "Heart Notes", "Base Notes"],
  notesHeading: "Fragrance Notes",
  notesSubtitle:
    "A refined journey from radiant spice and rose to warm oud, crafted with depth, character and enduring elegance.",
  notesDescription: {
    top: "Bright orange opens the fragrance, warmed by cardamom, pepper and saffron, with an unexpected touch of leather",
    mid: "Immortelle Absolute from the Balkans, heliotrope and orris meet the distinctive Ahmed Al Maghribi Rose Accord.",
    base: "Vanilla, patchouli, musk and incense settle into a deep, lingering base, enriched by the Ahmed Al Maghribi Oud Accord",
  },
  heroQuote:
    "Some fragrances become successful. Others change the direction of a house forever. Oud & Roses became a signature fragrance whose story reached far beyond its origins. Auric honours that legacy and the people who carried the story forward.",
  accentColor: "#c2596c",
  maroonDark: "#800020",
  textColor: "#ffffff",
  quoteColor: "#e6d5d8",
  buttonColor: "#800020",
  buttonTextColor: "#ffffff",
  dividerGradient: "linear-gradient(to right, #800020, transparent)",
  familyImages: {
    left: "/assets/images/kseries/bottle/past_left.png",
    center: "/assets/auric-bottle.png",
    right: "/assets/images/kseries/bottle/future_right.png",
  },
  familyTag: "REIMAGINED",
  familyHeading: "A Bouquet That Unfolds",
  familyHeadingPart1: "A Bouquet That",
  familyHeadingPart2: "Unfolds",
  familyDescription:
    "“Like a bouquet opening one bloom at a time, the fragrance reveals new facets as its notes unfold. One composition offers the depth and complexity of fragrance layering, without combining multiple scents.”",
  watermarkText: "EXTRAIT DE PARFUM",
  journeyVideoSrc: "/assets/videos/auric/test.mp4",
  journeyTag: "SIGNATURE COLLECTION",
  journeyHeading: "The Story Continues",
  journeyDescription:
    "Discover Auric’s story from the signature that came before it to its new expression.",
};

// Central Arabic config for Auric Landing Page with official Arabic copy
const AURIC_CONFIG_AR = {
  isArabic: true,
  edition: "imperial",
  title: "عود آند روزز أوريك",
  subtitle: "تطور الأيقونة",
  heroTitleLine1: "عود آند روزز",
  heroTitleLine2: "أوريك",
  description:
    "تجسيد للفخامة المهيبة وحرفية العطور الاستثنائية التي تجمع بين العود النادر والورد والعنبر.",
  videoTopText: "تطور الأيقونة",
  videoTitle: "عود آند روزز أوريك",
  videoDescription:
    "توقيع المؤسس. تطور البيت العطري. هدية للأشخاص اللي ساهموا في إكمال الرحلة.",
  storyTitle: "قصة غيّرت البيت العطري",
  storyTitlePart1: "قصة غيّرت",
  storyTitlePart2: "البيت العطري",
  storyText:
    "بعض العطور تصير ناجحة. وبعضها يغيّر مسار بيت عطري بأكمله للأبد. عود آند روزز صار عطراً توقيعياً وصلت قصته لأبعد من أصله. وأوريك يكرّم هذا الإرث والأشخاص اللي حملوا القصة لمراحل أبعد.",
  founderCredit: "مستوحى من رؤية مؤسسنا، الأستاذ كفيل أحمد.",
  ctaButtonText: "اشترِ الآن",
  bottleImg: "/assets/auric-bottle.png",
  comparisonBeforeImg: "/assets/images/oud-roses.png",
  comparisonAfterImg: "/assets/auric-bottle.png",
  comparisonBeforeLabel: "عود آند روزز",
  comparisonAfterLabel: "أوريك",
  videoSrc: "/assets/videos/auric/auric-video.mp4",
  notesImages: {
    top: "/assets/images/auric/top.jpeg",
    mid: "/assets/images/auric/heart.jpeg",
    base: "/assets/images/auric/base.jpeg",
  },
  notesTiers: ["النوتات العليا", "نوتات القلب", "النوتات القاعدية"],
  notesHeading: "نفحات العطر",
  notesSubtitle:
    "رحلة راقية من التوابل المشرقة والورد إلى دفء العود، بتركيبة تتسم بالعمق والحضور والأناقة الدائمة.",
  notesDescription: {
    top: "يفتتح البرتقال المشرق العطر، وتدفئه نفحات الهيل والفلفل والزعفران، مع لمسة جلد غير متوقعة.",
    mid: "زيت الورد وإيمورتيل أبسولوت من البلقان، والهليوتروب، والأوريس يلتقون مع أكورد الورد المميز من أحمد المغربي.",
    base: "الفانيليا والباتشولي والمسك تستقر في قاعدة عميقة تدوم طويلاً، يثريها البخور وأكورد العود من أحمد المغربي.",
  },
  heroQuote:
    "بعض العطور تصير ناجحة. وبعضها يغيّر مسار بيت عطري بأكمله للأبد. عود آند روزز صار عطراً توقيعياً وصلت قصته لأبعد من أصله. وأوريك يكرّم هذا الإرث والأشخاص اللي حملوا القصة لمراحل أبعد.",
  accentColor: "#c2596c",
  maroonDark: "#800020",
  textColor: "#ffffff",
  quoteColor: "#e6d5d8",
  buttonColor: "#800020",
  buttonTextColor: "#ffffff",
  dividerGradient: "linear-gradient(to right, #800020, transparent)",
  familyImages: {
    left: "/assets/images/kseries/bottle/past_left.png",
    center: "/assets/auric-bottle.png",
    right: "/assets/images/kseries/bottle/future_right.png",
  },
  familyTag: "إعادة تصوّر",
  familyHeading: "باقة تتفتح رويداً رويداً",
  familyHeadingPart1: "باقة تتفتح",
  familyHeadingPart2: "رويداً رويداً",
  familyDescription:
    "مثل باقة زهور تتفتح زهرة تلو الأخرى، يكشف العطر عن جوانب جديدة مع تفتح نوتاته. تركيبة واحدة تمنحك عمق وتعقيد طبقات العطور، من غير الحاجة لدمج أكثر من رائحة مع بعض",
  watermarkText: "إكستري دي بارفان",
  journeyVideoSrc: "/assets/videos/auric/test.mp4",
  journeyTag: "مجموعة التوقيع العطري",
  journeyHeading: "القصة مستمرة",
  journeyDescription:
    "اكتشف قصة أوريك، من التوقيع اللي سبقه لتعبيره الجديد.",
};

export async function generateMetadata({ params }) {
  const { locale } = params || {};
  const isArabic = locale === "ar";

  const title = isArabic
    ? "عود آند روزيز أوريك | تطور أيقونة العطور | عطور أحمد المغربي"
    : "Oud & Roses Auric | The Evolution of an Icon | Ahmed Al Maghribi Perfumes";

  const description = isArabic
    ? "اكتشف عطر عود آند روزيز أوريك من عطور أحمد المغربي. تجسيد للفخامة المهيبة وحرفية العطور الاستثنائية التي تجمع بين العود النادر والورد والعنبر."
    : "Experience Oud & Roses Auric by Ahmed Al Maghribi Perfumes. An embodiment of majestic opulence and royal craftsmanship, uniting rare oud, Turkish rose, and amber.";

  const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ae.ahmedalmaghribi.com";
  const canonicalUrl = `${baseUrl}/${locale || "en"}/oud-roses-auric`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: [
      "Oud & Roses Auric",
      "Ahmed Al Maghribi",
      "Ahmed Al Maghribi Perfumes",
      "Oud and Roses",
      "Extrait de Parfum",
      "Luxury Arabic Perfume",
      "Oud Perfume UAE",
      "Turkish Rose Perfume",
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/oud-roses-auric`,
        ar: `${baseUrl}/ar/oud-roses-auric`,
        "x-default": `${baseUrl}/en/oud-roses-auric`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: isArabic ? "عطور أحمد المغربي" : "Ahmed Al Maghribi Perfumes",
      images: [
        {
          url: "/assets/auric-bottle.png",
          width: 800,
          height: 1000,
          alt: "Oud & Roses Auric Luxury Flacon",
        },
      ],
      type: "website",
      locale: isArabic ? "ar_AE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/auric-bottle.png"],
    },
    icons: {
      icon: "/assets/images/ahmed-favicon.png",
    },
  };
}

export default function AuricPage({ params }) {
  const { locale } = params || {};
  const currentLocale = locale || "en";
  const isArabic = currentLocale === "ar";
  const data = isArabic ? AURIC_CONFIG_AR : AURIC_CONFIG_EN;
  const shopUrl = `/${currentLocale}/shop/perfumes/occidental-fragrance/oud-roses-auric`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // {
      //   "@type": "Product",
      //   "@id": `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric#product`,
      //   name: isArabic ? "عود آند روزز أوريك" : "Oud & Roses Auric",
      //   image: "https://ae.ahmedalmaghribi.com/assets/auric-bottle.png",
      //   description: isArabic
      //     ? "تجسيد للفخامة المهيبة وحرفية العطور الاستثنائية التي تجمع بين العود النادر والورد والعنبر."
      //     : "An embodiment of majestic opulence and royal craftsmanship — Auric unites the depth of precious oud with Turkish rose, immortelle, velvet amber, and warm woods.",
      //   brand: {
      //     "@type": "Brand",
      //     name: isArabic ? "عطور أحمد المغربي" : "Ahmed Al Maghribi Perfumes",
      //   },
      //   category: "Extrait de Parfum",
      //   // offers: {
      //   //   "@type": "Offer",
      //   //   url: `https://ae.ahmedalmaghribi.com${shopUrl}`,
      //   //   priceCurrency: "AED",
      //   //   availability: "https://schema.org/InStock",
      //   //   seller: {
      //   //     "@type": "Organization",
      //   //     name: isArabic ? "عطور أحمد المغربي" : "Ahmed Al Maghribi Perfumes",
      //   //   },
      //   // },
      // },
      {
        "@type": "WebPage",
        "@id": `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric#Webpage`,
        url: `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric`,
        name: isArabic ? "عود آند روزز أوريك" : "Oud & Roses Auric",
        inLanguage: isArabic ? "ar" : "en",
        description: isArabic
          ? "تجسيد للفخامة المهيبة وحرفية العطور الاستثنائية التي تجمع بين العود النادر والورد والعنبر."
          : "An embodiment of majestic opulence and royal craftsmanship — Auric unites the depth of precious oud with Turkish rose, immortelle, velvet amber, and warm woods.",
        isPartOf: {
          "@type": "WebSite",
          name: isArabic ? "عطور أحمد المغربي" : "Ahmed Al Maghribi Perfumes",
          url: isArabic ? "https://ae.ahmedalmaghribi.com/ar" : "https://ae.ahmedalmaghribi.com/en",
        },
        breadcrumb: {
          "@id": `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isArabic ? "الرئيسية" : "Home",
            item: `https://ae.ahmedalmaghribi.com/${currentLocale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isArabic ? "العطور" : "Fragrances",
            item: `https://ae.ahmedalmaghribi.com/${currentLocale}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: isArabic ? "عود آند روزز أوريك" : "Oud & Roses Auric",
            item: `https://ae.ahmedalmaghribi.com/${currentLocale}/oud-roses-auric`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="auric-schema-ldjson"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      <main className="auric-landing-page">
        <HeroSection2
          isArabic={isArabic}
          titleLine1={data?.heroTitleLine1}
          titleLine2={data?.heroTitleLine2}
        />
        <VideoSection data={data} />
        <HeroSection data={data} shopUrl={shopUrl} />
        <JourneySection data={data} />
        <NoteSection data={data} />
        <FamilySection data={data} shopUrl={shopUrl} />
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
}
