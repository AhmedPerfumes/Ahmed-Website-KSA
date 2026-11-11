"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import BlogPopup from "./BlogPopup";
import "./BlogCTAAndPopup.css";

export default function BlogDetails({ blog, locale: propLocale }) {
  const currentLocale = useLocale();
  const locale = propLocale || currentLocale || "en";
  const isAr = locale === "ar";

  if (!blog || Object.keys(blog).length === 0) {
    return (
      <section className="blog-page blog-single container">
        <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">
          {isAr ? "لم يتم العثور على مقال" : "No Blog Found"}
        </h2>
      </section>
    );
  }

  // Calculate CTA Link (from backend if present, else shop page default)
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

  const blogTitle = blog.title || blog.name;
  const blogDate =
    blog.post_date != null
      ? new Date(blog.post_date).toLocaleDateString(isAr ? "ar-SA" : "en-US")
      : new Date(blog.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://ksaadmin.ahmedalmaghribi.com/";
  const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  const blogImage = blog.image
    ? `${normalizedApiUrl}storage/${blog.image}`
    : "/assets/images/blog/blog-1.jpg";

  return (
    <>
      <section className="blog-page blog-single container">
        <div className="mw-930">
          <h2 className="page-title">{blogTitle}</h2>
          <div className="blog-single__item-meta">
            <span className="blog-single__item-meta__date">{blogDate}</span>
            {blog.category_name && (
              <span className="blog-single__item-meta__category">
                {blog.category_name}
              </span>
            )}
          </div>
        </div>

        <div className="blog-single__item-content">
          <p>
            <Image
              loading="lazy"
              className="w-100 h-auto d-block"
              src={blogImage}
              width={1410}
              height={550}
              alt={blogTitle || "Blog Image"}
            />
          </p>

          <div className="mw-930">
            <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>

            {/* End-of-Blog CTA Card */}
            <div className="blog-end-cta">
              <h3 className="blog-end-cta__title">
                {isAr
                  ? "استكشف تشكيلة عطورنا الفاخرة"
                  : "Explore Our Luxury Perfume Collection"}
              </h3>
              <p className="blog-end-cta__desc">
                {isAr
                  ? "انغمس في نفحات شرقية وفرنسية آسرة، مصممة بأعلى معايير الإتقان لتناسب جميع لحظاتك الخاصة."
                  : "Discover captivating oriental and French fragrances, crafted with authentic mastery to elevate every moment."}
              </p>
              <a
                href={targetUrl}
                className="blog-end-cta__btn"
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span>{isAr ? "تسوق الآن" : "Shop Now"}</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* Blog Engagement Popup */}
      <BlogPopup blog={blog} locale={locale} />
    </>
  );
}
