"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./GiftSets.css";

/* ── Static gift set video data (from categories.js) ── */
const GIFT_SETS = [
    {
        id: 1,
        altText:  "Antee Gift Set",
        subText:  "Whispers of Elegance",
        videoSrc: "/assets/videos/giftsets/antee.mp4",
        thumb:    "/assets/videos/giftsets/thumbnails/antee.jpg",
        link:     "/shop/gift-sets/gift-sets/antee-gift-set-05",
    },
    {
        id: 2,
        altText:  "The Dukhoon Collection",
        subText:  "Tradition Reimagined",
        videoSrc: "/assets/videos/giftsets/dakhoon-collection.mp4",
        thumb:    "/assets/videos/giftsets/thumbnails/dukhoon-collection.jpg",
        link:     "/shop/gift-sets/gift-sets/the-dukhoon-collection",
    },
    {
        id: 3,
        altText:  "Ihdaa Khaas Gift Set",
        subText:  "Essence of Luxury",
        videoSrc: "/assets/videos/giftsets/ihdakhas.mp4",
        thumb:    "/assets/videos/giftsets/thumbnails/ihda-khas.jpg",
        link:     "/shop/gift-sets/gift-sets/ihdaa-khaas",
    },
    {
        id: 4,
        altText:  "Oud & Roses Gift Set",
        subText:  "Expression of Memories",
        videoSrc: "/assets/videos/giftsets/oud-and-roses-giftset.mp4",
        thumb:    "/assets/videos/giftsets/thumbnails/oud-roses-giftset.jpg",
        link:     "/shop/gift-sets/gift-sets/oud-roses-gift-set",
    },
    {
        id: 5,
        altText:  "Shauque Al Shuyookh Gift Set",
        subText:  "A Legacy of Grace",
        videoSrc: "/assets/videos/giftsets/shaquealsheukh-giftset.mp4",
        thumb:    "/assets/videos/giftsets/thumbnails/shauque-al-shuyookh.jpg",
        link:     "/shop/gift-sets/gift-sets/shauque-al-shuyookh",
    },
];

