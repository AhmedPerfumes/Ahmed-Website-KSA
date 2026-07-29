"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import "./HeroBanner.css";

/**
 * HeroBanner — FK-style luxury panoramic strip.
 *
 * Infinite-loop fix:
 * - Previously: setProgress(pct) fired at 60 fps via RAF → 60 React re-renders/s
 *   → new onSwiper/onSlideChange arrow-function refs on every render
 *   → Swiper detected ref changes and re-fired callbacks
 *   → animateProgress() called again → new RAF loop → exponential explosion.
 * - Fix 1: progress bar drives the DOM directly via ref (zero setState, zero re-renders).
 * - Fix 2: onSwiper / onSlideChange wrapped in useCallback → stable references.
 */
export default function HeroBanner({ initialSliders = [], initialMobileSliders = [] }) {
    const locale = useLocale();
    const t = useTranslations();
    const { homeSliders, homeMobileSliders, isLoading: isMenuLoading } = useMenu();

    const [isMobile, setIsMobile] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);

    const swiperRef      = useRef(null);
    const prevRef        = useRef(null);
    const nextRef        = useRef(null);
    const rafRef         = useRef(null);
    const startRef       = useRef(null);
    const progressBarRef = useRef(null); // direct DOM update — avoids re-renders

    const DELAY = 6000; // ms per slide

    /* ── Responsive check ── */
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* ── Progress bar — direct DOM mutation, no setState ── */
    const animateProgress = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            if (progressBarRef.current) progressBarRef.current.style.width = "0%";
            return;
        }
        cancelAnimationFrame(rafRef.current);
        startRef.current = performance.now();
        const tick = (now) => {
            const elapsed = now - startRef.current;
            const pct     = Math.min((elapsed / DELAY) * 100, 100);
            if (progressBarRef.current) {
                progressBarRef.current.style.width = `${pct}%`;
            }
            if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, []); // stable — no deps

    /* cleanup RAF on unmount */
    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* ── Nav wiring — run once after mount ── */
    useEffect(() => {
        const sw = swiperRef.current?.swiper;
        if (!sw || !prevRef.current || !nextRef.current) return;
        sw.params.navigation.prevEl = prevRef.current;
        sw.params.navigation.nextEl = nextRef.current;
        sw.navigation.destroy();
        sw.navigation.init();
        sw.navigation.update();
    }, []); // [] — swiperRef.current is mutable; using it as dep causes infinite loop

    /* ── Stable Swiper callbacks — wrapped in useCallback so references
         don't change on re-render (prevents Swiper from re-firing them) ── */
    const handleSwiper = useCallback((sw) => {
        animateProgress();
        if (prevRef.current && nextRef.current) {
            sw.params.navigation.prevEl = prevRef.current;
            sw.params.navigation.nextEl = nextRef.current;
            sw.navigation.destroy();
            sw.navigation.init();
            sw.navigation.update();
        }
    }, [animateProgress]);

    const handleSlideChange = useCallback((sw) => {
        const idx = sw.realIndex ?? 0;
        setActiveIdx(idx);
        animateProgress();
    }, [animateProgress]);

    /* ── Slide resolution ──
     * Priority: MenuContext (freshest live data)
     *         → initialSliders prop (server-fetched, instant)
     *         → skeleton (fallback if server fetch also failed)
     */
    let slides;
    if (!isMenuLoading && (homeSliders?.length || homeMobileSliders?.length)) {
        slides = (isMobile && homeMobileSliders?.length) ? homeMobileSliders : homeSliders;
    } else if (initialSliders.length > 0 || initialMobileSliders.length > 0) {
        slides = (isMobile && initialMobileSliders.length > 0) ? initialMobileSliders : initialSliders;
    } else {
        slides = null;
    }

    const total = slides?.length || 0;
    const pad   = (n) => String(n).padStart(2, "0");

    /* ── Skeleton ── */
    if (!slides || !slides.length) {
        return (
            <div className="hero-skeleton" role="status" aria-label="Loading">
                <div className="hero-skeleton__inner">
                    <div className="hero-skeleton__lines">
                        <div className="hero-skeleton__line hero-skeleton__line--sm" />
                        <div className="hero-skeleton__line hero-skeleton__line--lg" />
                        <div className="hero-skeleton__line hero-skeleton__line--md" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="hero-banner-luxury" aria-label={t("Hero Banner")} id="hero-banner">
            <div className="hero-banner-inner">

                <Swiper
                    ref={swiperRef}
                    modules={[Autoplay, Navigation, EffectFade]}
                    autoplay={{ delay: DELAY, disableOnInteraction: false }}
                    speed={isMobile ? 600 : 1500}
                    loop={true}
                    slidesPerView={1}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                    onSlideChange={handleSlideChange}
                    onSwiper={handleSwiper}
                    className="hero-swiper"
                >
                    {slides.map((slide, index) => {
                        const isFirst     = index === 0;
                        const isAboveFold = index < 3;
                        const imgSrc      = `${process.env.NEXT_PUBLIC_API_URL}storage/${slide.image}`;
                        const hasSeason   = Boolean(slide.season);
                        const hasTitle    = Boolean(slide.title);
                        const hasSub      = Boolean(slide.sub_title);
                        const hasLink     = Boolean(slide.link);
                        const hasText     = hasSeason || hasTitle || hasSub;
                        const HeadTag     = isFirst && hasTitle ? "h1" : "h2";

                        return (
                            <SwiperSlide key={index}>

                                <div className="hero-slide__image-wrapper">
                                    {hasLink && !hasText ? (
                                        <Link href={`/${locale}/${slide.link}`} className="hero-slide__image-link">
                                            <Image
                                                src={imgSrc}
                                                alt={hasTitle ? `${t(slide.title)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi — Luxury Perfume House Saudi Arabia"}
                                                fill sizes="100vw"
                                                priority={isFirst}
                                                loading={isAboveFold ? "eager" : "lazy"}
                                                quality={75}
                                                style={{ objectFit: "cover", objectPosition: "center" }}
                                            />
                                        </Link>
                                    ) : (
                                        <Image
                                            src={imgSrc}
                                            alt={hasTitle ? `${t(slide.title)} — Ahmed Al Maghribi Perfumes` : "Ahmed Al Maghribi — Luxury Perfume House Saudi Arabia"}
                                            fill sizes="100vw"
                                            priority={isFirst}
                                            loading={isAboveFold ? "eager" : "lazy"}
                                            quality={75}
                                            style={{ objectFit: "cover", objectPosition: "center" }}
                                        />
                                    )}
                                </div>

                                {hasText && <div className="hero-slide__overlay" />}

                                {hasText && (
                                    <div className="hero-slide__content">
                                        <div className="hero-slide__text-block">
                                            {hasSeason && (
                                                <span className="hero-slide__season">
                                                    {t(slide.season)}
                                                </span>
                                            )}
                                            {hasTitle && (
                                                <HeadTag className="hero-slide__title">
                                                    {t(slide.title)}
                                                </HeadTag>
                                            )}
                                            {hasSub && (
                                                <p className="hero-slide__subtitle">
                                                    {t(slide.sub_title)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="hero-slide__bottom-bar">
                                            {hasLink && hasTitle && (
                                                <Link href={`/${locale}/${slide.link}`} className="hero-slide__cta">
                                                    {t("Discover More")}
                                                    <span className="hero-slide__cta-arrow" aria-hidden="true">
                                                        <svg viewBox="0 0 24 24">
                                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* ── Side Chevron Arrows ── */}
                <button type="button" ref={prevRef} className="hero-nav-btn hero-nav-prev" aria-label="Previous slide">
                    <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button type="button" ref={nextRef} className="hero-nav-btn hero-nav-next" aria-label="Next slide">
                    <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                </button>

                {total > 1 && (
                    <div className="hero-slide-counter" aria-hidden="true">
                        <span className="hero-slide-counter__current">{pad(activeIdx + 1)}</span>
                        <span className="hero-slide-counter__sep">/</span>
                        <span>{pad(total)}</span>
                    </div>
                )}

                <div className="hero-progress-wrap" aria-hidden="true">
                    <div
                        ref={progressBarRef}
                        className="hero-progress-bar"
                        style={{ width: "0%", transition: "none" }}
                    />
                </div>

            </div>
        </section>
    );
}
