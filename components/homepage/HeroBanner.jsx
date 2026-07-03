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
 * LCP strategy:
 * - `initialSliders` is server-fetched (passed from home-8/page.jsx Server Component)
 * - We render the hero IMMEDIATELY using server data — no skeleton delay
 * - When MenuContext finishes its client-side fetch, we seamlessly update to the
 *   freshest slider data (without any visible jump)
 * - Result: the first hero <Image priority> is in SSR HTML → browser sees
 *   <link rel="preload"> and starts downloading before any JS runs
 */
export default function HeroBanner({ initialSliders = [], initialMobileSliders = [] }) {
    const locale = useLocale();
    const t = useTranslations();
    const { homeSliders, homeMobileSliders, isLoading: isMenuLoading } = useMenu();

    const [isMobile, setIsMobile] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [progress, setProgress] = useState(0);

    const swiperRef = useRef(null);
    const prevRef   = useRef(null);
    const nextRef   = useRef(null);
    const rafRef    = useRef(null);
    const startRef  = useRef(null);

    const DELAY = 6000; // ms per slide

    /* ── Responsive check ── */
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* ── Progress bar — skipped on mobile (counter is hidden; saves ~375 setState/s of TBT) ── */
    const animateProgress = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setProgress(0);
            return;
        }
        cancelAnimationFrame(rafRef.current);
        startRef.current = performance.now();
        const tick = (now) => {
            const elapsed = now - startRef.current;
            const pct = Math.min((elapsed / DELAY) * 100, 100);
            setProgress(pct);
            if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* ── Nav wiring ── */
    useEffect(() => {
        const sw = swiperRef.current?.swiper;
        if (!sw || !prevRef.current || !nextRef.current) return;
        sw.params.navigation.prevEl = prevRef.current;
        sw.params.navigation.nextEl = nextRef.current;
        sw.navigation.destroy();
        sw.navigation.init();
        sw.navigation.update();
    }, [swiperRef.current]); // eslint-disable-line

    /* ── Slide resolution ──
     *
     * Priority:  MenuContext (freshest live data)
     *         → initialSliders prop (server-fetched, instant)
     *         → skeleton (fallback if server fetch also failed)
     *
     * This means: on first render we use server data immediately (no skeleton!).
     * After MenuContext resolves we switch to its data silently.
     */
    let slides;
    if (!isMenuLoading && (homeSliders?.length || homeMobileSliders?.length)) {
        // MenuContext has loaded — use its (freshest) data
        slides = (isMobile && homeMobileSliders?.length) ? homeMobileSliders : homeSliders;
    } else if (initialSliders.length > 0 || initialMobileSliders.length > 0) {
        // Server-provided data — use immediately without waiting for MenuContext
        slides = (isMobile && initialMobileSliders.length > 0) ? initialMobileSliders : initialSliders;
    } else {
        // Neither server data nor MenuContext ready yet — show skeleton
        slides = null;
    }

    const total = slides?.length || 0;
    const pad   = (n) => String(n).padStart(2, "0");

    /* ── Skeleton: only shown when BOTH server fetch AND client fetch are unavailable ── */
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
                    onSlideChange={(sw) => {
                        const idx = sw.realIndex ?? 0;
                        setActiveIdx(idx);
                        animateProgress();
                    }}
                    onSwiper={(sw) => {
                        animateProgress();
                        if (prevRef.current && nextRef.current) {
                            sw.params.navigation.prevEl = prevRef.current;
                            sw.params.navigation.nextEl = nextRef.current;
                            sw.navigation.destroy();
                            sw.navigation.init();
                            sw.navigation.update();
                        }
                    }}
                    className="hero-swiper"
                >
                    {slides.map((slide, index) => {
                        const isFirst   = index === 0;
                        // With Swiper fade, slides 0-2 are ALL stacked in the DOM as
                        // position:absolute full-viewport images. The browser considers
                        // ALL of them LCP candidates. Using loading=lazy + fetchPriority=low
                        // on slides 1-2 was causing Lighthouse to flag them as lazy-loaded
                        // LCP elements. Fix: first 3 slides are eager, rest are lazy.
                        const isAboveFold = index < 3;
                        const imgSrc    = `${process.env.NEXT_PUBLIC_API_URL}storage/${slide.image}`;
                        const hasSeason = Boolean(slide.season);
                        const hasTitle  = Boolean(slide.title);
                        const hasSub    = Boolean(slide.sub_title);
                        const hasLink   = Boolean(slide.link);
                        const hasText   = hasSeason || hasTitle || hasSub;
                        const HeadTag   = isFirst && hasTitle ? "h1" : "h2";

                        return (
                            <SwiperSlide key={index}>

                                {/* ── Background Image ── */}
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
                        className="hero-progress-bar"
                        style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 0.1s linear" }}
                    />
                </div>

            </div>
        </section>
    );
}
