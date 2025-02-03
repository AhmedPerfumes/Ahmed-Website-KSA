import Svgs from "@/components/common/Svgs";
import "react-tooltip/dist/react-tooltip.css";
import "../../public/assets/css/plugins/swiper.min.css";
import "../../public/assets/sass/style.scss";
import "rc-slider/assets/index.css";
import "tippy.js/dist/tippy.css";
import LoginFormPopup from "@/components/common/LoginFormPopup";
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

    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
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