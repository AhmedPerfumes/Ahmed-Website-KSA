"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

/**
 * PremiumBreadcrumb
 *
 * Props:
 *   items: [{ label: string, labelAr?: string, href?: string }]
 *          Last item has no href (current page).
 */
export default function PremiumBreadcrumb({ items = [] }) {
  const locale = useLocale();
  const isAr   = locale === "ar";

  return (
    <nav
      aria-label="Breadcrumb"
      dir={isAr ? "rtl" : "ltr"}
      style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0.75rem 1rem 0",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      }}
    >
      <ol style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.3rem",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}>
        {/* Home */}
        <li style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Link
            href={`/${locale}/`}
            style={{
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#888",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#a67b30"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
          >
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <Chevron isAr={isAr} />
        </li>

        {items.map((item, i) => {
          const label = isAr && item.labelAr ? item.labelAr : item.label;
          const isLast = i === items.length - 1;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {isLast || !item.href ? (
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#111",
                }}>
                  {label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 400,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#888",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#a67b30"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
                  >
                    {label}
                  </Link>
                  {!isLast && <Chevron isAr={isAr} />}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Chevron({ isAr }) {
  return (
    <svg
      width="5" height="8" viewBox="0 0 5 8" fill="none"
      aria-hidden="true"
      style={{ transform: isAr ? "scaleX(-1)" : "none", flexShrink: 0 }}
    >
      <path d="M1 1l3 3-3 3" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
