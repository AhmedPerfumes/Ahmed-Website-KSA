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
import Head from "next/head";

export const metadata = {
    title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
    description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
    icons: {
        icon: "/assets/images/ahmed-favicon.png",
    },
};

// Import English font
const englishFont = localFont({
    src: "../../public/assets/fonts/wulkan/WulkanDisplayRegular.ttf",
});

// Import Arabic font
const arabicFont = localFont({
    src: "../../public/assets/fonts/alexandria-arabic/static/Alexandria-Regular.ttf",
});

// Import Sofia Pro Regular font as a secondary font
const sofiaFont = localFont({
    src: "../../public/assets/fonts/sofia/SofiaProRegular.ttf",
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
                    ttq.load('CA6RMBBC77UC097ILMD0');
                    ttq.page();
                    }(window, document, 'ttq');
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
                    <Context>
                        <UserProvider>
                            <FacebookPixelEvents />
                            <MenuProvider>
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
                            </MenuProvider>
                        </UserProvider>
                    </Context>
                    <div className="page-overlay" id="pageOverlay"></div>
                    <ScrollTop />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}