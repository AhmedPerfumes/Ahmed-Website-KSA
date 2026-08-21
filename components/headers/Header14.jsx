"use client";
import Link from "next/link";
import CartLength from "./components/CartLength";
import Nav from "./components/Nav";
import { openCart } from "@/utlis/openCart";
import User from "./components/User";
import UserLoggedIn from "./components/UserLoggedIn";
import { currencyOptions, languageOptions2 } from "@/data/footer";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { useMenu } from "../../context/MenuContext";
import { useUser } from "../../context/UserContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../../i18n/routing";
import { renderPrice } from "@/utlis/priceRenderer";
import Skeleton from "@mui/material/Skeleton";

const headerStyles = `
/* ─── Core Header ─── */
.header { position: relative; z-index: 1040; background-color: white; }

/* ─── Top Announcement Bar ─── */
.header-marquee-bar {
    height: 2rem !important;
    background-color: #000;
    overflow: hidden;
}
.header-marquee-bar .marquee-track a {
    font-size: 11px !important;
    letter-spacing: 0.05em;
}

/* ─── Middle Row ─── */
.header-middle { border-bottom: 1px solid rgba(0,0,0,0.06); }
.header-middle .container-fluid { padding-top: 0.35rem; padding-bottom: 0.35rem; }

/* Select Dropdowns */
.heeader-top__right .form-select {
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    padding: 3px 22px 3px 6px;
    color: #444;
    background-color: transparent;
    transition: color 0.25s ease;
    cursor: pointer;
}
.heeader-top__right .form-select:hover { color: #111; }
.heeader-top__right .form-select:focus { box-shadow: none; outline: none; }

/* Logo — Reduced & Sleek */
.logo a { display: flex; align-items: center; justify-content: center; transition: opacity 0.3s ease; }
.logo a:hover { opacity: 0.8; }
.header-middle .logo img {
    width: 70px !important;
    height: 70px !important;
    object-fit: contain;
    transition: width 0.2s ease, height 0.2s ease;
}

/* Header Tools Icons */
.header-tools__item {
    transition: color 0.25s ease, transform 0.25s ease;
    color: #333;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.header-tools__item:hover {
    color: #a67b30;
}

/* ─── Search ─── */
.search-popup {
    position: absolute;
    top: 133%;
    left: 0;
    width: 100%;
    padding-top: 1rem;
    padding-bottom: 2rem;
    border-top: 1px solid #e4e4e4;
    background-color: #ffffff;
    box-shadow: 0 0.625rem 1.5625rem 0 rgba(0, 0, 0, 0.05);
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
    transition: opacity 0.4s ease, transform 0.4s ease;
    z-index: 1200;
}
.js-content_visible .search-popup { opacity: 1; transform: translateY(0); pointer-events: auto; }
.js-content_hidden .search-popup { opacity: 0; transform: translateY(-50px); pointer-events: none; }
.search-minimal { margin-left: auto; }
[dir="rtl"] .search-minimal { margin-left: 0; margin-right: auto; }
.search-minimal form { width: 200px; }
.search-minimal .form-control {
    border: 1px solid #e8e8e8;
    border-bottom: 1.5px solid #222;
    border-radius: 0;
    padding: 6px 36px 6px 12px;
    height: 34px;
    font-size: 12px;
    letter-spacing: 0.05em;
    box-shadow: none;
    outline: none;
    transition: border-color 0.3s ease, background-color 0.3s ease;
    background-color: #fafafa;
}
[dir="rtl"] .search-minimal .form-control {
    padding: 6px 12px 6px 36px;
}
.search-minimal .form-control::placeholder { color: #999; font-weight: 500; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.1em; }
.search-minimal .form-control:focus { border-color: #ddd; border-bottom-color: #a67b30; background-color: #fff; }
.search-minimal .search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    pointer-events: none;
    transition: color 0.3s ease;
}
[dir="rtl"] .search-minimal .search-icon {
    right: auto;
    left: 10px;
}
.search-minimal .form-control:focus ~ .search-icon { color: #a67b30; }
.search-popup__close {
    position: absolute;
    top: 10px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #333;
    z-index: 5;
}
[dir="rtl"] .search-popup__close {
    right: auto;
    left: 12px;
}
.search-popup__close:hover { color: #000; }
.search-popup__results {
    max-height: 420px;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 20px 25px rgba(0, 0, 0, 0.1);
    margin-top: 12px;
}
.search-results__footer {
    padding: 10px 12px;
    background-color: #fcfcfc;
    border-top: 1px solid #eee;
    position: sticky;
    bottom: 0;
    z-index: 10;
}
.view-all-btn {
    display: block;
    width: 100%;
    padding: 9px;
    background-color: #111;
    color: #fff !important;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 4px;
    transition: all 0.3s ease;
}
.view-all-btn:hover {
    background-color: #a67b30;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.suggestion-item {
    transition: background 0.2s ease;
    border-bottom: 1px solid #f0f0f0;
    padding: 10px 18px;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background-color: #f9f9f9; }
.suggestion-image {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
}
.suggestion-name {
    font-size: 13.5px;
    font-weight: 500;
    color: #111;
    margin-bottom: 2px;
    display: block;
}
.suggestion-price {
    font-size: 12.5px;
    color: #a67b30;
    font-weight: 600;
}
.search-suggestion-title {
    padding: 12px 18px 4px;
    font-size: 11px;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 1px;
}

/* ─── Bottom Navigation ─── */
.header-bottom {
    border-top: 1px solid rgba(0,0,0,0.04);
    background: #fff;
    transition: all 0.1s ease;
}
.header-bottom .navigation {
    padding: 0 !important;
}
.header-bottom .navigation__list {
    gap: 0;
    white-space: nowrap;
    margin: 0 !important;
}
.navigation__list > li > a,
.navigation__list > li > .menu-link,
.navigation__list > li > .navigation__link {
    position: relative;
    padding: 9px 15px;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 500;
    color: #333;
    transition: color 0.25s ease;
    white-space: nowrap;
}
.navigation__list > li > a:hover,
.navigation__list > li > .menu-link:hover,
.navigation__list > li > .navigation__link:hover {
    color: #a67b30;
}
/* Animated underline on hover */
.navigation__list > li > a::after,
.navigation__list > li > .menu-link::after,
.navigation__list > li > .navigation__link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: #a67b30;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.navigation__list > li > a:hover::after,
.navigation__list > li > .menu-link:hover::after,
.navigation__list > li > .navigation__link:hover::after,
.navigation__list > li.active > a::after,
.navigation__list > li > a.menu-active::after,
.navigation__list > li.active > .navigation__link::after,
.navigation__list > li > .navigation__link.menu-active::after {
    width: 60%;
}

/* ─── Mega Menu Adjustments (Compact & Proportionate) ─── */
.mega-menu {
    padding: 1.25rem 0 1.5rem !important;
    background: #ffffff !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
}
.mega-menu .container {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    gap: 2.5rem !important;
}
.mega-menu .col:not(.mega-menu__media) {
    flex: 0 0 auto !important;
    min-width: 180px !important;
    max-width: 240px !important;
    padding-right: 0 !important;
}
.mega-menu .sub-menu__title {
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: #a67b30 !important;
    margin-bottom: 0.5rem !important;
}
.mega-menu .sub-menu__list {
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
}
.mega-menu .sub-menu__item {
    margin: 0 !important;
}
.mega-menu .sub-menu__item .menu-link,
.mega-menu .sub-menu__item a {
    font-size: 12px !important;
    font-weight: 500 !important;
    letter-spacing: 0.03em !important;
    color: #222 !important;
    padding: 2px 0 !important;
    text-transform: uppercase !important;
    transition: color 0.2s ease, transform 0.2s ease !important;
    display: inline-block !important;
}
.mega-menu .sub-menu__item .menu-link:hover,
.mega-menu .sub-menu__item a:hover {
    color: #a67b30 !important;
    transform: translateX(3px) !important;
}
[dir="rtl"] .mega-menu .sub-menu__item .menu-link:hover,
[dir="rtl"] .mega-menu .sub-menu__item a:hover {
    transform: translateX(-3px) !important;
}
.mega-menu .col.mega-menu__media,
.mega-menu .mega-menu__media {
    flex: 0 0 auto !important;
    width: auto !important;
    max-width: 250px !important;
    border-radius: 6px !important;
    overflow: hidden !important;
    padding-right: 0 !important;
}
.mega-menu .mega-menu__img {
    width: 250px !important;
    height: 140px !important;
    max-height: 140px !important;
    object-fit: cover !important;
    border-radius: 6px !important;
    display: block !important;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.mega-menu .mega-menu__media:hover .mega-menu__img {
    transform: scale(1.04) !important;
}

/* ─── Natively Sticky Header Bottom (stays on scroll) ─── */
.header-bottom-wrapper {
    position: sticky;
    top: -1px;
    z-index: 1001;
    background: #fff;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
    will-change: background-color, box-shadow;
}

.header-bottom-wrapper.is-stuck {
    background: #ffffff;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-bottom {
    background: transparent;
    border-top: none;
}

.header-bottom-wrapper .container {
    max-width: 100%;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    display: flex;
    justify-content: center;
    position: relative;
}

.sticky-logo {
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-start: 1.5rem;
}
.sticky-logo img {
    width: 34px !important;
    height: 34px !important;
    object-fit: contain;
}

.sticky-actions {
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-end: 1.5rem;
    justify-content: flex-end;
}

.header-bottom-wrapper.is-stuck .sticky-logo,
.header-bottom-wrapper.is-stuck .sticky-actions {
    opacity: 1;
    pointer-events: auto;
}

.sticky-actions .header-tools__item {
    font-size: 17px;
    color: #333;
    transition: color 0.3s ease;
    white-space: nowrap;
}

.sticky-actions .header-tools__item:hover {
    color: #a67b30;
}

/* ─── Laptop & Desktop Responsive Scaling ─── */
@media (max-width: 1550px) {
    .header-middle .logo img {
        width: 65px !important;
        height: 65px !important;
    }
    .navigation__list > li > a,
    .navigation__list > li > .menu-link,
    .navigation__list > li > .navigation__link {
        padding: 8px 10px;
        font-size: 11.5px;
        letter-spacing: 0.03em;
    }
    .search-minimal form {
        width: 185px;
    }
    .marquee-container {
        width: 50% !important;
    }
}

@media (max-width: 1366px) {
    .header-middle .logo img {
        width: 60px !important;
        height: 60px !important;
    }
    .header-middle .container-fluid {
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
    }
    .navigation__list > li > a,
    .navigation__list > li > .menu-link,
    .navigation__list > li > .navigation__link {
        padding: 7px 7px;
        font-size: 11px;
        letter-spacing: 0.02em;
    }
    .header-bottom-wrapper .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .sticky-logo {
        inset-inline-start: 1rem;
    }
    .sticky-actions {
        inset-inline-end: 1rem;
    }
    .search-minimal form {
        width: 175px;
    }
    .marquee-container {
        width: 55% !important;
    }

    /* Mega Menu on Laptops */
    .mega-menu {
        padding: 1rem 0 1.25rem !important;
    }
    .mega-menu .container {
        gap: 1.75rem !important;
    }
    .mega-menu .col.mega-menu__media,
    .mega-menu .mega-menu__media {
        max-width: 200px !important;
    }
    .mega-menu .mega-menu__img {
        width: 200px !important;
        height: 115px !important;
        max-height: 115px !important;
    }
    .mega-menu .sub-menu__item .menu-link,
    .mega-menu .sub-menu__item a {
        font-size: 11.5px !important;
    }
}

@media (max-width: 1200px) {
    .header-middle .logo img {
        width: 55px !important;
        height: 55px !important;
    }
    .navigation__list > li > a,
    .navigation__list > li > .menu-link,
    .navigation__list > li > .navigation__link {
        padding: 7px 4px;
        font-size: 10.5px;
        letter-spacing: 0.01em;
    }
    .header-bottom-wrapper .container {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }
    .sticky-logo {
        inset-inline-start: 0.75rem;
    }
    .sticky-actions {
        inset-inline-end: 0.75rem;
    }
    .search-minimal form {
        width: 160px;
    }
    .marquee-container {
        width: 65% !important;
    }
}

@media (max-width: 1050px) {
    .navigation__list > li > a,
    .navigation__list > li > .menu-link,
    .navigation__list > li > .navigation__link {
        padding: 6px 3px;
        font-size: 10px;
        letter-spacing: 0;
    }
    .search-minimal form {
        width: 150px;
    }
    .marquee-container {
        width: 75% !important;
    }
    .sticky-logo img {
        width: 30px !important;
        height: 30px !important;
    }

    /* Mega Menu on Small Laptops */
    .mega-menu {
        padding: 0.85rem 0 1rem !important;
    }
    .mega-menu .container {
        gap: 1.25rem !important;
    }
    .mega-menu .col.mega-menu__media,
    .mega-menu .mega-menu__media {
        max-width: 165px !important;
    }
    .mega-menu .mega-menu__img {
        width: 165px !important;
        height: 95px !important;
        max-height: 95px !important;
    }
    .mega-menu .sub-menu__item .menu-link,
    .mega-menu .sub-menu__item a {
        font-size: 11px !important;
    }
}

@media (max-width: 991px) {
    .header-desk_type_8,
    .header-bottom-wrapper {
        display: none !important;
    }
}
`;

