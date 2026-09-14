"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import DiscountGrid from "../common/features/DiscountGrid";
import { useMenu } from "../../context/MenuContext";

const BannerSkeleton = ({ isMobile }) => {
    return (
        <div
            className="w-100 skeleton-shimmer"
            style={{
                position: "relative",
                aspectRatio: "21 / 11",
                width: "100%",
                borderRadius: isMobile ? 14 : 16,
                overflow: "hidden",
                boxShadow: isMobile ? "0 6px 18px rgba(0,0,0,.08)" : "0 12px 30px rgba(0,0,0,.12)",
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite linear"
            }}
        >
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

function CityWalk() {
    const locale = useLocale();
    const t = useTranslations();
    const { homeSliders, homeMobileSliders, isLoading } = useMenu();

    const isSaleLink = (link) => {
        if (!link) return false;
        const s = String(link).toLowerCase();
        return s === 'sale' || s === '/sale' || s.includes('/sale');
    };

    const saleDesktop = Array.isArray(homeSliders)
        ? homeSliders.find((s) => isSaleLink(s.link))
        : null;

    const saleMobile = Array.isArray(homeMobileSliders)
        ? homeMobileSliders.find((s) => isSaleLink(s.link))
        : null;

    return (
        <div className="citywalk-campaign">
            {/* Hero Section */}
            {isLoading && (
                <div className="campaign-hero">
                    {/* Desktop Skeleton */}
                    <div className="container-fluid pt-4 d-none d-lg-block px-3 px-xl-4">
                        <div className="d-flex justify-content-center">
                            <div className="w-100" style={{ maxWidth: 1680 }}>
                                <BannerSkeleton isMobile={false} />
                            </div>
                        </div>
                    </div>
                    {/* Mobile Skeleton */}
                    <div className="container-fluid pt-3 d-lg-none px-3">
                        <div className="d-flex justify-content-center">
                            <div className="w-100" style={{ maxWidth: 980 }}>
                                <BannerSkeleton isMobile={true} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && (saleDesktop || saleMobile) && (
                <div className="campaign-hero">
                    {/* Desktop Banner (centered, polished card) */}
                    {saleDesktop && (
                        <div className="container-fluid pt-4 d-none d-lg-block px-3 px-xl-4">
                            <div className="d-flex justify-content-center">
                                <div className="w-100" style={{ maxWidth: 1680 }}>
                                    <Link href={`/${locale}/${saleDesktop.link || "shop"}`} className="d-block transition-opacity hover-opacity-90">
                                        <div
                                            style={{
                                                position: "relative",
                                                aspectRatio: "21 / 11",
                                                width: "100%",
                                                borderRadius: 16,
                                                overflow: "hidden",
                                                boxShadow: "0 12px 30px rgba(0,0,0,.12)",
                                            }}
                                        >
                                            <Image
                                                loading="eager"
                                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${saleDesktop.image}`}
                                                alt={saleDesktop?.title || "Sale Banner"}
                                                fill
                                                sizes="(min-width: 1680px) 1680px, 100vw"
                                                style={{ objectFit: "cover" }}
                                                priority
                                            />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Banner (centered, polished card) */}
                    {(saleMobile || saleDesktop) && (
                        <div className="container-fluid pt-3 d-lg-none px-3">
                            <div className="d-flex justify-content-center">
                                <div className="w-100" style={{ maxWidth: 980 }}>
                                    <Link href={`/${locale}/${(saleMobile || saleDesktop).link || "shop"}`} className="d-block">
                                        <div
                                            style={{
                                                position: "relative",
                                                aspectRatio: "21 / 11",
                                                width: "100%",
                                                borderRadius: 14,
                                                overflow: "hidden",
                                                boxShadow: "0 6px 18px rgba(0,0,0,.08)",
                                            }}
                                        >
                                            <Image
                                                loading="lazy"
                                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${saleDesktop.image}`}
                                                alt={(saleMobile || saleDesktop)?.title || "Sale Banner Mobile"}
                                                fill
                                                sizes="(max-width: 980px) 100vw, 980px"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Header Title */}
            <div className="container pt-4">
                <h1 className="text-center fw-normal mb-0 h3 h2-md" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {t("Limited Time Offers")}
                </h1>
            </div>

            {/* Product Grid */}
            <div className="">
                <DiscountGrid title={saleDesktop?.title || t("")} onlyDiscounted={true} />
            </div>
        </div>
    );
}

export default CityWalk;