function VideoCard({ item, locale, t }) {
    const videoRef    = useRef(null);
    const articleRef  = useRef(null);
    const [playing, setPlaying] = useState(false);
    const isMobileRef = useRef(false);

    /* ── Detect genuine touch-primary device ──────────────────────────
       Problem: ThinkPad / Surface laptops have maxTouchPoints > 0 even
       though their primary input is a mouse/trackpad (pointer: fine).
       This caused IntersectionObserver to fire on all visible cards
       simultaneously, autoplaying every video at once.

       Fix: use the CSS `pointer: coarse` media query.
         • phones / tablets   → pointer: coarse  → true  → use IO autoplay
         • ThinkPad / Surface → pointer: fine    → false → use hover-play
       This is the W3C-recommended way to distinguish touch-primary from
       touch-secondary (hybrid) devices.
    ── */
    useEffect(() => {
        isMobileRef.current =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: coarse)").matches;
    }, []);

    /* ── Viewport-based autoplay for mobile ── */
    useEffect(() => {
        const video   = videoRef.current;
        const article = articleRef.current;
        if (!video || !article) return;

        // Only wire IntersectionObserver on touch/mobile devices
        // Desktop keeps the hover-play behaviour below
        if (!isMobileRef.current) return;

        const playVideo = () => {
            // iOS Safari requires load() after src is set or after a pause
            // to reset the internal media state before play() will succeed
            if (video.readyState === 0) video.load();
            const promise = video.play();
            if (promise !== undefined) {
                promise
                    .then(() => setPlaying(true))
                    .catch(() => {
                        // Autoplay blocked (e.g. Low Power Mode on iOS)
                        // Silently fail — thumbnail stays visible
                    });
            }
        };

        const pauseVideo = () => {
            video.pause();
            video.currentTime = 0;
            setPlaying(false);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            },
            {
                // Fire when at least 40% of the card is visible
                threshold: 0.4,
                // Shrink the viewport root slightly so video
                // pauses a little before fully leaving view
                rootMargin: "0px 0px -60px 0px",
            }
        );

        observer.observe(article);
        return () => observer.disconnect();
    }, []);

    /* ── Desktop: hover play/pause (unchanged) ── */
    const handleMouseEnter = () => {
        if (isMobileRef.current) return; // skip on touch devices
        if (videoRef.current) {
            if (videoRef.current.readyState === 0) videoRef.current.load();
            videoRef.current.play().catch(() => {});
            setPlaying(true);
        }
    };
    const handleMouseLeave = () => {
        if (isMobileRef.current) return;
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaying(false);
        }
    };

    const url = `/${locale}${item.link}`;

    return (
        <article
            ref={articleRef}
            className="gs2-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Media — thumbnail + video overlay */}
            <div className="gs2-card__media">
                <Link href={url} tabIndex={-1}>
                    {/* Thumbnail image */}
                    <Image
                        src={item.thumb}
                        alt={`${item.altText} — Ahmed Al Maghribi Luxury Gift Set`}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                        className={`gs2-card__thumb${playing ? " gs2-card__thumb--hidden" : ""}`}
                        loading="lazy"
                    />
                    {/* Video — muted + playsInline required for iOS autoplay */}
                    <video
                        ref={videoRef}
                        src={item.videoSrc}
                        muted
                        playsInline
                        loop
                        preload="none"
                        className={`gs2-card__video${playing ? " gs2-card__video--visible" : ""}`}
                    />
                    {/* Play icon (shown when not playing) */}
                    {!playing && (
                        <span className="gs2-card__play">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </span>
                    )}
                </Link>
            </div>

            {/* Info */}
            <div className="gs2-card__info">
                <p className="gs2-card__sub">{t("Gift Set")}</p>
                <h3 className="gs2-card__name">
                    <Link href={url}>{item.altText}</Link>
                </h3>
                <p className="gs2-card__tagline">{item.subText}</p>
                <Link href={url} className="gs2-card__cta">
                    {t("Add to Cart")}
                </Link>
            </div>
        </article>
    );
}

export default function GiftSets() {
    const locale = useLocale();
    const t      = useTranslations();

    const [swiper, setSwiper] = useState(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    /* Wire nav refs */
    useEffect(() => {
        if (swiper && prevRef.current && nextRef.current) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
        }
    }, [swiper]);

    return (
        <section className="gs2-section" aria-label="The Art of Gifting" id="gift-sets">
            <div className="gs2-inner">

                {/* ── Section heading with subtitle ── */}
                <div className="gs2-head">
                    <h2 className="gs2-lead">{t("The perfect gift for every occasion")}</h2>
                    <p className="gs2-sub">
                        {t("Delight your loved ones with our luxurious gift sets, thoughtfully curated to include our most exquisite fragrances")}
                    </p>
                </div>

                {/* ── Carousel ── */}
                <div className="gs2-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".gs2-scrollbar" }}
                        spaceBetween={20}
                        slidesPerView={1.4}
                        breakpoints={{
                            480:  { slidesPerView: 1.8, spaceBetween: 20 },
                            640:  { slidesPerView: 2.2, spaceBetween: 22 },
                            768:  { slidesPerView: 2.8, spaceBetween: 24 },
                            1024: { slidesPerView: 3.5, spaceBetween: 26 },
                            1280: { slidesPerView: 4,   spaceBetween: 28 },
                            1440: { slidesPerView: 4.5, spaceBetween: 28 },
                        }}
                    >
                        {GIFT_SETS.map((item) => (
                            <SwiperSlide key={item.id}>
                                <VideoCard item={item} locale={locale} t={t} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="gs2-scrollbar" />
                </div>

                {/* ── Nav arrows ── */}
                <div className="gs2-nav">
                    <button type="button" ref={prevRef} className="gs2-arrow" aria-label="Previous">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" ref={nextRef} className="gs2-arrow" aria-label="Next">
                        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                </div>

            </div>
        </section>
    );
}
