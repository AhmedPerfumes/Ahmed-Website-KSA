"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "./DakhoonSection.css";

/* ── Static Dakhoon items (local assets) ── */
const DAKHOON_ITEMS = [
    {
        id: 1,
        name:     "Asateen",
        subLabel: "OUD MTR",
        tagline:  "Royal Heritage",
        videoSrc: "/assets/videos/dakhoon/asateen.mp4",
        thumb:    "/assets/videos/dakhoon/thumbnails/asateen.jpg",
        link:     "/shop/dakhoon",
    },
    {
        id: 2,
        name:     "Bakhoor Hind",
        subLabel: "BAKHOOR",
        tagline:  "Spirit of the Orient",
        videoSrc: "/assets/videos/dakhoon/bakhoor-hind.mp4",
        thumb:    "/assets/videos/dakhoon/thumbnails/bakhoor-hind.jpg",
        link:     "/shop/dakhoon",
    },
    {
        id: 3,
        name:     "Maliki",
        subLabel: "OUD MTR",
        tagline:  "Timeless Grandeur",
        videoSrc: "/assets/videos/dakhoon/maliki.mp4",
        thumb:    "/assets/videos/dakhoon/thumbnails/maliki.jpg",
        link:     "/shop/dakhoon",
    },
    {
        id: 4,
        name:     "Khususi",
        subLabel: "OUD MTR",
        tagline:  "Exclusive Reserve",
        videoSrc: "/assets/videos/dakhoon/khususi.mp4",
        thumb:    "/assets/videos/dakhoon/thumbnails/oud.jpg",
        link:     "/shop/dakhoon",
    },
    {
        id: 5,
        name:     "Oud",
        subLabel: "OUD MTR",
        tagline:  "Essence of Arabia",
        videoSrc: "/assets/videos/dakhoon/oud.mp4",
        thumb:    "/assets/videos/dakhoon/thumbnails/oud.jpg",
        link:     "/shop/dakhoon",
    },
];

function DakhoonVideoCard({ item, locale, t }) {
    const videoRef   = useRef(null);
    const articleRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const isMobileRef = useRef(false);

    /* ── Detect genuine touch-primary device ──────────────────────────
       ThinkPad / Surface laptops have maxTouchPoints > 0 but use a
       mouse/trackpad as primary input (pointer: fine). Using that check
       caused all cards to autoplay simultaneously on wide laptop screens.
       `pointer: coarse` correctly returns true only for phones/tablets.
    ── */
    useEffect(() => {
        isMobileRef.current =
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: coarse)").matches;
    }, []);

    /* ── Viewport autoplay on mobile ── */
    useEffect(() => {
        const video   = videoRef.current;
        const article = articleRef.current;
        if (!video || !article) return;
        if (!isMobileRef.current) return; // desktop uses hover

        const playVideo = () => {
            // iOS Safari: call load() if not yet buffered to
            // avoid "The request is not allowed" DOMException
            if (video.readyState === 0) video.load();
            const promise = video.play();
            if (promise !== undefined) {
                promise
                    .then(() => setPlaying(true))
                    .catch(() => {
                        // Blocked by Low Power Mode / autoplay policy — fail silently
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
                threshold: 0.4,          // 40% of card visible
                rootMargin: "0px 0px -60px 0px", // pause slightly before leaving view
            }
        );

        observer.observe(article);
        return () => observer.disconnect();
    }, []);

    /* ── Desktop: hover play/pause ── */
    const handleMouseEnter = () => {
        if (isMobileRef.current) return;
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
            className="dk-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Media */}
            <div className="dk-card__media">
                <Link href={url} tabIndex={-1}>
                    <Image
                        src={item.thumb}
                        alt={`${item.name} — Ahmed Al Maghribi Dakhoon Collection`}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1280px) 30vw, 22vw"
                        className={`dk-card__thumb${playing ? " dk-card__thumb--hidden" : ""}`}
                        loading="lazy"
                    />
                    {/* Video — muted + playsInline required for iOS autoplay policy */}
                    <video
                        ref={videoRef}
                        src={item.videoSrc}
                        muted
                        playsInline
                        loop
                        preload="none"
                        className={`dk-card__video${playing ? " dk-card__video--visible" : ""}`}
                    />
                    {!playing && (
                        <span className="dk-card__play">
                            <svg viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        </span>
                    )}
                </Link>
            </div>

            {/* Info */}
            <div className="dk-card__info">
                <p className="dk-card__sublabel">{item.subLabel}</p>
                <h3 className="dk-card__name">
                    <Link href={url}>{item.name}</Link>
                </h3>
                <p className="dk-card__tagline">{item.tagline}</p>
                <Link href={url} className="dk-card__cta">
                    {t("Shop Now")}
                </Link>
            </div>
        </article>
    );
}

export default function DakhoonSection() {
    const locale = useLocale();
    const t      = useTranslations();

    const [swiper, setSwiper] = useState(null);
    const prevRef             = useRef(null);
    const nextRef             = useRef(null);

    /* Wire nav refs after swiper mounts */
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
        <section className="dk-section" aria-label="Dakhoon Collection" id="dakhoon">
            <div className="dk-inner">

                {/* ── Heading block ── */}
                <div className="dk-head">
                    <h2 className="gs2-lead">{t("Luxury Delight")}</h2>
                    <p className="dk-sub">
                        {t("Step into a realm of refreshing warmth with Ahmed Al Maghribi's exclusive Dakhoon collection.")}
                    </p>
                </div>

                {/* ── Carousel ── */}
                <div className="dk-slider-wrap">
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        onSwiper={setSwiper}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        scrollbar={{ draggable: true, el: ".dk-scrollbar" }}
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
                        {DAKHOON_ITEMS.map((item) => (
                            <SwiperSlide key={item.id}>
                                <DakhoonVideoCard item={item} locale={locale} t={t} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="dk-scrollbar" />
                </div>

                {/* ── Nav arrows ── */}
                <div className="dk-nav">
                    <button type="button" ref={prevRef} className="dk-arrow" aria-label="Previous">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" ref={nextRef} className="dk-arrow" aria-label="Next">
                        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                </div>

            </div>
        </section>
    );
}
