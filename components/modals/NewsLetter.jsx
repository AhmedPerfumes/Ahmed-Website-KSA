"use client";

import Image from "next/image";
import { useEffect, useRef } from "react"; // No longer need useState
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";

export default function NewsLetter() {
    const modalElement = useRef(null);
    const locale = useLocale();
    const { popUp } = useMenu();
    const t = useTranslations();

    // --- NEW: Use a ref to track if the modal has been shown in this session ---
    // This avoids the stale state issue in the event listener.
    const hasShownThisSession = useRef(false);

    // --- Configuration Constants ---
    const POPUP_STORAGE_KEY = 'newsletterPopupLastShown';
    // const POPUP_COOLDOWN_PERIOD = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const POPUP_COOLDOWN_PERIOD = 30 * 60 * 1000;

    useEffect(() => {
        // --- 1. Check if the user is still in the cooldown period ---
        const lastShownTimestamp = localStorage.getItem(POPUP_STORAGE_KEY);
        const currentTime = new Date().getTime();

        if (lastShownTimestamp) {
            const timeSinceLastShown = currentTime - parseInt(lastShownTimestamp, 10);
            if (timeSinceLastShown < POPUP_COOLDOWN_PERIOD) {
                return; // Cooldown is active, so we do nothing.
            }
        }

        // --- 2. If cooldown is over, set up the modal and listener ---
        const bootstrap = require("bootstrap");
        let modalInstance = null;

        if (modalElement.current) {
            modalInstance = new bootstrap.Modal(modalElement.current, {
                keyboard: false,
            });
        } else {
            return;
        }

        const showModal = () => {
            if (modalInstance) {
                modalInstance.show();
                // Save the current time to localStorage to start the new cooldown
                localStorage.setItem(POPUP_STORAGE_KEY, new Date().getTime().toString());
            }
        };

        const handleScroll = () => {
            // Check scroll position AND if it has already been shown in this session
            if (window.scrollY > 2000 && !hasShownThisSession.current) {
                // --- CORRECTED LOGIC ---
                // 1. Immediately set the ref to true. This is critical.
                //    It ensures this block can never run again in this session.
                hasShownThisSession.current = true;
                
                // 2. Then, show the modal.
                showModal();
            }
        };

        const closeButton = modalElement.current.querySelector(".btn-close");
        const closeHandler = () => modalInstance.hide();

        window.addEventListener("scroll", handleScroll);
        closeButton.addEventListener("click", closeHandler);

        // Cleanup function
        return () => {
            window.removeEventListener("scroll", handleScroll);
            closeButton.removeEventListener("click", closeHandler);
        };
    }, []); // This effect correctly runs only once on mount.

    return (
        <div
            className="modal fade"
            id="newsletterPopup"
            ref={modalElement}
            tabIndex="-1"
            data-bs-backdrop="true"
            aria-hidden="true"
        >
            <div className="modal-dialog newsletter-popup modal-dialog-centered">
                <div className="modal-content">
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                    ></button>
                    {popUp?.map((elm, i) => (
                        <div className="row p-0 m-0" key={i}>
                            <div className="col-md-8 p-0">
                                <div className="newsletter-popup__bg w-100">
                                    <div className="d-none d-lg-block">
                                        <a
                                            href={`/${locale}/shop`}
                                            className="hover-effect"
                                        >
                                            <Image
                                                width={550}
                                                height={650}
                                                style={{ height: "fit-content" }}
                                                loading="lazy"
                                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`}
                                                className="h-100 w-100 object-fit-cover d-block"
                                                alt="image"
                                            />
                                        </a>
                                    </div>
                                    <div className="d-sm-block d-md-none">
                                        <Image
                                            width={550}
                                            height={650}
                                            style={{ height: "fit-content" }}
                                            loading="lazy"
                                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`}
                                            className="h-100 w-100 object-fit-cover d-block hover-effect"
                                            alt="image"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 p-0 d-flex align-items-center text-center">
                                <div className="block-newsletter w-100 px-3 py-4">
                                    <h3
                                        className="section-title fw-normal mb-3"
                                        style={{ color: "#5c6137" }}
                                    >
                                        {t(elm.name)}
                                    </h3>

                                    <p
                                        className="mb-3"
                                        style={{ fontSize: "1rem", color: "#333" }}
                                    >
                                        {t(elm.description)}
                                    </p>

                                    <div
                                        className="mb-4"
                                        style={{ fontSize: "0.95rem", color: "#555" }}
                                        dangerouslySetInnerHTML={{
                                            __html: elm.content?.replace(/<\/?p>/g, ""),
                                        }}
                                    />

                                    <div className="d-flex justify-content-center">
                                        <a
                                            className="btn-rounded btn-link_lg text-uppercase fw-medium hover-effect"
                                            href={`/${locale}/shop`}
                                        >
                                            {t("Shop Now")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}