import Svgs from "@/components/common/Svgs";
import "react-tooltip/dist/react-tooltip.css";
import "../../public/assets/css/plugins/swiper.min.css";
import "../../public/assets/sass/style.scss";
import "rc-slider/assets/index.css";
import "tippy.js/dist/tippy.css";
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
import AhmedTrackerComponent from "@/components/common/AhmedTracker";
import Head from "next/head";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IntlProviderClient from "./IntlProviderClient";

const baseUrl = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";

export async function generateMetadata({ params: { locale } }) {
  return {
    metadataBase: new URL(baseUrl),

    title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",

    description:
      "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",

    icons: {
      icon: "/assets/images/ahmed-favicon.png",
    },

    alternates: {
      canonical: `/${locale}`,

      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
  };
}

// Import English font
const englishFont = localFont({
    src: "../../public/assets/fonts/wulkan/WulkanDisplayRegular.ttf",
});

// Import Arabic font
const arabicFont = localFont({
    src: "../../public/assets/fonts/alexandria-arabic/static/Alexandria-Regular.ttf",
});

// Import secondary font
const sofiaFont = localFont({
    src: "../../public/assets/fonts/kanit/Kanit-Regular.ttf",
});

export default async function LocaleLayout({ children, params: { locale } }) {
    if (!routing.locales.includes(locale)) {
        notFound();
    }

    // Select the font based on locale or other conditions
    let selectedFont = englishFont;

    if (locale === "ar") {
        selectedFont = arabicFont;
    } else if (locale === "secondary") {
        selectedFont = sofiaFont; // Apply Sofia Pro Regular as a secondary font
    }

    // Fetch translation messages
    const messages = await getMessages();
    const GTM_ID = "GTM-M6DDMJRN";

    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
            <head></head>
            
            <body className={selectedFont.className}>
            <Script id="gtm-script" strategy="afterInteractive">
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${GTM_ID}');
                `}
            </Script>

            <Script id="tiktok-pixel" strategy="afterInteractive">
                {`
                    !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                    ttq.load('D3D90EBC77U0EI1CR1O0');
                    ttq.page();
                    }(window, document, 'ttq');
                `}
            </Script>

            <Script id="tiktok-listener" strategy="afterInteractive">
                {`
                    (function(){
                    // Ensure dataLayer exists
                    window.dataLayer = window.dataLayer || [];

                    // Save original push method
                    const originalPush = window.dataLayer.push;

                    // Override push to also send TikTok events
                    window.dataLayer.push = function(){
                        const args = Array.from(arguments);
                        originalPush.apply(window.dataLayer, args);

                        const eventObj = args[0];
                        if(eventObj && eventObj.event){
                        const ecommerce = eventObj.ecommerce || {};
                        const items = ecommerce.items || [];

                        switch(eventObj.event){
                            case "view_item":
                            window.ttq?.track("ViewContent", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "add_to_cart":
                            window.ttq?.track("AddToCart", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "begin_checkout":
                            window.ttq?.track("InitiateCheckout", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "add_payment_info":
                            window.ttq?.track("AddPaymentInfo", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "purchase":
                            window.ttq?.track("Purchase", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "place_order": // custom GA4 event name if used
                            window.ttq?.track("PlaceAnOrder", {
                                contents: items.map(i => ({
                                content_id: i.item_id,
                                content_type: "product",
                                content_name: i.item_name
                                })),
                                value: ecommerce.value,
                                currency: ecommerce.currency
                            });
                            break;

                            case "search":
                            window.ttq?.track("Search", {
                                contents: items.map(i => ({
                                content_id: i.item_id || "search", // fallback if no product_id
                                content_type: "product",
                                content_name: i.item_name || (eventObj.search_term || "search")
                                })),
                                value: ecommerce.value || 0,
                                currency: ecommerce.currency || "SAR",
                                search_string: eventObj.search_term || ""
                            });
                            break;
                        }
                        }
                    };
                    })();
                `}
            </Script>

            <Script id="snapchat-pixel" strategy="afterInteractive">
                {`
                (function(e,t,n){
                    if(e.snaptr) return;
                    var a=e.snaptr=function(){
                    a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)
                    };
                    a.queue=[];
                    var s='script';
                    var r=t.createElement(s);
                    r.async=!0;
                    r.src=n;
                    var u=t.getElementsByTagName(s)[0];
                    u.parentNode.insertBefore(r,u);
                })(window,document,'https://sc-static.net/scevent.min.js');

                snaptr('init', '849fbb5a-bd08-474b-81fc-dfc5dade871e');
                snaptr('track', 'PAGE_VIEW');
                `}
            </Script>

            <Script id="snapchat-listener" strategy="afterInteractive">
                {`
                (function(){
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
                            window.snaptr && snaptr('track', 'VIEW_CONTENT', {
                            price: ecommerce.value,
                            currency: ecommerce.currency || "SAR",
                            item_ids: items.map(i => i.item_id),
                            item_category: "perfume"
                            });
                            break;

                        case "add_to_cart":
                            window.snaptr && snaptr('track', 'ADD_CART', {
                            price: ecommerce.value,
                            currency: ecommerce.currency || "SAR",
                            item_ids: items.map(i => i.item_id),
                            item_category: "perfume",
                            number_items: items.length
                            });
                            break;

                        case "begin_checkout":
                            window.snaptr && snaptr('track', 'START_CHECKOUT', {
                            price: ecommerce.value,
                            currency: ecommerce.currency || "SAR",
                            item_ids: items.map(i => i.item_id),
                            item_category: "perfume",
                            number_items: items.length
                            });
                            break;

                        case "purchase":
                            window.snaptr && snaptr('track', 'PURCHASE', {
                            price: ecommerce.value,
                            currency: ecommerce.currency || "SAR",
                            transaction_id: ecommerce.transaction_id,
                            item_ids: items.map(i => i.item_id),
                            item_category: "perfume",
                            number_items: items.length
                            });
                            break;
                        }
                    }
                    }
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
                <IntlProviderClient locale={locale} messages={messages}>
                    <Svgs />
                            <MenuProvider>
                    <Context>
                        <UserProvider>
                            <FacebookPixelEvents />
                            <AhmedTrackerComponent />
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
                </IntlProviderClient>
            </body>
        </html>
    );
}