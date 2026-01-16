"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const slidesData = [
  {
    id: "past",
    image: "/assets/images/kseries/past.jpg",
    mobileImage: "/assets/images/kseries/PAST_mobile.jpg",
    title: "K-Series 2000",
    subtitle: "The Roots",
    text: "A tribute to the origins of Arabian perfumery, 2000 celebrates the timeless artistry that defines the brand’s foundation. “The Roots” captures the essence of Mr. Kafeel Ahmed’s beginnings — a return to authenticity, where every drop is a story of craftsmanship born from nature.",
  },
  {
    id: "present",
    image: "/assets/images/kseries/present.jpg",
    mobileImage: "/assets/images/kseries/PRESENT_mobile.jpg",
    title: "K-Series 2025",
    subtitle: "The Alchemy Lab",
    text: "2025 embodies the spirit of creation, transformation, and innovation — a reflection of today’s mastery in modern perfumery. “The Alchemy Lab” symbolizes Mr. Kafeel Ahmed’s creative evolution — blending science, soul, and scent into a work of living art.",
  },
  {
    id: "future",
    image: "/assets/images/kseries/future.jpg",
    mobileImage: "/assets/images/kseries/FUTURE_mobile.jpg",
    title: "K-Series 2050",
    subtitle: "The Beyond",
    text: "2050 is a vision of perfumery’s future — intelligent, emotive, and weightlessly elegant. “The Beyond” is an olfactory glimpse into tomorrow, where scent becomes an emotion — the ultimate expression of imagination and connection.",
  },
];

const MOBILE_BREAKPOINT = 768;

