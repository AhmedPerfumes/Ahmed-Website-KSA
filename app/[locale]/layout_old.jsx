import Svgs from "@/components/common/Svgs";
import "react-tooltip/dist/react-tooltip.css";
import "../../public/assets/css/plugins/swiper.min.css";
import "../../public/assets/sass/style.scss";
import "rc-slider/assets/index.css";
import "tippy.js/dist/tippy.css";
import LoginFormPopup from "@/components/common/LoginFormPopup";
// import { useEffect } from "react";
import ScrollTop from "@/components/common/ScrollTop";
import Context from "@/context/Context";
import { MenuProvider } from "@/context/MenuContext";
import { UserProvider } from "@/context/UserContext";
// import QuickView from "@/components/modals/QuickView";
import CartDrawer from "@/components/shopCartandCheckout/CartDrawer";
import SiteMap from "@/components/modals/SiteMap";
import NewsLetter from "@/components/modals/NewsLetter";
// import CookieContainer from "@/components/common/CookieContainer";
import MobileHeader from "@/components/headers/MobileHeader";
import SizeGuide from "@/components/modals/SizeGuide";
import Delivery from "@/components/modals/Delivery";
import CustomerLogin from "@/components/asides/CustomerLogin";
// import ShopFilter from "@/components/asides/ShopFilter";
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

// const myFont = localFont({
//     src: "../../public/assets/fonts/wulkan/WulkanDisplayRegular.ttf",
// });
const englishFont = localFont({
    src: '../../public/assets/fonts/wulkan/WulkanDisplayRegular.ttf',
});
  
const arabicFont = localFont({
    src: '../../public/assets/fonts/alexandria-arabic/static/Alexandria-Regular.ttf',
});

export default async function LocaleLayout({ children, params: { locale } }) {
    // useEffect(() => {
    //   if (typeof window !== "undefined") {
    //     // Import the script only on the client side
    //     import("bootstrap/dist/js/bootstrap.esm").then(() => {
    //       // Module is imported, you can access any exported functionality if
    //     });

    //     localStorage.setItem("orderData", "");
    //     localStorage.setItem("cartList", []);
    //     localStorage.setItem("wishList", []);
    //   }
    // }, []);

    if (!routing.locales.includes(locale)) {
        notFound();
    }

    let selectedFont = englishFont;

    if (locale == 'ar') {
        selectedFont = arabicFont;
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale == "ar" ? "rtl" : "ltr"}>
            <Head>
                {/* Facebook Pixel Script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window,document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '235034997951707'); 
                            fbq('track', 'PageView');
                            `,
                    }}
                />
                <noscript>
                    <img
                        height="1"
                        width="1"
                        src="https://www.facebook.com/tr?id=235034997951707&ev=PageView&noscript=1"
                        alt=""
                    />
                </noscript>
            </Head>
            <body className={selectedFont.className}>
            {/* <body style={{ fontFamily: selectedFont.style.fontFamily }}> */}
                <NextIntlClientProvider messages={messages}>
                    <Svgs />
                    <Context>
                        <UserProvider>
                            <FacebookPixelEvents />
                            <MenuProvider>
                                <MobileHeader />
                                {children}
                                <MobileFooter1 />
                                {/* //modals and asides */}
                                <LoginFormPopup />
                                {/* <QuickView /> */}
                                {/* <NewsLetter /> */}
                                {/* <CookieContainer /> */}
                                <SizeGuide />
                                <Delivery />
                                <CartDrawer />
                                <SiteMap />
                                <CustomerLogin />
                                {/* <ShopFilter /> */}
                                <ProductDescription />
                                <ProductAdditionalInformation />
                                <ProductReviews />
                            </MenuProvider>
                        </UserProvider>
                    </Context>
                    <div className="page-overlay" id="pageOverlay"></div>
                    <ScrollTop />
                </NextIntlClientProvider>

                {/* <script src="/assets/scroll-frames.js"></script> */}
            </body>
        </html>
    );
}
