"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import "./HeroSection.scss";

export default function HeroSection({
  title = "Oud & Roses Auric",
  titleLine1,
  titleLine2,
  classicBottleImage = "/assets/oud-roses-tilt.png",
  auricBottleImage = "/assets/auric-bottle-tilt.png",
  bottleImage,
  scrollTarget = "#story",
  isArabic = false,
}) {
  const line1 = titleLine1 || (isArabic ? "عود آند روزز" : "OUD & ROSES");
  const line2 = titleLine2 || (isArabic ? "أوريك" : "AURIC");
  const classicImg = classicBottleImage || "/assets/oud-roses-tilt.png";
  const auricImg = auricBottleImage || bottleImage || "/assets/auric-bottle-tilt.png";

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Subtle interactive 3D mouse parallax on the flacon
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);

  // Track scroll progress through the 200vh hero container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Overdamped, ultra-smooth spring (zero bounce, non-oscillating glide)
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 38,
    stiffness: 90,
    mass: 0.5,
    restDelta: 0.0001,
  });

  // Transformation mappings:
  // Starts with classic Oud & Roses (0% scroll), smoothly fades into Auric on scroll with zero bounce
  const classicBottleOpacity = useTransform(smoothProgress, [0, 0.04, 0.40, 1], [1, 1, 0, 0]);
  const auricBottleOpacity = useTransform(smoothProgress, [0, 0.04, 0.40, 1], [0, 0, 1, 1]);

  // Typography evolution:
  // Line 1 gently settles into its top header position
  const line1Y = useTransform(smoothProgress, [0, 0.04, 0.40, 1], [16, 16, 0, 0]);

  // Line 2 (AURIC) smoothly fades in using the exact same 24K Imperial Gold as Oud & Roses
  const auricTextOpacity = useTransform(smoothProgress, [0, 0.06, 0.40, 1], [0, 0, 1, 1]);
  const auricTextY = useTransform(smoothProgress, [0, 0.06, 0.40, 1], [16, 16, 0, 0]);

  const [isEvolved, setIsEvolved] = useState(false);

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      setIsEvolved(latest > 0.35);
    });
  }, [smoothProgress]);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleScrollCue = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    if (!isEvolved) {
      // Smoothly scroll down to trigger the Auric evolution
      const containerTop =
        containerRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: containerTop + window.innerHeight * 0.85,
        behavior: "smooth",
      });
    } else {
      // Already evolved, scroll to next section
      const target =
        document.querySelector(scrollTarget) ||
        document.querySelector("#story") ||
        document.querySelector("main section:nth-of-type(2)");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        const containerBottom =
          containerRef.current.getBoundingClientRect().top +
          window.scrollY +
          containerRef.current.offsetHeight;
        window.scrollTo({
          top: containerBottom,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div ref={containerRef} className="auric-hero-scroll-wrapper">
      <section
        ref={heroRef}
        className="auric-monolith"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Oud & Roses Auric Hero"
      >
        {/* ── Pure Clean Studio Canvas (No Glow Elements) ── */}
        <div className="auric-monolith__ambient-canvas" aria-hidden="true">
          <div className="auric-monolith__vignette-edge" />
        </div>

        {/* ── Stage Center: Monolith Flacon & Centered 1-2-3 Elements ── */}
        <div className="auric-monolith__stage">
          {/* 1. Top Element: OUD & ROSES (Order 1) */}
          <div
            className={`auric-monolith__title-block auric-monolith__title-block--primary ${
              isArabic ? "auric-monolith__title-block--ar" : ""
            }`}
            style={{ order: 1 }}
          >
            {/* Back Fill */}
            <motion.span
              className="title-line title-line--primary title-line--back"
              style={{
                y: line1Y,
                ...(isArabic
                  ? {
                      fontFamily: "inherit",
                      letterSpacing: "normal",
                      marginRight: 0,
                      textTransform: "none",
                    }
                  : {}),
              }}
            >
              {line1}
            </motion.span>
            {/* Front 3D Outline */}
            <motion.span
              className="title-line title-line--primary title-line--front"
              style={{
                y: line1Y,
                WebkitTextStrokeColor: "#f5cb6c",
                ...(isArabic
                  ? {
                      fontFamily: "inherit",
                      letterSpacing: "normal",
                      marginRight: 0,
                      textTransform: "none",
                    }
                  : {}),
              }}
              aria-hidden="true"
            >
              {line1}
            </motion.span>
          </div>

          {/* 2. Middle Element: Flacon Showcase Container (Order 2) */}
          <motion.div
            className="auric-monolith__bottle-anchor"
            style={{
              order: 2,
              rotateX,
              rotateY,
              transformPerspective: 900,
            }}
            initial={{ opacity: 0, y: 55, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Classic Oud & Roses Flacon */}
            <motion.div
              className="auric-monolith__bottle-layer auric-monolith__bottle-layer--classic"
              style={{
                opacity: classicBottleOpacity,
              }}
            >
              <Image
                src={classicImg}
                alt="Oud & Roses - Classic Flacon"
                fill
                priority
                sizes="(max-width: 768px) 240px, (max-width: 1200px) 360px, 440px"
                className="auric-monolith__bottle-img auric-monolith__bottle-img--classic"
              />
            </motion.div>

            {/* Auric Edition Flacon */}
            <motion.div
              className="auric-monolith__bottle-layer auric-monolith__bottle-layer--auric"
              style={{
                opacity: auricBottleOpacity,
              }}
            >
              <Image
                src={auricImg}
                alt="Oud & Roses Auric - Luxury Perfume Flacon"
                fill
                priority
                sizes="(max-width: 768px) 240px, (max-width: 1200px) 360px, 440px"
                className="auric-monolith__bottle-img auric-monolith__bottle-img--auric"
              />
            </motion.div>

            {/* Clean Grounded Pedestal Shadow (Pure Black Contact) */}
            <div className="auric-monolith__pedestal-shadow" aria-hidden="true" />
          </motion.div>

          {/* 3. Bottom Element: AURIC (Order 3) */}
          <div
            className={`auric-monolith__title-block auric-monolith__title-block--auric ${
              isArabic ? "auric-monolith__title-block--ar" : ""
            }`}
            style={{ order: 3 }}
          >
            {/* Back Fill */}
            <motion.span
              className="title-line title-line--auric title-line--back"
              style={{
                opacity: auricTextOpacity,
                y: auricTextY,
                ...(isArabic
                  ? {
                      fontFamily: "inherit",
                      letterSpacing: "normal",
                      marginRight: 0,
                      textTransform: "none",
                    }
                  : {}),
              }}
            >
              {line2}
            </motion.span>
            {/* Front 3D Outline */}
            <motion.span
              className="title-line title-line--auric title-line--front"
              style={{
                opacity: auricTextOpacity,
                y: auricTextY,
                WebkitTextStrokeColor: "#f5cb6c",
                ...(isArabic
                  ? {
                      fontFamily: "inherit",
                      letterSpacing: "normal",
                      marginRight: 0,
                      textTransform: "none",
                    }
                  : {}),
              }}
              aria-hidden="true"
            >
              {line2}
            </motion.span>
          </div>
        </div>

        {/* ── Minimalist Scroll Cue ── */}
        <motion.a
          href={scrollTarget}
          className="auric-monolith__scroll-cue"
          onClick={handleScrollCue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.2 }}
          aria-label={isEvolved ? "Scroll down to explore story" : "Scroll down to evolve into Auric"}
        >
          <span style={{ fontFamily: isArabic ? "inherit" : undefined, letterSpacing: isArabic ? "normal" : undefined }}>
            {isEvolved
              ? (isArabic ? "اكتشف الإرث" : "Discover The Legacy")
              : (isArabic ? "مرّر لاكتشاف التطور" : "Scroll to Evolve")}
          </span>
          <span className="scroll-arrow" aria-hidden="true">↓</span>
        </motion.a>
      </section>
    </div>
  );
}