const KSeriesScrollSection = () => {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Desktop GSAP stacked scroll
  useEffect(() => {
    const container = containerRef.current;
    const slides = slidesRef.current;
    if (!container || !slides.length || isMobile) return;

    const ctx = gsap.context(() => {
      gsap.set(container, { position: "relative", overflow: "hidden" });

      gsap.set(slides, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      });

      slides.forEach((s, i) => {
        gsap.set(s, {
          zIndex: i + 1,
          yPercent: i === 0 ? 0 : 100,
        });
      });

      const scrollPerSlideVH = 340; // higher = slower, nice & smooth
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=" + (slides.length - 1) * scrollPerSlideVH + "vh",
          scrub: 1.4,
          pin: true,
        },
      });

      slides.slice(1).forEach((s) => {
        tl.to(s, { yPercent: 0, ease: "none" });
      });
    }, container);

    return () => ctx.revert();
  }, [isMobile]);

  /* =========================
   * MOBILE: OVERLAPPING STACK
   * ========================= */
  if (isMobile) {
    return (
      <section ref={containerRef} className="kseries-mobile-wrapper">
        {slidesData.map((slide, index) => {
          const bg = slide.mobileImage || slide.image;
          return (
            <div
              key={slide.id}
              className={`kseries-mobile-slide ${
                index > 0 ? "kseries-mobile-overlap" : ""
              }`}
            >
              <div
                className="kseries-mobile-image"
                style={{ backgroundImage: `url(${bg})` }}
              />
              <div className={`kseries-mobile-card theme-${slide.id}`}>
                <div className="kseries-tag">K-Series • Pre-Registration</div>
                <h2 className="kseries-title">
                  {slide.title}
                  <span>{slide.subtitle}</span>
                </h2>
                <p className="kseries-text">{slide.text}</p>
                <button className="kseries-btn">Secure Your Slot</button>
              </div>
            </div>
          );
        })}

        <style jsx>{`
          .kseries-mobile-wrapper {
            width: 100%;
            padding: 32px 16px 40px;
            background: #020308;
            display: flex;
            flex-direction: column;
            gap: 40px;
          }

          .kseries-mobile-slide {
            position: relative;
          }

          /* Each next block slightly overlaps upwards for that stacked feel */
          .kseries-mobile-overlap {
            margin-top: -18px;
          }

          .kseries-mobile-image {
            width: 100%;
            aspect-ratio: 3 / 4;
            background-size: cover;
            background-position: center;
            border-radius: 18px;
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.7);
          }

          .kseries-mobile-card {
            position: relative;
            margin-top: -26px; /* key: card overlaps image */
            padding: 18px 18px 20px;
            border-radius: 18px;
            background: rgba(3, 4, 10, 0.94);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 22px 50px rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-family: "Lato", system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            color: #f7eee1;
          }

          .kseries-tag {
            font-size: 9px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            font-weight: 600;
            color: #d4af37;
            opacity: 0.9;
          }

          .kseries-title {
            margin: 0;
            font-family: "Playfair Display", "Georgia", serif;
            font-size: 1.5rem;
            line-height: 1.3;
            font-weight: 600;
            letter-spacing: 0.02em;
          }

          .kseries-title span {
            display: block;
            margin-top: 2px;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #d4af37;
          }

          .kseries-text {
            margin-top: 4px;
            font-size: 0.82rem;
            line-height: 1.7;
            color: #e7ddcc;
          }

          .kseries-btn {
            margin-top: 10px;
            padding: 9px 22px;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            border-radius: 999px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            background: #d4af37;
            color: #111;
            align-self: flex-start;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
            transition: all 0.22s ease;
          }

          .kseries-btn:hover {
            background: #f0c95a;
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.75);
          }

          /* Cool-tone themes for present/future */
          .theme-present,
          .theme-future {
            background: rgba(4, 12, 26, 0.96);
            border-color: rgba(90, 180, 255, 0.3);
          }
          .theme-present .kseries-tag,
          .theme-future .kseries-tag {
            color: #6ecbff;
          }
          .theme-present .kseries-title span,
          .theme-future .kseries-title span {
            color: #6ecbff;
          }
        `}</style>
      </section>
    );
  }

  /* =========================
   * DESKTOP: ORIGINAL STACKED
   * ========================= */
  return (
    <section ref={containerRef} className="kseries-scroll-wrapper">
      {slidesData.map((slide, i) => {
        const bg = slide.image;

        return (
          <div
            key={slide.id}
            ref={(el) => (slidesRef.current[i] = el)}
            className="kseries-slide"
            style={{ backgroundImage: `url(${bg})` }}
          >
            <div className="kseries-overlay" />
            <div className={`kseries-inner kseries-inner-${slide.id}`}>
              <div className={`kseries-content theme-${slide.id}`}>
                <div className="kseries-tag">K-Series • Pre-Registration</div>
                <h2 className="kseries-title">
                  {slide.title}
                  <span>{slide.subtitle}</span>
                </h2>
                <p className="kseries-text">{slide.text}</p>
                <button className="kseries-btn">Secure Your Slot</button>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .kseries-scroll-wrapper {
          width: 100%;
          height: 100vh;
          position: relative;
        }

        .kseries-slide {
          background-size: cover;
          background-position: center;
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .kseries-inner {
          width: 100%;
          max-width: 1440px;
          padding: 0 80px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
        }

        .kseries-inner-past {
          justify-content: flex-start;
        }

        .kseries-inner-present {
          justify-content: flex-end;
        }

        .kseries-inner-future {
          justify-content: flex-start;
        }

        .kseries-content {
          position: relative;
          z-index: 2;
          width: 46%;
          max-width: 720px;
          min-height: 50vh;
          padding: 36px 40px;
          border-radius: 26px;
          background: rgba(10, 7, 5, 0.32);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: "Sofia Pro", "Inter", system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #f7eee1;
          text-align: left;
          align-items: flex-start;
        }

        .kseries-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 0% 0%, rgba(0, 0, 0, 0.12), transparent 55%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.22));
          z-index: 1;
          pointer-events: none;
        }

        .kseries-tag {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.9;
        }

        .kseries-title {
          margin: 0;
          font-family: "Wulkan Display", "Playfair Display", "Georgia", serif;
          font-size: 2.8rem;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .kseries-title span {
          display: block;
          margin-top: 4px;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .kseries-text {
          margin-top: 6px;
          font-size: 0.95rem;
          line-height: 1.9;
          max-width: 520px;
        }

        .kseries-btn {
          margin-top: 18px;
          padding: 12px 34px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          align-self: flex-start;
        }

        /* THEME: PAST */
        .theme-past {
          background:
            radial-gradient(circle at top left, rgba(212, 175, 55, 0.08), transparent 70%),
            rgba(18, 10, 5, 0.5);
          border-color: rgba(212, 175, 55, 0.32);
          color: #f7eee1;
        }
        .theme-past .kseries-tag {
          color: #d4af37;
        }
        .theme-past .kseries-title {
          color: #f7eee1;
        }
        .theme-past .kseries-title span {
          color: #d4af37;
        }
        .theme-past .kseries-text {
          color: #e3d5c1;
        }
        .theme-past .kseries-btn {
          border: 2px solid #d4af37;
          background: #d4af37;
          color: #151008;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }
        .theme-past .kseries-btn:hover {
          background: transparent;
          color: #f7eee1;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
        }

        /* THEME: PRESENT & FUTURE */
        .theme-present,
        .theme-future {
          background: rgba(4, 12, 26, 0.88);
          border-color: rgba(90, 180, 255, 0.3);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
          color: #e2f1ff;
          font-family: "Space Grotesk", "Poppins", system-ui, sans-serif;
        }
        .theme-present .kseries-tag,
        .theme-future .kseries-tag {
          color: #6ecbff;
        }
        .theme-present .kseries-title,
        .theme-future .kseries-title {
          color: #eaf7ff;
          text-shadow: 0 0 18px rgba(110, 203, 255, 0.3);
        }
        .theme-present .kseries-title span,
        .theme-future .kseries-title span {
          color: #6ecbff;
        }
        .theme-present .kseries-text,
        .theme-future .kseries-text {
          color: #cbdfff;
        }
        .theme-present .kseries-btn,
        .theme-future .kseries-btn {
          border: none;
          background: linear-gradient(90deg, #1b79ff, #6ecbff);
          color: #fff;
          box-shadow: 0 8px 24px rgba(110, 203, 255, 0.4);
        }
        .theme-present .kseries-btn:hover,
        .theme-future .kseries-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(110, 203, 255, 0.6);
        }

        @media (max-width: 991px) {
          /* desktop JSX isn't used on mobile, just hiding as backup */
          .kseries-scroll-wrapper {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default KSeriesScrollSection;
