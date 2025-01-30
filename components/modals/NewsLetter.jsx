"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import VideoPanel from "../VideoPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function NewsLetter() {
  const modalElement = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const locale = useLocale();
  let modalInstance = null;

  useEffect(() => {
    const bootstrap = require("bootstrap");

    // Initialize Bootstrap Modal
    modalInstance = new bootstrap.Modal(modalElement.current, {
      keyboard: false,
    });

    // Function to show the modal
    const showModal = () => {
      if (!hasScrolled) {
        modalInstance.show();
        setHasScrolled(true);
      }
    };

    // Handle scroll event
    const handleScroll = () => {
      if (window.scrollY > 3500 && !hasScrolled) {
        showModal();
      }
    };

    // Add event listener for close button
    const closeButton = modalElement.current.querySelector(".btn-close");
    closeButton.addEventListener("click", () => {
      modalInstance.hide(); // Programmatically hide the modal
    });

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listeners on unmount
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
          {/* Explicit close button handling */}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
          ></button>
          <div className="row p-0 m-0">
            <div className="col-md-8 p-0">
              <div className="newsletter-popup__bg h-100 w-100">
                <Link href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`}>
                <Image
                  width={550}
                  height={650}
                  style={{ height: "fit-content" }}
                  loading="lazy"
                  src="/assets/images/home/demo8/zumar.jpg"
                  className="h-100 w-100 object-fit-cover d-block"
                  alt="image"
                  />
                  </Link>
                {/* <VideoPanel src="/assets/videos/popup video.mp4" section='hundred'/> */}
              </div>
            </div>
            <div className="col-md-4 p-0 d-flex align-items-center text-center">
              <div className="block-newsletter w-100">
              <h3 className="section-title fw-normal mb-3 pb-2" style={{ color: '#cfa91a' }}>
                  Zumar
                </h3>
                <p>
                Zumar is a truly luxurious scent crafted for those who embrace elegance and sophistication, making it an essential addition to the collection of any perfume connoisseur.
                  {/* <b className="sub-title">Don't miss out.</b> */}

                </p>
                <a
                  className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                  href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`}
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
