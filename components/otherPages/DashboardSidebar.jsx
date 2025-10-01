"use client";
import React, { useEffect } from "react";
import { dashboardMenuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Add/adjust locales here if you support more
const LOCALES = ["en", "ar"];

// If you use a Next.js basePath (e.g. "/shop"), set it here or via env
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/shop"

function normalize(path) {
  if (!path) return "/";
  // drop query/hash
  const clean = path.split("#")[0].split("?")[0] || "/";
  // drop basePath if present
  const withoutBase =
    BASE_PATH && clean.startsWith(BASE_PATH) ? clean.slice(BASE_PATH.length) || "/" : clean;
  // drop one of the known locale prefixes
  const localeRegex = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`, "i");
  const withoutLocale = withoutBase.replace(localeRegex, "") || "/";
  // collapse trailing slash (except root)
  return withoutLocale.length > 1 && withoutLocale.endsWith("/")
    ? withoutLocale.slice(0, -1)
    : withoutLocale;
}

function isActive(currentPathname, itemHref) {
  const p = normalize(currentPathname);
  const h = normalize(itemHref || "/");

  if (h === "/") return p === "/";
  if (p === h) return true;
  if (p.startsWith(h + "/")) return true; // nested routes
  return false;
}

export default function DashboardSidebar() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login_register");
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login_register");
  };

  return (
    <div className="col-lg-3 account-nav p-4">
      <ul className="account-nav ">
        {dashboardMenuItems.map((elm, i) => {
          const active = elm.title !== "Logout" && isActive(pathname, elm.href);

          return (
            <li key={i}>
              {elm.title === "Logout" ? (
                <a href="#" onClick={handleLogout} className="menu-link menu-link_us-s">
                  Logout
                </a>
              ) : (
                <Link
                  href={elm.href}
                  className={`menu-link menu-link_us-s ${active ? "menu-link_active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {elm.title}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
