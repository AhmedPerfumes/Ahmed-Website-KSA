"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function BottleComparisonSlider({
  beforeImg = "/assets/images/oud-roses.png",
  afterImg = "/assets/auric-bottle.png",
  beforeLabel = "Oud & Roses",
  afterLabel = "Auric",
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, determined: false, isHorizontal: false });

  // Auto-slide 1-time onboarding hint refs
  const teaseAnimationRef = useRef(null);
  const teaseTimeoutRef = useRef(null);
  const hasTeasedRef = useRef(false);
  const userInteractedRef = useRef(false);

  const cancelTease = useCallback(() => {
    if (teaseTimeoutRef.current) clearTimeout(teaseTimeoutRef.current);
    if (teaseAnimationRef.current) {
      cancelAnimationFrame(teaseAnimationRef.current);
      teaseAnimationRef.current = null;
    }
  }, []);

  const startTeaseAnimation = useCallback(() => {
    if (hasTeasedRef.current || userInteractedRef.current) return;
    hasTeasedRef.current = true;

    // Brief pause after entering viewport before teasing
    teaseTimeoutRef.current = setTimeout(() => {
      if (userInteractedRef.current) return;

      const phases = [
        { from: 50, to: 32, duration: 650 },
        { from: 32, to: 68, duration: 800 },
        { from: 68, to: 50, duration: 650 },
      ];

      let phaseIndex = 0;
      let phaseStartTime = performance.now();

      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const tick = (now) => {
        if (userInteractedRef.current) return;

        const currentPhase = phases[phaseIndex];
        const elapsed = now - phaseStartTime;
        const progress = Math.min(1, elapsed / currentPhase.duration);
        const eased = easeInOutCubic(progress);

        const currentPos =
          currentPhase.from + (currentPhase.to - currentPhase.from) * eased;
        setSliderPos(currentPos);

        if (progress < 1) {
          teaseAnimationRef.current = requestAnimationFrame(tick);
        } else {
          phaseIndex++;
          if (phaseIndex < phases.length) {
            phaseStartTime = performance.now();
            teaseAnimationRef.current = requestAnimationFrame(tick);
          } else {
            setSliderPos(50);
            teaseAnimationRef.current = null;
          }
        }
      };

      teaseAnimationRef.current = requestAnimationFrame(tick);
    }, 600);
  }, []);

  // Trigger 1-time auto-slide when section enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !hasTeasedRef.current &&
            !userInteractedRef.current
          ) {
            startTeaseAnimation();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelTease();
    };
  }, [startTeaseAnimation, cancelTease]);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  // Smooth glide animation when clicking buttons or track
  const glideTo = (targetPos) => {
    userInteractedRef.current = true;
    cancelTease();

    const startPos = sliderPos;
    const startTime = performance.now();
    const duration = 520;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateGlide = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = startPos + (targetPos - startPos) * easeOutCubic(progress);
      setSliderPos(current);

      if (progress < 1) {
        requestAnimationFrame(animateGlide);
      }
    };

    requestAnimationFrame(animateGlide);
  };

  // Dedicated Handle pointer drag (works smoothly with pointer capture)
  const handleHandlePointerDown = (e) => {
    userInteractedRef.current = true;
    cancelTease();
    setIsDragging(true);
    if (e.currentTarget && e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) { }
    }
    handleMove(e.clientX);
  };

  const handleHandlePointerMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleHandlePointerUp = (e) => {
    setIsDragging(false);
    if (e.currentTarget && e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  // Desktop mouse click & drag anywhere on the container
  const handleContainerPointerDown = (e) => {
    if (e.pointerType === "mouse") {
      userInteractedRef.current = true;
      cancelTease();
      setIsDragging(true);
      handleMove(e.clientX);
    }
  };

  const handleContainerPointerMove = (e) => {
    if (e.pointerType === "mouse" && isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleContainerPointerUp = (e) => {
    if (e.pointerType === "mouse") {
      setIsDragging(false);
    }
  };

  // Native non-passive touch listener for slope-aware mobile gestures
  // Ensures vertical scrolling on mobile is NEVER blocked!
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartRef.current = {
        x: t.clientX,
        y: t.clientY,
        determined: false,
        isHorizontal: false,
      };
    };

    const onTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;

      if (!touchStartRef.current.determined) {
        if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
          touchStartRef.current.determined = true;
          // Only capture if gesture is distinctly horizontal:
          if (Math.abs(dx) > Math.abs(dy) * 1.15) {
            touchStartRef.current.isHorizontal = true;
            setIsDragging(true);
            userInteractedRef.current = true;
            cancelTease();
          } else {
            touchStartRef.current.isHorizontal = false;
          }
        }
        return;
      }

      if (touchStartRef.current.isHorizontal) {
        if (e.cancelable) e.preventDefault();
        handleMove(t.clientX);
      }
      // If isHorizontal is false, DO NOTHING: native vertical page scrolling continues seamlessly!
    };

    const onTouchEnd = () => {
      touchStartRef.current.determined = false;
      setIsDragging(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [handleMove, cancelTease]);

  return (
    <div className="perfume-comparison-wrapper">
      {/* Master Atelier Showcase Frame */}
      <div
        ref={containerRef}
        className="auric-compare-showcase"
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
      >
        {/* Illuminated Base Pedestal */}
        <div className="auric-compare-pedestal" />
        <div className="auric-compare-pedestal-light" />

        {/* Layer 1 (Left / Base): Oud & Roses */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            padding: "24px 20px 38px",
          }}
        >
          <Image
            src={beforeImg}
            alt={beforeLabel}
            width={432}
            height={578}
            priority
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 18px 40px rgba(0, 0, 0, 0.65))",
            }}
          />
        </div>

        {/* Layer 2 (Right / Revealed): Auric */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            clipPath: `inset(0 0 0 ${sliderPos}%)`,
            WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
            padding: "24px 20px 38px",
          }}
        >
          <Image
            src={afterImg}
            alt={afterLabel}
            width={432}
            height={578}
            priority
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 18px 40px rgba(0, 0, 0, 0.65))",
            }}
          />
        </div>

        {/* Luminous Gold Seam Divider Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: "2px",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          <div className="auric-compare-divider-line" />
        </div>

        {/* Interactive Drag Handle Box featuring Ahmed Al Maghribi Logo */}
        <div
          className="auric-compare-handle-wrap"
          style={{ left: `${sliderPos}%` }}
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
        >
          <div className="auric-compare-handle-box">
            <Image
              src="/assets/images/logo/Desktop.svg"
              alt="Ahmed Al Maghribi Logo"
              width={30}
              height={30}
              priority
              className="auric-compare-handle-logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ data = {}, onBookNow, shopUrl }) {
  const defaultShopUrl = shopUrl || "/en/shop/perfumes/occidental-fragrance/oud-roses-auric";
  const isArabic = Boolean(data?.isArabic);

  return (
    <section className="hero-section text-white">
      <div className="overlay"></div>

      <div className="container position-relative z-1">
        <div className="row align-items-center">
          {/* Left Column: Perfume Bottle Comparison Slider */}
          <div className="col-lg-6 text-center mb-5 mb-lg-0 order-2 order-lg-1">
            <motion.div
              className="hero-image position-relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <BottleComparisonSlider
                beforeImg={data?.comparisonBeforeImg || "/assets/images/oud-rose-no-bg.png"}
                afterImg={data?.bottleImg || "/assets/auric-bottle.png"}
                beforeLabel={data?.comparisonBeforeLabel || "Oud & Roses"}
                afterLabel={data?.title || "Auric"}
              />
            </motion.div>
          </div>

          {/* Right Column: Story & Heritage */}
          <div className="col-lg-6 order-1 order-lg-2">
            <motion.div
              className="hero-message text-center px-0 px-lg-3"
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              {/* Main Headline */}
              <h2
                style={{
                  fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                  fontSize: "clamp(2.3rem, 4.4vw, 3.6rem)",
                  lineHeight: isArabic ? "1.3" : "1.16",
                  letterSpacing: isArabic ? "normal" : "0.06em",
                  fontWeight: 400,
                  color: "#ffffff",
                  marginBottom: "24px",
                  textAlign: "center",
                  textWrap: "balance",
                }}
              >
                {data?.storyTitlePart1 && data?.storyTitlePart2 ? (
                  <>
                    <span style={{ display: "block", color: "#ffffff", fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif", fontSize: "clamp(2rem, 3vw, 3.3rem)" }}>
                      {data.storyTitlePart1}
                    </span>
                    <span
                      className="auric-gold-text"
                      style={{
                        fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                        fontWeight: 400,
                        fontSize: "clamp(2.3rem, 4.4vw, 3.6rem)",
                        lineHeight: isArabic ? "1.3" : "1.16",
                        marginTop: "4px",
                        display: "inline-block",
                        background:
                          "linear-gradient(135deg, #FFF3D0 0%, #FAD06C 25%, #DDA136 50%, #FDE28A 75%, #B37B22 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 2px 20px rgba(221, 161, 54, 0.3))",
                      }}
                    >
                      {data.storyTitlePart2}
                    </span>
                  </>
                ) : (
                  <span
                    className="auric-gold-text"
                    style={{
                      fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                      fontWeight: 400,
                      fontSize: "clamp(2.3rem, 4.4vw, 3.6rem)",
                      lineHeight: isArabic ? "1.3" : "1.16",
                      display: "inline-block",
                      background:
                        "linear-gradient(135deg, #FFF3D0 0%, #FAD06C 25%, #DDA136 50%, #FDE28A 75%, #B37B22 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 2px 20px rgba(221, 161, 54, 0.3))",
                    }}
                  >
                    {data?.storyTitle || "A Story That Changed The House"}
                  </span>
                )}
              </h2>

              {/* Story Narrative Paragraph: Pure crisp white, editorial cadence */}
              <p
                className="lead mb-4"
                style={{
                  fontFamily: isArabic ? "inherit" : "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(0.98rem, 1.15vw, 1.08rem)",
                  lineHeight: "1.9",
                  color: "#ffffff",
                  fontWeight: 300,
                  letterSpacing: isArabic ? "normal" : "0.02em",
                  maxWidth: "540px",
                  margin: "0 auto",
                  textAlign: "center",
                  textWrap: "balance",
                }}
              >
                {data?.storyText ||
                  data?.heroQuote ||
                  "Some fragrances become successful. Others change the direction of a house forever. Oud & Roses became a signature fragrance whose story reached far beyond its origins. Auric honours that legacy and the people who carried the story forward."}
              </p>

              {/* Founder Dedication Quote Plaque */}
              <div
                style={{
                  margin: "0 auto 36px",
                  maxWidth: "540px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, #dda136, transparent)",
                    margin: "0 auto 14px",
                    opacity: 0.8,
                  }}
                  aria-hidden="true"
                />
                <p
                  style={{
                    margin: 0,
                    fontFamily: isArabic ? "inherit" : "Georgia, 'Times New Roman', serif",
                    fontSize: "clamp(0.88rem, 1.0vw, 0.95rem)",
                    color: "#ffffff",
                    letterSpacing: isArabic ? "normal" : "0.04em",
                    fontWeight: 400,
                    fontStyle: isArabic ? "normal" : "italic",
                    lineHeight: "1.6",
                    textAlign: "center",
                  }}
                >
                  {data?.founderCredit || "Inspired by the vision of our founder, Mr. Kafeel Ahmed"}
                </p>
                <div
                  style={{
                    width: "48px",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, #dda136, transparent)",
                    margin: "14px auto 0",
                    opacity: 0.8,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Baccarat Ruby CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
                style={{ display: "flex", justifyContent: "center", width: "100%" }}
              >
                {onBookNow ? (
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 12px 34px rgba(196, 30, 58, 0.45), 0 0 20px rgba(221, 161, 54, 0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                      background: "linear-gradient(135deg, #c41e3a 0%, #9e1b32 50%, #6e0c1b 100%)",
                      color: "#ffffff",
                      borderRadius: "40px",
                      border: "1px solid rgba(245, 203, 108, 0.6)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px rgba(196, 30, 58, 0.25)",
                      padding: "15px 42px",
                      fontSize: "0.84rem",
                      letterSpacing: isArabic ? "normal" : "0.2em",
                      marginRight: isArabic ? "0" : "-0.2em",
                      textTransform: isArabic ? "none" : "uppercase",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.35s ease",
                    }}
                    onClick={onBookNow}
                  >
                    {data?.ctaButtonText || "Explore Auric"}
                  </motion.button>
                ) : (
                  <Link href={defaultShopUrl} style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                        boxShadow:
                          "0 12px 34px rgba(196, 30, 58, 0.45), 0 0 20px rgba(221, 161, 54, 0.3)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                        background: "linear-gradient(135deg, #c41e3a 0%, #9e1b32 50%, #6e0c1b 100%)",
                        color: "#ffffff",
                        borderRadius: "40px",
                        border: "1px solid rgba(245, 203, 108, 0.6)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px rgba(196, 30, 58, 0.25)",
                        padding: "15px 42px",
                        fontSize: "0.84rem",
                        letterSpacing: isArabic ? "normal" : "0.2em",
                        marginRight: isArabic ? "0" : "-0.2em",
                        textTransform: isArabic ? "none" : "uppercase",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.35s ease",
                      }}
                    >
                      {data?.ctaButtonText || "Explore Auric"}
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
