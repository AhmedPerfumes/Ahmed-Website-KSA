"use client";
import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { openModalUserlogin } from "@/utlis/aside";
import Link from "next/link";
import React from "react";
import { useLocale } from "next-intl";

/**
 * MobileFooter1 — fixed bottom nav bar for mobile.
 *
 * 4 tabs: Home | Shop | Cart | Account
 * - Account: if logged in → link to order-complete/account page
 *            if not logged in → opens the CustomerLogin aside modal
 */
export default function MobileFooter1() {
    const locale = useLocale();
    const { cartProducts } = useContextElement();
    const { isLoggedIn } = useUser();

    return (
        <footer
            className="footer-mobile container w-100 px-5 d-md-none bg-body position-fixed footer-mobile_initialized"
        >
            <div className="row text-center">
                {/* Home */}
                <div className="col-3">
                    <a
                        href="/"
                        className="footer-mobile__link d-flex flex-column align-items-center"
                    >
                        <svg
                            className="d-block"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <use href="#icon_home" />
                        </svg>
                        <span>Home</span>
                    </a>
                </div>

                {/* Shop */}
                <div className="col-3">
                    <Link
                        href={`/${locale}/shop`}
                        className="footer-mobile__link d-flex flex-column align-items-center"
                    >
                        <svg
                            className="d-block"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <use href="#icon_gift" />
                        </svg>
                        <span>Shop</span>
                    </Link>
                </div>

                {/* Cart */}
                <div className="col-3">
                    <Link
                        href={`/${locale}/shop-cart`}
                        className="footer-mobile__link d-flex flex-column align-items-center"
                    >
                        <div className="position-relative">
                            <svg
                                className="d-block"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <use href="#icon_cart"></use>
                            </svg>
                            {cartProducts.length > 0 && (
                                <span className="wishlist-amount d-block position-absolute js-wishlist-count">
                                    {cartProducts.length}
                                </span>
                            )}
                        </div>
                        <span>Cart</span>
                    </Link>
                </div>

                {/* Account / Login */}
                <div className="col-3">
                    {isLoggedIn ? (
                        <Link
                            href={`/${locale}/shop-order-complete`}
                            className="footer-mobile__link d-flex flex-column align-items-center"
                            id="mobile-footer-account-link"
                        >
                            <svg
                                className="d-block"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            <span>Account</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={openModalUserlogin}
                            className="footer-mobile__link d-flex flex-column align-items-center border-0 bg-transparent p-0 w-100"
                            id="mobile-footer-login-btn"
                            aria-label="Login to your account"
                        >
                            <svg
                                className="d-block"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}