const marqueeStyles = `
    @keyframes marquee-ltr {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
    @keyframes marquee-rtl {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
    }
    .marquee-container {
        overflow: hidden; 
        white-space: nowrap;
        width: 40%;
        height: 100%;
        margin: 0 auto;
        position: relative;
    }
    .marquee-track {
        display: flex;
        align-items: center;
        width: fit-content;
        will-change: transform;
        font-family: "Kanit-Regular", sans-serif;
    }
    .marquee-track:hover {
        animation-play-state: paused;
    }
    .suggestion-price-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
    }
    .price-old {
        text-decoration: line-through;
        color: #999;
        font-weight: 400;
    }
    .price-new {
        color: #a67b30;
        font-weight: 700;
    }
`;

const HeaderSkeleton = () => {
    const t = useTranslations();
    const locale = useLocale();

    const handleLangChange = (e) => {
        const newLocale = e.target.value;
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; SameSite=Lax`;
        const currentPath = window.location.pathname;
        const localeRegex = new RegExp(`^/${locale}`);
        let newPath;
        if (localeRegex.test(currentPath)) {
            newPath = currentPath.replace(localeRegex, `/${newLocale}`);
        } else {
            const cleanPath = currentPath === "/" ? "" : currentPath;
            newPath = `/${newLocale}${cleanPath}`;
        }
        window.location.href = newPath;
    };

    return (
        <div className="header bg-white">
            {/* Top Bar Skeleton */}
            <div className="bg-black" style={{ height: "2rem" }}>
                <div className="container h-100 d-flex align-items-center justify-content-center">
                    <Skeleton 
                        variant="text" 
                        width={260} 
                        height={18} 
                        sx={{ bgcolor: "rgba(255,255,255,0.2)" }} 
                    />
                </div>
            </div>

            {/* Middle Bar Skeleton */}
            <div className="header-middle border-bottom">
                <div className="container-fluid d-flex align-items-center px-4 px-xl-5 py-1">
                    {/* Left: Currency/Language */}
                    <div className="flex-1 d-flex gap-3">
                        <select className="form-select form-select-sm bg-transparent color-black" name="store-currency" onChange={(e) => window.open(e.target.value, "_blank")}>
                            {currencyOptions.map((option, index) => (
                                <option key={index} value={option.link} >
                                    {t(option.text)}
                                </option>
                            ))}
                        </select>
                        <select className="form-select form-select-sm bg-transparent text-dark border-0" name="store-language" value={locale} onChange={handleLangChange} style={{ cursor: "pointer", outline: "none" }}>
                            {languageOptions2.map((option, index) => (
                                <option key={index} value={option.value} >
                                    {option.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Center: Logo */}
                    <div className="logo">
                        <Link href="/">
                            <Image
                                loading="eager"
                                src="/assets/images/logo/Desktop.svg"
                                width="70"
                                height="70"
                                alt="Ahmed Al Maghribi"
                            />
                        </Link>
                    </div>

                    {/* Right: Search & Tools */}
                    <div className="header-tools d-flex align-items-center flex-1 justify-content-end gap-3">
                        <Skeleton variant="rounded" width={180} height={32} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} className="d-none d-lg-block" />
                        <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
                        <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
                        <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
                    </div>
                </div>
            </div>

            {/* Bottom Bar Skeleton */}
            <div className="header-bottom border-top d-none d-lg-block">
                <div className="container d-flex justify-content-center py-2" style={{ gap: "2.5rem" }}>
                    {[...Array(8)].map((_, i) => (
                        <Skeleton 
                            key={i} 
                            variant="text" 
                            width={65} 
                            height={24} 
                            sx={{ bgcolor: "rgba(0,0,0,0.05)" }} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Header14() {
    const locale = useLocale();
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn } = useUser();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const [couponCount, setCouponCount] = useState(0);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const items = [
        {
            href: "/account_dashboard",
            label: locale === "ar" ? "ملفي الشخصي" : "My Profile",
        },
        {
            href: "/account_orders",
            label: locale === "ar" ? "مشترياتي" : "My Purchases",
        },
        {
            href: "/account_edit_address",
            label: locale === "ar" ? "العناوين" : "Addresses",
        },
        {
            href: "/account_coupons",
            label: locale === "ar" ? "كوبوناتي" : "My Coupons",
        },
        {
            href: "/account_loyalty",
            label: locale === "ar" ? "نقاط الولاء" : "Loyalty Points",
        },
    ];

    const isActive = (href) => pathname === href || pathname.startsWith(href);

    // --- Fetch coupon count if logged in (KSA) ---
    useEffect(() => {
        if (!isLoggedIn) return setCheckingAuth(false);

        const rawUser = localStorage.getItem("user");
        if (!rawUser) return setCheckingAuth(false);

        let user = null;
        try {
            user = JSON.parse(atob(rawUser));
        } catch (err) {
            console.error("Failed to decode user from localStorage", err);
            return setCheckingAuth(false);
        }

        if (!user?.phone && !user?.mobile && !user?.email) return setCheckingAuth(false);

        const fetchCouponCount = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/Count`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            salesType: "EComm",
                            company: "KSA",
                            mobileNo: user.phone || user.mobile || "",
                            email: user.email || "",
                        }),
                    }
                );
                const result = await response.json();
                if (result?.data !== undefined) setCouponCount(result.data);
            } catch (err) {
                console.error("Error fetching coupon count:", err);
            } finally {
                setCheckingAuth(false);
            }
        };

        fetchCouponCount();
    }, [isLoggedIn, router]);

    // --- Search suggestions debounce ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchKeyWord.trim().length < 2) {
                setSearchSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}api/search-suggestions?keyword=${encodeURIComponent(searchKeyWord)}`
                );
                const result = await response.json();
                if (result.success) {
                    setSearchSuggestions(result.data || []);
                }
            } catch (err) {
                console.error("Search suggestion error:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchKeyWord]);

    // --- Scroll listener: track when header is scrolled past ---
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 100);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- Search popup overflow lock & escape key ---
    useEffect(() => {
        document.body.style.overflow = isPopupOpen ? "hidden" : "auto";
    }, [isPopupOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setIsPopupOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        if (isPopupOpen && inputRef.current) inputRef.current.focus();
    }, [isPopupOpen]);

    // --- Search handler ---
    const handleChange = (e) => setSearchKeyWord(e.target.value);
    const onSearch = (event) => {
        event.preventDefault();
        const cleanedKeyword = removeSpecialCharactersAndAmp(searchKeyWord)
            .split(" ")
            .join("-");
        window.location.href = `/${locale}/shop?q=${cleanedKeyword}`;
    };

    function removeSpecialCharactersAndAmp(str) {
        let cleanedStr = str.replace(/&amp;/g, "");
        cleanedStr = cleanedStr.replace(/[^\w\s-]/g, "");
        return cleanedStr.replace(/\s+/g, " ").trim();
    }

    // --- Logout ---
    const handleLogout = (e) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        router.replace("/login_register");
        setTimeout(() => window.location.reload(), 50);
    };

    // --- Language change ---
    const handleLangChange = (e) => {
        const newLocale = e.target.value;
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; SameSite=Lax`;
        const currentPath = window.location.pathname;
        const localeRegex = new RegExp(`^/${locale}`);
        let newPath;
        if (localeRegex.test(currentPath)) {
            newPath = currentPath.replace(localeRegex, `/${newLocale}`);
        } else {
            const cleanPath = currentPath === "/" ? "" : currentPath;
            newPath = `/${newLocale}${cleanPath}`;
        }
        window.location.href = newPath;
    };

    // --- Menu context ---
    const {
        categoriesSubCategories,
        top_header,
        topHeader,
        isLoading: isMenuLoading,
        error,
        currency,
    } = useMenu();

    const topHeaderList = top_header || topHeader || [];

    if (isMenuLoading) return <HeaderSkeleton />;
    if (error) return <div>{error}</div>;

    return (
        <>
            <style>
                {headerStyles} {marqueeStyles}
            </style>
            <header id="header" className="header bg-white">
                {/* Top Announcement Marquee */}
                {topHeaderList.length > 0 && (
                    <div className="header-marquee-bar">
                        <div
                            className="marquee-container d-flex align-items-center"
                            dir="ltr"
                        >
                            <div
                                className="marquee-track"
                                style={{
                                    animation:
                                        locale === "ar"
                                            ? "marquee-rtl 90s linear infinite"
                                            : "marquee-ltr 90s linear infinite",
                                    height: "100%",
                                }}
                            >
                                {[...Array(20)].map((_, idx) =>
                                    topHeaderList.map((elm, i) => (
                                        <span
                                            key={`${idx}-${i}`}
                                            className="d-flex align-items-center"
                                        >
                                            <Link
                                                href={`/${locale}/${elm.color || ""}`}
                                                className="text-white text-decoration-none text-uppercase fw-bold mx-4 mx-xl-5"
                                                style={{
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {t(
                                                    elm.title
                                                        .split(" ")
                                                        .slice(0, 13)
                                                        .join(" ")
                                                )}
                                            </Link>
                                            <span className="text-white opacity-50">
                                                -
                                            </span>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Popup Modal */}
                <div
                    ref={containerRef}
                    className={`header-tools__item hover-container ${
                        isPopupOpen ? "js-content_visible" : "js-content_hidden"
                    }`}
                >
                    <div className="search-popup js-hidden-content">
                        <button
                            type="button"
                            className="btn-close search-popup__close"
                            aria-label="Close"
                            onClick={() => setIsPopupOpen(false)}
                        >
                            ✕
                        </button>
                        <form
                            onSubmit={onSearch}
                            className="search-field container"
                        >
                            <p className="text-uppercase text-secondary fw-medium mb-3">
                                {t("title")}
                            </p>
                            <div className="position-relative">
                                <input
                                    ref={inputRef}
                                    className="search-field__input search-popup__input w-100 fw-medium"
                                    type="text"
                                    name="search-keyword"
                                    placeholder={t("Search Products")}
                                    value={searchKeyWord}
                                    onChange={handleChange}
                                    style={{
                                        paddingLeft:
                                            locale === "ar" ? "3rem" : "1rem",
                                        paddingRight:
                                            locale === "ar" ? "1rem" : "3rem",
                                        textAlign:
                                            locale === "ar" ? "right" : "left",
                                    }}
                                />
                                <button
                                    className="btn-icon search-popup__submit"
                                    type="submit"
                                    style={{
                                        right: locale === "ar" ? "auto" : "0",
                                        left: locale === "ar" ? "0" : "auto",
                                        position: "absolute",
                                        top: "0",
                                        height: "100%",
                                    }}
                                >
                                    <svg
                                        className="d-block"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                    >
                                        <use href="#icon_search" />
                                    </svg>
                                </button>
                                <button
                                    className="btn-icon btn-close-lg search-popup__reset"
                                    type="reset"
                                    onClick={() => setSearchKeyWord("")}
                                ></button>
                            </div>
                            <div className="search-popup__results">
                                {/* Loading State */}
                                {isSearching && (
                                    <div className="p-4 text-center">
                                        <div
                                            className="spinner-border spinner-border-sm text-dark me-2"
                                            role="status"
                                        ></div>
                                        <span className="fs-14">
                                            {t("Searching...")}
                                        </span>
                                    </div>
                                )}

                                {/* Results List */}
                                {!isSearching && searchSuggestions.length > 0 && (
                                    <div className="search-suggestion">
                                        <h6 className="search-suggestion-title">
                                            {t("Product Results")}
                                        </h6>
                                        <ul className="list-unstyled mb-0">
                                            {searchSuggestions.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="suggestion-item"
                                                >
                                                    <Link
                                                        href={`/${locale}${item.url_path}`}
                                                        className="d-flex align-items-center gap-3 text-decoration-none"
                                                        onClick={() =>
                                                            setIsPopupOpen(false)
                                                        }
                                                    >
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${item.image}`}
                                                            alt={item.name}
                                                            className="suggestion-image"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "/assets/images/placeholder.png";
                                                            }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <span className="suggestion-name">{item.name}</span>
                                                            <div className="suggestion-price-wrapper">
                                                                {renderPrice(item, currency)}
                                                            </div>
                                                        </div>
                                                        <div className="text-secondary">
                                                            <svg
                                                                width="12"
                                                                height="12"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path d="M9 18l6-6-6-6" />
                                                            </svg>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="search-results__footer">
                                            <Link
                                                href={`/${locale}/shop?q=${searchKeyWord}`}
                                                className="view-all-btn"
                                                onClick={() => setIsPopupOpen(false)}
                                            >
                                                {t("View All Results")} ({searchSuggestions.length}+)
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* No Results Found */}
                                {!isSearching &&
                                    searchKeyWord.length > 2 &&
                                    searchSuggestions.length === 0 && (
                                        <div className="p-4 text-center text-muted fs-14">
                                            {t("No products found for")} "{searchKeyWord}"
                                        </div>
                                    )}

                                {/* Default Quicklinks */}
                                {searchKeyWord.length === 0 && (
                                    <div className="p-3 p-xl-4">
                                        <h6 className="sub-menu__title fs-base">
                                            {t("Quicklinks")}
                                        </h6>
                                        <ul className="sub-menu__list list-unstyled">
                                            <li className="sub-menu__item">
                                                <Link
                                                    href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`}
                                                    className="menu-link menu-link_us-s"
                                                >
                                                    {t("Zumar")}
                                                </Link>
                                            </li>
                                            <li className="sub-menu__item">
                                                <Link
                                                    href={`/${locale}/shop/perfumes/oriental-fragrance/marj`}
                                                    className="menu-link menu-link_us-s"
                                                >
                                                    {t("Marj")}
                                                </Link>
                                            </li>
                                            <li className="sub-menu__item">
                                                <Link
                                                    href={`/${locale}/shop/perfumes/occidental-fragrance/oud-roses`}
                                                    className="menu-link menu-link_us-s"
                                                >
                                                    {t("Oud & Roses")}
                                                </Link>
                                            </li>
                                            <li className="sub-menu__item">
                                                <Link
                                                    href={`/${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`}
                                                    className="menu-link menu-link_us-s"
                                                >
                                                    {t("Bin Shaikh")}
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Header Middle (Desktop & Laptop) */}
                <div className="header-desk_type_8">
                    <div className="header-middle">
                        <div className="container-fluid d-flex align-items-center px-3 px-xl-5">
                            {/* Left: Currency & Language Selects */}
                            <div className="flex-1 d-flex align-items-center gap-2 gap-xl-3">
                                <div className="heeader-top__right flex-1 d-flex gap-1">
                                    <select
                                        className="form-select form-select-sm bg-transparent color-black"
                                        name="store-currency"
                                        onChange={(e) =>
                                            window.open(
                                                e.target.value,
                                                "_blank"
                                            )
                                        }
                                    >
                                        {currencyOptions.map((option, index) => (
                                            <option
                                                key={index}
                                                value={option.link}
                                            >
                                                {t(option.text)}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="form-select form-select-sm bg-transparent text-dark border-0"
                                        name="store-language"
                                        value={locale}
                                        onChange={handleLangChange}
                                        style={{
                                            cursor: "pointer",
                                            outline: "none",
                                        }}
                                    >
                                        {languageOptions2.map((option, index) => (
                                            <option
                                                key={index}
                                                value={option.value}
                                            >
                                                {option.text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Center: Main Brand Logo */}
                            <div className="logo">
                                <Link href="/">
                                    <Image
                                        loading="lazy"
                                        src="/assets/images/logo/Desktop.svg"
                                        width={70}
                                        height={70}
                                        alt="Ahmed Al Maghribi"
                                    />
                                </Link>
                            </div>

                            {/* Right: Search, Account, Track, Locator, Cart */}
                            <div className="header-tools d-flex align-items-center flex-1 justify-content-end gap-2 gap-xl-3 me-1 me-xl-2">
                                <div className="d-none d-lg-flex search-minimal me-1 me-xl-2">
                                    <form
                                        onSubmit={onSearch}
                                        className="position-relative"
                                    >
                                        <input
                                            type="text"
                                            name="search-keyword"
                                            placeholder={t("SEARCH")}
                                            value={searchKeyWord}
                                            onChange={handleChange}
                                            onClick={() => setIsPopupOpen(true)}
                                            className="form-control"
                                        />
                                        <span className="search-icon">
                                            <svg
                                                width="17"
                                                height="17"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    cx="11"
                                                    cy="11"
                                                    r="6.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                />
                                                <line
                                                    x1="16"
                                                    y1="16"
                                                    x2="21"
                                                    y2="21"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </span>
                                    </form>
                                </div>

                                {/* Account Menu */}
                                <div className="header-tools__item hover-account position-relative">
                                    {!isLoggedIn ? (
                                        <Link
                                            href="/login_register"
                                            className="account-icon-link"
                                        >
                                            <User />
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/account_dashboard"
                                            className="account-icon-link"
                                            aria-haspopup="true"
                                        >
                                            <UserLoggedIn />
                                        </Link>
                                    )}
                                    <div
                                        className="account-hover-menu"
                                        role="menu"
                                        style={{
                                            left:
                                                locale === "ar" ? "0" : "auto",
                                            right:
                                                locale === "ar" ? "auto" : "0",
                                            minWidth: "190px",
                                        }}
                                    >
                                        {isLoggedIn ? (
                                            <>
                                                <div className="menu-title text-uppercase fw-medium text-start px-3 py-2 border-bottom">
                                                    {locale === "ar"
                                                        ? "إدارة الحساب"
                                                        : "Manage Account"}
                                                </div>
                                                <ul className="list-unstyled mb-0 text-start">
                                                    {items.map((it) => (
                                                        <li
                                                            key={it.href}
                                                            className={
                                                                isActive(it.href)
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                        >
                                                            <Link
                                                                href={it.href}
                                                                className="d-flex align-items-center justify-content-between px-3 py-2"
                                                            >
                                                                <span>
                                                                    {it.label}
                                                                </span>
                                                                {it.label
                                                                    .toLowerCase()
                                                                    .includes("coupon") &&
                                                                    couponCount > 0 && (
                                                                        <span
                                                                            className="badge rounded-pill bg-danger ms-2"
                                                                            style={{
                                                                                fontSize: "0.75rem",
                                                                                minWidth: "1.5rem",
                                                                                textAlign: "center",
                                                                                marginRight: locale === "ar" ? "0.5rem" : "0",
                                                                                marginLeft: locale === "ar" ? "0" : "0.5rem",
                                                                            }}
                                                                        >
                                                                            {couponCount}
                                                                        </span>
                                                                    )}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                    <li
                                                        className="divider border-top"
                                                        aria-hidden="true"
                                                    />
                                                    <li className="logout">
                                                        <a
                                                            href="#"
                                                            onClick={handleLogout}
                                                            className="text-danger fw-medium px-3 py-2 d-block"
                                                        >
                                                            {locale === "ar"
                                                                ? "تسجيل خروج"
                                                                : "Logout"}
                                                        </a>
                                                    </li>
                                                </ul>
                                            </>
                                        ) : (
                                            <ul className="list-unstyled mb-0 text-start">
                                                <li>
                                                    <Link href="/login_register" className="px-3 py-2 d-block">
                                                        {locale === "ar"
                                                            ? "تسجيل الدخول / التسجيل"
                                                            : "Login / Register"}
                                                    </Link>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Order Tracking */}
                                <Link
                                    className="header-tools__item"
                                    href={`/${locale}/order-tracking`}
                                    title={t("Track Order") || "Track Order"}
                                >
                                    <TbTruckDelivery size={21} strokeWidth={1.5} />
                                </Link>

                                {/* Store Locator */}
                                <Link
                                    className="header-tools__item"
                                    href={`/${locale}/store-locator`}
                                    title={t("Store Locator") || "Store Locator"}
                                >
                                    <IoLocationOutline size={18} />
                                </Link>

                                {/* Cart Icon */}
                                <a
                                    onClick={() => openCart()}
                                    className="header-tools__item header-tools__cart js-open-aside position-relative"
                                >
                                    <svg
                                        className="d-block"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                    >
                                        <use href="#icon_cart" />
                                    </svg>
                                    <span className="cart-amount d-block position-absolute js-cart-items-count">
                                        <CartLength />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bottom navigation: Natively sticky bar (stays fixed on scroll) */}
            <div className={`header-bottom-wrapper d-none d-lg-block ${isScrolled ? "is-stuck" : ""}`}>
                <div className="header-bottom">
                    <div className="container">
                        {/* Compact Logo (visible when scrolled) */}
                        <div className="sticky-logo align-items-center">
                            <Link href="/">
                                <Image
                                    src="/assets/images/logo/Desktop.svg"
                                    width={34}
                                    height={34}
                                    alt="Ahmed Al Maghribi"
                                    style={{ objectFit: "contain" }}
                                />
                            </Link>
                        </div>

                        {/* Centered Navigation */}
                        <nav className="navigation d-flex align-items-center justify-content-center py-2 w-100">
                            <ul className="navigation__list list-unstyled d-flex">
                                <Nav
                                    categoriesSubCategories={categoriesSubCategories}
                                />
                            </ul>
                        </nav>

                        {/* Sticky Action Icons (visible when scrolled) */}
                        <div className="sticky-actions d-flex align-items-center gap-3">
                            <Link
                                href={`/${locale}/order-tracking`}
                                className="header-tools__item d-none d-md-flex align-items-center justify-content-center"
                                title={t("Track Order") || "Track Order"}
                            >
                                <TbTruckDelivery size={20} strokeWidth={1.5} />
                            </Link>
                            <a
                                onClick={() => openCart()}
                                className="header-tools__item header-tools__cart js-open-aside position-relative d-flex align-items-center justify-content-center"
                                style={{ cursor: "pointer" }}
                            >
                                <svg
                                    className="d-block"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <use href="#icon_cart" />
                                </svg>
                                <span
                                    className="cart-amount d-block position-absolute js-cart-items-count"
                                    style={{ top: "-6px", right: "-8px" }}
                                >
                                    <CartLength />
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
