"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import VideoPanel from "../VideoPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMenu } from "@/context/MenuContext";

export default function NewsLetter() {
    const modalElement = useRef(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    const locale = useLocale();
    let modalInstance = null;
    const { popUp } = useMenu();

    useEffect(() => {
        const bootstrap = require("bootstrap");

        // Initialize Bootstrap Modal
        modalInstance = new bootstrap.Modal(modalElement.current, {
            keyboard: false,
        });

        // Show modal only once
        const showModal = () => {
            if (!hasScrolled) {
                modalInstance.show();
                setHasScrolled(true);
            }
        };

        // Scroll event
        const handleScroll = () => {
            if (window.scrollY > 2000 && !hasScrolled) {
                showModal();
            }
        };

        // Close button handler
        const closeButton = modalElement.current.querySelector(".btn-close");
        closeButton.addEventListener("click", () => modalInstance.hide());

        window.addEventListener("scroll", handleScroll);

        // Cleanup
        return () => {
            window.removeEventListener("scroll", handleScroll);
            closeButton.removeEventListener("click", () => modalInstance.hide());
        };
    }, [hasScrolled]);

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
                    {popUp.map((elm, i) => (
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
                                            src="/assets/images/new-user-signup.jpg"
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
                                        {elm.name}
                                    </h3>

                                    <p
                                        className="mb-3"
                                        style={{ fontSize: "1rem", color: "#333" }}
                                    >
                                        {elm.description}
                                    </p>

                                   {elm.content && (
    <div
        className="mb-4"
        style={{ fontSize: "0.95rem", color: "#555" }}
        dangerouslySetInnerHTML={{
            __html: elm.content.replace(/<\/?p>/g, ""),
        }}
    />
)}


                                    <div className="d-flex justify-content-center">
                                        <a
                                            className="btn-rounded btn-link_lg text-uppercase fw-medium hover-effect"
                                            href={`/${locale}/login_register?tab=register`}
                                        >
                                            Register
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
