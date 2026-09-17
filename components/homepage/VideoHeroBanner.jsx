"use client";

/**
 * VideoHeroBanner
 * ───────────────
 * Serves separate desktop and mobile video files.
 * Breakpoint: < 768px = mobile video, >= 768px = desktop video.
 *
 * Loading strategy (bandwidth-safe):
 *  1. Poster JPG shown instantly — 0 video bytes at page load
 *  2. preload="none" — browser fetches nothing until .load() is called
 *  3. IntersectionObserver — triggers load+play when banner enters viewport
 *  4. On resize across 768px breakpoint — swaps source and reloads
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
/* ── Swiper CSS — must be loaded somewhere in the app.
   HeroBanner previously handled this; VideoHeroBanner takes over that responsibility. ── */
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "./VideoHeroBanner.css";

const MOBILE_BP = 768; // px

export default function VideoHeroBanner({
    /* ── Desktop video ── */
    desktopMp4Src  = "/assets/videos/banner-video.mp4",
    desktopPoster  = "/assets/videos/banner-poster.jpg",

    /* ── Mobile video (< 768px) ── */
    mobileMp4Src   = "/assets/videos/banner-video-mobile.mp4",
    mobilePoster   = "/assets/videos/banner-poster-mobile.jpg",

    /* ── Optional overlay text ── */
    eyebrow  = "",
    title    = "",
    subtitle = "",
    ctaLabel = "Discover More",
    ctaHref  = "/shop",

    objectPosition = "center center",
}) {
    const locale = useLocale();
    const t      = useTranslations();

    const videoRef      = useRef(null);
    const sectionRef    = useRef(null);
    const playObsRef    = useRef(null); // continuous play/pause observer
    const [ready,     setReady]     = useState(false);
    const [isMobile,  setIsMobile]  = useState(false);
    const [initiated, setInitiated] = useState(false);

    /* ── Resolve current sources based on breakpoint ── */
    const mp4Src = isMobile ? mobileMp4Src : desktopMp4Src;
    const poster  = isMobile ? mobilePoster  : desktopPoster;

    /* ── Breakpoint detection ── */
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < MOBILE_BP);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* ── Load + play the video ── */
    const startVideo = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.load();
        const tryPlay = () => {
            video.play()
                .then(() => setReady(true))
                .catch(() => {});
        };
        if (video.readyState >= 3) tryPlay();
        else video.addEventListener("canplay", tryPlay, { once: true });
    }, []);

    /* ── One-shot observer: start loading video on first visibility ── */
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const initObserver = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            initObserver.disconnect();
            setInitiated(true);
            startVideo();
        }, { threshold: 0 });

        initObserver.observe(section);
        return () => initObserver.disconnect();
    }, [startVideo]);

    /* ── Continuous observer: pause when scrolled out, play when back ──
       threshold: 0.15 = pause when < 15% of banner is visible.
       This stops the video (and its GPU decode loop) when user scrolls
       past the banner — saves CPU, GPU, and avoids network buffering. ── */
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        playObsRef.current = new IntersectionObserver(([entry]) => {
            const video = videoRef.current;
            if (!video || !initiated) return;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        }, { threshold: 0.15 });

        playObsRef.current.observe(section);
        return () => playObsRef.current?.disconnect();
    }, [initiated]);

    /* ── Page Visibility API: pause when tab is hidden, resume when shown ──
       e.g. user switches browser tab — no point decoding frames nobody sees. ── */
    useEffect(() => {
        const handleVisibility = () => {
            const video = videoRef.current;
            if (!video || !initiated) return;
            if (document.hidden) {
                video.pause();
            } else if (playObsRef.current) {
                // Only resume if still in viewport
                video.play().catch(() => {});
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [initiated]);

    /* ── Swap source on breakpoint flip ── */
    useEffect(() => {
        if (!initiated) return;
        setReady(false);
        startVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    const hasText = eyebrow || title || subtitle;
    const href    = `/${locale}${ctaHref}`;

    return (
        <section
            ref={sectionRef}
            className="vhb"
            aria-label={title ? t(title) : "Hero Banner"}
            id="hero-banner"
        >
            {/* ── Media layer ── */}
            <div className="vhb__media">

                {/* Poster — shown instantly, priority LCP */}
                <Image
                    src={poster}
                    alt={title ? `${t(title)} — Ahmed Al Maghribi` : "Ahmed Al Maghribi — Luxury Perfumes Saudi Arabia"}
                    fill
                    sizes="100vw"
                    priority
                    quality={85}
                    style={{ objectFit: "cover", objectPosition }}
                    className={`vhb__poster${ready ? " vhb__poster--hidden" : ""}`}
                />

                {/* Video — preload=none means 0 bytes fetched until .load() */}
                <video
                    ref={videoRef}
                    key={mp4Src}              /* force remount when src switches */
                    className={`vhb__video${ready ? " vhb__video--visible" : ""}`}
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={poster}
                    style={{ objectPosition }}
                >
                    <source src={mp4Src} type="video/mp4" />
                </video>
            </div>

            {/* ── Gradient overlay for text legibility ── */}
            {hasText && <div className="vhb__overlay" aria-hidden="true" />}

            {/* ── Optional overlay text + CTA ── */}
            {hasText && (
                <div className="vhb__content">
                    <div className="vhb__text">
                        {eyebrow  && <span className="vhb__eyebrow">{t(eyebrow)}</span>}
                        {title    && <h1   className="vhb__title">{t(title)}</h1>}
                        {subtitle && <p    className="vhb__subtitle">{t(subtitle)}</p>}
                        {ctaHref  && (
                            <Link href={href} className="vhb__cta">
                                {t(ctaLabel)}
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
