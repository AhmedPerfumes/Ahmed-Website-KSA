"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import "./BlogCTAAndPopup.css";

export default function BlogPopup({ blog, locale: propLocale }) {
  const currentLocale = useLocale();
  const locale = propLocale || currentLocale || "en";
  const isAr = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Defaults and backend values
  const blogId = blog?.id || "default";
  const storageKey = `ahmed_blog_popup_seen_${blogId}`;

  // Image: backend or default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ksaadmin.ahmedalmaghribi.com/";
  const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  const popupImage = blog?.image
    ? `${normalizedApiUrl}storage/${blog.image}`
    : "/assets/images/blog/blog-1.jpg";

  // Title: backend or default
  const popupTitle =
    blog?.name ||
    blog?.title ||
    (isAr
      ? "اكتشف تشكيلة عطور أحمد المغربي"
      : "Discover Ahmed Al Maghribi Perfumes");

  // Description: backend or default
  const popupDesc =
    blog?.description ||
    (isAr
      ? "استكشف أرقى العطور الشرقية والفرنسية والعود الأصيل المصنوعة بشغف لتمنحك حضوراً لا يُنسى."
      : "Explore our collection of authentic oriental and French fragrances crafted for distinction.");

  // CTA Link: backend or default
  const rawLink = blog?.link ? String(blog.link).trim() : "";
  let targetUrl = `/${locale}/shop`;
  let isExternal = false;

  if (rawLink) {
    if (rawLink.startsWith("http://") || rawLink.startsWith("https://")) {
      targetUrl = rawLink;
      isExternal = true;
    } else {
      const cleanPath = rawLink.startsWith("/") ? rawLink : `/${rawLink}`;
      if (cleanPath.startsWith("/ar/") || cleanPath.startsWith("/en/")) {
        targetUrl = cleanPath;
      } else {
        targetUrl = `/${locale}${cleanPath}`;
      }
    }
  }

  // Button text
  const buttonText = isAr ? "تسوق الآن" : "Shop Now";

  // Trigger popup once per session per blog
  const triggerPopup = useCallback(() => {
    if (hasTriggeredRef.current) return;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch (_) {}

    hasTriggeredRef.current = true;
    setIsOpen(true);
  }, [storageKey]);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (_) {}
  }, [storageKey]);

  useEffect(() => {
    // Trigger when user scrolls a few percentage down (>= 15% scroll depth or 250px)
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;

      if (scrollable > 0) {
        const scrollPercentage = (scrollTop / scrollable) * 100;
        if (scrollPercentage >= 15) {
          triggerPopup();
        }
      } else if (scrollTop >= 250) {
        triggerPopup();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Escape key to close
    const handleKeyDown = (e) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerPopup, dismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="blog-popup-overlay"
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="blog-popup-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="blog-popup-close"
          onClick={dismiss}
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="blog-popup-grid">
          {/* Image Column */}
          <div className="blog-popup-image-wrap">
            <img
              src={popupImage}
              alt={popupTitle}
              className="blog-popup-img"
              loading="lazy"
            />
          </div>

          {/* Content Column */}
          <div className="blog-popup-body">
            <h3 className="blog-popup-title">{popupTitle}</h3>

            <p className="blog-popup-desc">{popupDesc}</p>

            <div className="blog-popup-actions">
              <a
                href={targetUrl}
                className="blog-popup-btn-primary"
                onClick={dismiss}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span>{buttonText}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: isAr ? "scaleX(-1)" : "none" }}
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <button
                type="button"
                className="blog-popup-dismiss-text"
                onClick={dismiss}
              >
                {isAr ? "متابعة القراءة" : "Continue Reading"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

