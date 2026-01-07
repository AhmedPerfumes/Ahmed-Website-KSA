"use client";
import Link from "next/link";
import CartLength from "./components/CartLength";
import Nav from "./components/Nav";
import { openCart } from "@/utlis/openCart";
import User from "./components/User";
import UserLoggedIn from "./components/UserLoggedIn";
import { currencyOptions, languageOptions2 } from "@/data/footer";
import { slideData1000 } from "@/data/heroslides";
import Image from "next/image";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
// import { useRouter } from 'next/navigation';
import { useMenu } from "../../context/MenuContext";
import { useUser } from "../../context/UserContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../../i18n/routing";
import "../HomePage.css";

// Add this CSS to your stylesheet (e.g., header.module.css)
const headerStyles = `
.header { transition: transform 0.3s ease-in-out; }
.header-hidden { transform: translateY(-100%); }
.header-visible { transform: translateY(0); }
.header_sticky { position: sticky; top: 0; z-index: 1000; background-color: white; }
.search-popup { opacity: 0; transform: translateY(-10px); pointer-events: none; transition: opacity 0.5s ease, transform 0.5s ease; z-index: 1200; }
.js-content_visible .search-popup { opacity: 1; transform: translateY(0); pointer-events: auto; }
.js-content_hidden .search-popup { opacity: 0; transform: translateY(-50px); pointer-events: none; }
.search-minimal { margin-left: auto; }
.search-minimal form { width: 220px; }
.search-minimal .form-control { border: 1px solid #e3e3e3; border-bottom: 1px solid #111; border-radius: 0; padding: 8px 40px 8px 12px; font-size: 14px; letter-spacing: 0.04em; box-shadow: none; outline: none; }
.search-minimal .form-control::placeholder { color: #6b7280; font-weight: 500; }
.search-minimal .form-control:focus { border-color: #cfcfcf; border-bottom-color: #a67b30; box-shadow: none; }
.search-minimal .search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #111; pointer-events: none; }
.search-popup__close { position: absolute; top: 10px; right: 12px; background: transparent; border: none; font-size: 20px; cursor: pointer; color: #333; z-index: 5; }
.search-popup__close:hover { color: #000; }
`;
export default function Header14() {
    const [scrollDirection, setScrollDirection] = useState("down");
    const [scrollState, setScrollState] = useState("visible");
    const locale = useLocale();
    // console.log(locale);
    const t = useTranslations();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    
    const containerRef = useRef(null);
    const lastScrollY = useRef(0);

    const items = [
        { href: "/account_dashboard", label: locale === 'ar' ? "ملفي الشخصي" : "My Profile" },
        { href: "/account_orders", label: locale === 'ar' ? "مشترياتي" : "My Purchases" },
        { href: "/account_edit_address", label: locale === 'ar' ? "العناوين" : "Addresses" },
        { href: "/account_coupons", label: locale === 'ar' ? "كوبوناتي" : "My Coupons" },
        { href: "/account_loyalty", label: locale === 'ar' ? "نقاط الولاء" : "Loyalty Points" },
    ];

    const isActive = (href) => pathname === href || pathname.startsWith(href);

    const inputRef = useRef(null);

    useEffect(() => {
        if (isPopupOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isPopupOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setIsPopupOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        if (isPopupOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isPopupOpen]);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         const currentScrollY = window.scrollY;

    //         if (currentScrollY > 250) {
    //             if (currentScrollY > lastScrollY.current) {
    //                 // Scrolling down
    //                 setScrollDirection("down");
    //             } else {
    //                 // Scrolling up
    //                 setScrollDirection("up");
    //             }
    //         } else {
    //             // Below 250px
    //             setScrollDirection("down");
    //         }

    //         lastScrollY.current = currentScrollY;
    //     };
    //     const lastScrollY = { current: window.scrollY };

    //     // Add scroll event listener
    //     window.addEventListener("scroll", handleScroll);

    //     // Cleanup: remove event listener when component unmounts
    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };
    // }, []);

    useEffect(() => {
        let hideThreshold = 150; // px distance before hiding
        let lastShowY = 0; // where header was last shown

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 50) {
                // Always show at very top
                setScrollState("visible");
                lastShowY = currentScrollY;
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling down
                if (currentScrollY - lastShowY > hideThreshold) {
                    setScrollState("hidden");
                }
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up → show header again and reset baseline
                setScrollState("visible");
                lastShowY = currentScrollY;
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const router = useRouter();
    const pathname = usePathname();
    const [searchKeyWord, setSearchKeyWord] = useState("");

    const handleChange = (event) => {
        setSearchKeyWord(event.target.value);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        router.replace("/login_register");
        setTimeout(() => {
            window.location.reload();
        }, 50); // give router a moment to redirect
    };

    const handleLangChange = (e) => {
        // console.log(pathname, e.target.value);
        router.push(pathname, { locale: e.target.value });
    };

    //  const pathname = usePathname();

    const { isLoggedIn } = useUser();

    const {
        categoriesSubCategories,
        top_header,
        isLoading: isMenuLoading,
        error,
    } = useMenu();

    if (isMenuLoading) {
        return <div></div>;
    }
    if (error) {
        return <div>{error}</div>;
    }

    const swiperOptions = {
        autoplay: {
            delay: 5000,
        },
        modules: [Autoplay, Navigation, EffectFade],
        pagination: false,
        slidesPerView: 1,
        effect: "fade",
        loop: true,
    };

    //Inline style for transitions
    const headerStyle = {
        transition: "max-height 0.8s ease-in-out, opacity 0.5s ease-in-out",
        overflow: isHeaderOpen ? "visible" : "hidden",
        maxHeight: isHeaderOpen ? "1000px" : "0",
        opacity: isHeaderOpen ? 1 : 1,
    };

    const onSearch = (event) => {
        event.preventDefault();
        window.location.href = `/${locale}/shop?q=${removeSpecialCharactersAndAmp(
            searchKeyWord
        )
            .split(" ")
            .join("-")}`;
    };

    // "WARNING: If you change this logic, update the corresponding PHP/JS file."
    function removeSpecialCharactersAndAmp(str) {
        // Remove the specific word "&amp;"
        let cleanedStr = str.replace(/&amp;/g, "");

        // Remove all special characters
        cleanedStr = cleanedStr.replace(/[^\w\s-]/g, "");

        // Replace multiple spaces with a single space and trim
        cleanedStr = cleanedStr.replace(/\s+/g, " ").trim();

        return cleanedStr;
    }

    return (
        <>
            <style>{headerStyles}</style>
            <header
                id="header"
                className={`header header_sticky bg-white ${
                    scrollState === "visible"
                        ? "header-visible"
                        : "header-hidden"
                } ${pathname !== "/" ? "position-sticky w-100" : ""}`}
            >
                {/* <header
                id="header"
                className={
                    pathname == "/"
                        ? `header header_sticky bg-white ${
                              scrollDirection == "up"
                                  ? "header_sticky-active"
                                  : "position-relative"
                          } `
                        : "header header_sticky position-sticky w-100 bg-white"
                }
                style={pathname == "/" ? {} : {}}
            > */}
                <Swiper
                    className="swiper-container js-swiper-slider slideshow type4 slideshow-navigation-white-sm swiper-container-fade swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events bg-black"
                    {...swiperOptions}
                    style={{ height: "2.5rem" }}
                >
                    {top_header?.map((elm, i) => (
                        <SwiperSlide
                            key={i}
                            style={{
                                textTransform: "uppercase",
                                fontSize: "12px",
                            }}
                            className="swiper-slide text-center"
                        >
                            <div className="slideshow-text container position-absolute start-50 top-50 translate-middle">
                                <Link
                                    href={`/${locale}/${elm.color}`}
                                    className="animate animate_fade animate_btt animate_delay-5 lh-2rem text-white"
                                >
                                    {t(
                                        elm.title
                                            .split(" ")
                                            .slice(0, 13)
                                            .join(" ")
                                    )}
                                </Link>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Search Popup */}
                <div ref={containerRef} className={`header-tools__item hover-container ${isPopupOpen ? "js-content_visible" : "js-content_hidden"}`}>
                    <div className="search-popup js-hidden-content">
                        <button type="button" className="btn-close search-popup__close" aria-label="Close" onClick={() => setIsPopupOpen(false)}>✕</button>
                        <form onSubmit={onSearch} className="search-field container">
                            <p className="text-uppercase text-secondary fw-medium mb-4">{t("title")}</p>
                            <div className="position-relative">
                                <input ref={inputRef} className="search-field__input search-popup__input w-100 fw-medium" type="text" name="search-keyword" placeholder={t("Search Products")} value={searchKeyWord} onChange={handleChange} style={{ paddingLeft: locale === 'ar' ? '3rem' : '1rem', paddingRight: locale === 'ar' ? '1rem' : '3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}/>
                                <button className="btn-icon search-popup__submit" type="submit" style={{ right: locale === 'ar' ? 'auto' : '0', left: locale === 'ar' ? '0' : 'auto', position: 'absolute', top: '0', height: '100%' }}>
                                    <svg className="d-block" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <use href="#icon_search" />
                                    </svg>
                                </button>
                                <button className="btn-icon btn-close-lg search-popup__reset" type="reset"></button>
                            </div>
                            <div className="search-popup__results">
                                <div className="sub-menu search-suggestion">
                                    <h6 className="sub-menu__title fs-base">{t("Quicklinks")}</h6>
                                    <ul className="sub-menu__list list-unstyled">
                                        <li className="sub-menu__item"><Link href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`} className="menu-link menu-link_us-s">{t("Zumar")}</Link></li>
                                        <li className="sub-menu__item"><Link href={`/${locale}/shop/perfumes/oriental-fragrance/marj`} className="menu-link menu-link_us-s">{t("Marj")}</Link></li>
                                        <li className="sub-menu__item"><Link href={`/${locale}/shop/perfumes/occidental-fragrance/oud-roses`} className="menu-link menu-link_us-s">{t("Oud & Roses")}</Link></li>
                                        <li className="sub-menu__item"><Link href={`/${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`} className="menu-link menu-link_us-s">{t("Bin Shaikh")}</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="header-desk_type_8">
                    <div className="header-middle">
                        <div className="container-fluid d-flex align-items-center my-2 px-5">
                            <div className="flex-1 d-flex align-items-center gap-3">
                                <div className="heeader-top__right flex-1 d-flex gap-1">
                                    <select className="form-select form-select-sm bg-transparent color-black" name="store-currency" onChange={(e) => window.open(e.target.value, "_blank")}>
                                        {currencyOptions.map((option, index) => <option key={index} value={option.link}>{t(option.text)}</option>)}
                                    </select>
                                    <select className="form-select form-select-sm bg-transparent text-dark border-0" name="store-language" value={locale} onChange={handleLangChange} style={{ cursor: 'pointer', outline: 'none' }}>
                                        {languageOptions2.map((option, index) => <option key={index} value={option.value}>{option.text}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="logo">
                                <Link href="/"><Image loading="lazy" src="/assets/images/about/AhmedLogo.png" width="100" height="100" alt="Ahmed Al Maghribi" /></Link>
                            </div>

                            <div className="header-tools d-flex align-items-center flex-1 justify-content-end me-2">
                                <div className="d-none d-lg-flex search-minimal me-4">
                                    <form onSubmit={onSearch} className="position-relative">
                                        <input type="text" name="search-keyword" placeholder={t('SEARCH')} value={searchKeyWord} onChange={handleChange} onClick={() => setIsPopupOpen(true)} className="form-control pe-5" />
                                        <span className="search-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                                                <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                            </svg>
                                        </span>
                                    </form>
                                </div>

                                {/* Account */}
                                <div className="header-tools__item hover-account position-relative">
                                    {!isLoggedIn ? (
                                        <Link href="/login_register" className="account-icon-link"><User /></Link>
                                    ) : (
                                        <Link href="/account_dashboard" className="account-icon-link" aria-haspopup="true"><UserLoggedIn /></Link>
                                    )}
                                    <div className="account-hover-menu" role="menu" style={{left: locale === 'ar' ? '0' : 'auto', right: locale === 'ar' ? 'auto' : '0', minWidth: '200px' }}>
                                        {isLoggedIn ? (
                                            <>
                                                <div className="menu-title text-uppercase fw-medium text-start px-3 py-2 border-bottom">{locale === 'ar' ? "إدارة الحساب" : "Manage Account"}</div>
                                                <ul className="list-unstyled mb-0 text-start">
                                                    {items.map((it) => (
                                                        <li key={it.href} className={isActive(it.href) ? "active" : ""}>
                                                            <Link href={it.href} className="d-flex align-items-center justify-content-between px-3 py-2">
                                                                <span>{it.label}</span>
                                                                {it.label.toLowerCase().includes("coupon") && couponCount > 0 && (
                                                                    <span className="badge rounded-pill bg-danger ms-2" style={{ fontSize: "0.75rem", minWidth: "1.5rem", textAlign: "center", marginRight: locale === 'ar' ? '0.5rem' : '0', marginLeft: locale === 'ar' ? '0' : '0.5rem' }}>{couponCount}</span>
                                                                )}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                    <li className="divider border-top" aria-hidden="true" />
                                                    <li className="logout"><a href="#" onClick={handleLogout} className="text-danger fw-medium"> {locale === 'ar' ? "تسجيل خروج" : "Logout"} </a></li>
                                                </ul>
                                            </>
                                        ) : (
                                            <ul className="list-unstyled mb-0 text-start">
                                                <li>
                                                    <Link href="/login_register">
                                                    {locale === 'ar' ? "تسجيل الدخول / التسجيل" : "Login / Register"}
                                                    </Link>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <Link className="header-tools__item" href={`/${locale}/store-locator`}><IoLocationOutline size={20} /></Link>
                                <a onClick={() => openCart()} className="header-tools__item header-tools__cart js-open-aside">
                                    <svg className="d-block" width="20" height="20" viewBox="0 0 20 20" fill="none"><use href="#icon_cart" /></svg>
                                    <span className="cart-amount d-block position-absolute js-cart-items-count"><CartLength /></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom navigation */}
                    <div className="header-bottom">
                        <div className="container">
                            <nav className="navigation w-100 d-flex align-items-center justify-content-center py-2">
                                <ul className="navigation__list list-unstyled d-flex my-1">
                                    <Nav categoriesSubCategories={categoriesSubCategories} />
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
