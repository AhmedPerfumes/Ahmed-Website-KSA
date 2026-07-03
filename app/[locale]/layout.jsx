import Svgs from "@/components/common/Svgs";
// style.scss is the only critical CSS — kept synchronous (above-fold styles)
// react-tooltip, swiper, tippy, rc-slider are loaded asynchronously in DeferredCSS
import "../../public/assets/sass/style.scss";
import LoginFormPopup from "@/components/common/LoginFormPopup";
import Script from "next/script";
import ScrollTop from "@/components/common/ScrollTop";
import Context from "@/context/Context";
import { MenuProvider } from "@/context/MenuContext";
import { UserProvider } from "@/context/UserContext";
import CartDrawer from "@/components/shopCartandCheckout/CartDrawer";
import SiteMap from "@/components/modals/SiteMap";
import NewsLetter from "@/components/modals/NewsLetter";
import MobileHeader from "@/components/headers/MobileHeader";
import SizeGuide from "@/components/modals/SizeGuide";
import Delivery from "@/components/modals/Delivery";
import CustomerLogin from "@/components/asides/CustomerLogin";
import ProductDescription from "@/components/asides/ProductDescription";
import ProductAdditionalInformation from "@/components/asides/ProductAdditionalInformation";
import ProductReviews from "@/components/asides/ProductReviews";
import MobileFooter1 from "@/components/footers/MobileFooter1";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { FacebookPixelEvents } from "@/components/Metapixel";
import Head from "next/head";
import { ToastContainer } from 'react-toastify';
import DeferredCSS from "@/components/common/DeferredCSS";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params: { locale } }) {
  const isAr = locale === "ar";
  return {
    metadataBase: new URL(baseUrl),

    title: isAr
      ? "أفضل العطور الفاخرة | أحمد المغربي للعطور"
      : "Buy Luxury Perfumes Online in Saudi Arabia | Ahmed Al Maghribi",

    description: isAr
      ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي. عطور عربية أصيلة، بخور، دخون، ومجموعات هدايا فاخرة. شحن سريع في المملكة العربية السعودية."
      : "Discover luxury Arabic perfumes, oud, dakhoon & gift sets from Ahmed Al Maghribi — Saudi Arabia's premium fragrance house. Fast delivery across KSA.",

    keywords: isAr
      ? "عطور, عطر, بخور, دخون, هدايا, أحمد المغربي, عطور فاخرة, عطور عربية, المملكة العربية السعودية"
      : "perfumes Saudi Arabia, buy perfumes online KSA, Arabic perfumes, oud fragrance, dakhoon, gift sets, Ahmed Al Maghribi, luxury perfumes",

    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },

    openGraph: {
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
      url: `${baseUrl}/${locale}`,
      siteName: "Ahmed Al Maghribi Perfumes",
      title: isAr
        ? "أفضل العطور الفاخرة | أحمد المغربي للعطور"
        : "Buy Luxury Perfumes Online in Saudi Arabia | Ahmed Al Maghribi",
      description: isAr
        ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي. عطور عربية، بخور، دخون، وهدايا فاخرة."
        : "Luxury Arabic perfumes, oud, dakhoon & gift sets. Saudi Arabia's premier fragrance house.",
      images: [
        {
          url: `${baseUrl}/assets/images/ahmed-og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Ahmed Al Maghribi Perfumes — Luxury Fragrance House",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: isAr
        ? "أفضل العطور الفاخرة | أحمد المغربي للعطور"
        : "Buy Luxury Perfumes Online in Saudi Arabia | Ahmed Al Maghribi",
      description: isAr
        ? "اكتشف أرقى العطور الفاخرة من أحمد المغربي."
        : "Luxury Arabic perfumes, oud, dakhoon & gift sets from Ahmed Al Maghribi.",
      images: [`${baseUrl}/assets/images/ahmed-og-image.jpg`],
    },

    icons: {
      icon: "/assets/images/ahmed-favicon.png",
      shortcut: "/assets/images/ahmed-favicon.png",
      apple: "/assets/images/ahmed-favicon.png",
    },

    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };
}

// Import English font — adjustFontFallback calculates size-adjust/ascent-override
// automatically to minimize layout shift when the custom font swaps in.
const englishFont = localFont({
    src: "../../public/assets/fonts/wulkan/WulkanDisplayRegular.ttf",
    display: "swap",
    adjustFontFallback: true,
    preload: true,
});

// Import Arabic font
const arabicFont = localFont({
    src: "../../public/assets/fonts/alexandria-arabic/static/Alexandria-Regular.ttf",
    display: "swap",
    adjustFontFallback: true,
    preload: false, // only preloaded for ar locale
});

// sofiaFont (Kanit-Regular.ttf) REMOVED — it was only used for locale="secondary"
// which is not a real locale. Its @font-face declaration was causing the browser
// to download Kanit-Regular.ttf (66.7 KiB) in the critical CSS chain, adding
// 1,178ms to the LCP critical path. Now using englishFont as fallback.

export default async function LocaleLayout({ children, params: { locale } }) {
    if (!routing.locales.includes(locale)) {
        notFound();
    }

    // Select the font based on locale
    let selectedFont = englishFont;
    if (locale === "ar") {
        selectedFont = arabicFont;
    }

    // Fetch translation messages
    const messages = await getMessages();
    const GTM_ID = "GTM-M6DDMJRN";

    const apiHost = (process.env.NEXT_PUBLIC_API_URL || "https://adminksa.ahmedalmaghribi.com")
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${baseUrl}/#organization`,
                name: "Ahmed Al Maghribi Perfumes",
                url: baseUrl,
                logo: {
                    "@type": "ImageObject",
                    url: `${baseUrl}/assets/images/ahmed-favicon.png`,
                },
                sameAs: [
                    "https://www.instagram.com/ahmedalmaghribiperfumes",
                    "https://www.facebook.com/ahmedalmaghribiperfumes",
                ],
                contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer service",
                    areaServed: "SA",
                    availableLanguage: ["Arabic", "English"],
                },
            },
            {
                "@type": "WebSite",
                "@id": `${baseUrl}/#website`,
                url: baseUrl,
                name: "Ahmed Al Maghribi Perfumes",
                publisher: { "@id": `${baseUrl}/#organization` },
                potentialAction: {
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/en/shop?search={search_term_string}` },
                    "query-input": "required name=search_term_string",
                },
            },
        ],
    };

    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <head>
                {/* Preconnect to API / image CDN */}
                <link rel="preconnect" href={`https://${apiHost}`} />
                <link rel="dns-prefetch" href={`https://${apiHost}`} />
                {/* Preconnect to analytics */}
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <link rel="preconnect" href="https://analytics.tiktok.com" />
                <link rel="preconnect" href="https://sc-static.net" />
                {/* Preload hero background (above-the-fold) */}
                <link rel="preload" href="/assets/background-ivory.webp" as="image" />
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            
            <body className={selectedFont.className}>
            {/* GTM — lazyOnload: fires after page is idle, not during TBT window */}
            <Script id="gtm-script" strategy="lazyOnload">
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${GTM_ID}');
                `}
            </Script>

            {/* TikTok pixel — lazyOnload */}
            <Script id="tiktok-pixel" strategy="lazyOnload">
                {`
                    !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                    ttq.load('D3D90EBC77U0EI1CR1O0');
                    ttq.page();
                    }(window, document, 'ttq');
                `}
            </Script>

            {/* TikTok event bridge — lazyOnload so it doesn't block render */}
            <Script id="tiktok-listener" strategy="lazyOnload">
                {`
                    (function(){
                    window.dataLayer = window.dataLayer || [];
                    const originalPush = window.dataLayer.push;
                    window.dataLayer.push = function(){
                        const args = Array.from(arguments);
                        originalPush.apply(window.dataLayer, args);
                        const eventObj = args[0];
                        if(eventObj && eventObj.event){
                        const ecommerce = eventObj.ecommerce || {};
                        const items = ecommerce.items || [];
                        switch(eventObj.event){
                            case "view_item":
                            window.ttq?.track("ViewContent", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "add_to_cart":
                            window.ttq?.track("AddToCart", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "begin_checkout":
                            window.ttq?.track("InitiateCheckout", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "add_payment_info":
                            window.ttq?.track("AddPaymentInfo", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "purchase":
                            window.ttq?.track("Purchase", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "place_order":
                            window.ttq?.track("PlaceAnOrder", { contents: items.map(i => ({ content_id: i.item_id, content_type: "product", content_name: i.item_name })), value: ecommerce.value, currency: ecommerce.currency }); break;
                            case "search":
                            window.ttq?.track("Search", { contents: items.map(i => ({ content_id: i.item_id || "search", content_type: "product", content_name: i.item_name || (eventObj.search_term || "search") })), value: ecommerce.value || 0, currency: ecommerce.currency || "SAR", search_string: eventObj.search_term || "" }); break;
                        }
                        }
                    };
                    })();
                `}
            </Script>

            {/* Snapchat Pixel — lazyOnload */}
            <Script id="snapchat-pixel" strategy="lazyOnload">
                {`
                (function(e,t,n){
                    if(e.snaptr) return;
                    var a=e.snaptr=function(){ a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments) };
                    a.queue=[];
                    var s='script',r=t.createElement(s);
                    r.async=!0; r.src=n;
                    var u=t.getElementsByTagName(s)[0];
                    u.parentNode.insertBefore(r,u);
                })(window,document,'https://sc-static.net/scevent.min.js');
                snaptr('init', '849fbb5a-bd08-474b-81fc-dfc5dade871e');
                snaptr('track', 'PAGE_VIEW');
                `}
            </Script>

            {/* Snapchat event bridge — lazyOnload */}
            <Script id="snapchat-listener" strategy="lazyOnload">
                {`
                (function(){
                    window.dataLayer = window.dataLayer || [];
                    const origPush = window.dataLayer.push;
                    window.dataLayer.push = function(){
                    const args = Array.from(arguments);
                    origPush.apply(window.dataLayer, args);
                    const ev = args[0];
                    if(ev && ev.event){
                        const ec = ev.ecommerce || {};
                        const it = ec.items || [];
                        switch(ev.event){
                        case "view_item":    window.snaptr && snaptr('track','VIEW_CONTENT',  { price: ec.value, currency: ec.currency||"SAR", item_ids: it.map(i=>i.item_id), item_category:"perfume" }); break;
                        case "add_to_cart":  window.snaptr && snaptr('track','ADD_CART',       { price: ec.value, currency: ec.currency||"SAR", item_ids: it.map(i=>i.item_id), item_category:"perfume", number_items: it.length }); break;
                        case "begin_checkout": window.snaptr && snaptr('track','START_CHECKOUT',{ price: ec.value, currency: ec.currency||"SAR", item_ids: it.map(i=>i.item_id), item_category:"perfume", number_items: it.length }); break;
                        case "purchase":     window.snaptr && snaptr('track','PURCHASE',       { price: ec.value, currency: ec.currency||"SAR", transaction_id: ec.transaction_id, item_ids: it.map(i=>i.item_id), item_category:"perfume", number_items: it.length }); break;
                        }
                    }
                    };
                })();
                `}
            </Script>

            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                />
            </noscript>
                <NextIntlClientProvider messages={messages}>
                    <Svgs />
                    <DeferredCSS />
                            <MenuProvider>
                    <Context>
                        <UserProvider>
                            <FacebookPixelEvents />
                                <MobileHeader />
                                {children}
                                <MobileFooter1 />
                                {/* Modals and Asides */}
                                <LoginFormPopup />
                                <SizeGuide />
                                <Delivery />
                                <CartDrawer />
                                <SiteMap />
                                <CustomerLogin />
                                <ProductDescription />
                                <ProductAdditionalInformation />
                                <ProductReviews />
                                <ToastContainer />
                        </UserProvider>
                    </Context>
                            </MenuProvider>
                    <div className="page-overlay" id="pageOverlay"></div>
                    <ScrollTop />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}