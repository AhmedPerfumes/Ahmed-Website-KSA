import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

const animationStyles = `
  .family-section-item {
    transition: all 1s ease-out;
    opacity: 0;
  }
  .family-section-item.is-visible {
    opacity: 1;
  }

  /* Default animations */
  .family-section-item.left {
    transform: translateX(-120px) scale(0.85) rotateY(15deg);
  }
  .family-section-item.right {
    transform: translateX(120px) scale(0.85) rotateY(-15deg);
  }
  .family-section-item.center {
    transform: scale(0.6) translateY(40px);
    transition-delay: 0.2s;
  }

  /* Visible state */
  .family-section-item.left.is-visible,
  .family-section-item.right.is-visible {
    transform: translateX(0) scale(0.9) rotateY(0deg);
  }
  .family-section-item.center.is-visible {
    transform: scale(1.1) translateY(-20px);
  }

  .family-section-item img {
    border-radius: 16px;
    filter: drop-shadow(0 20px 60px rgba(229, 212, 178, 0.2));
    transition: transform 0.3s ease;
  }

  .family-section-item:hover img {
    transform: scale(1.05);
    filter: drop-shadow(0 25px 80px rgba(229, 212, 178, 0.3));
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .family-section-item.left,
    .family-section-item.right {
      transform: translateX(0) scale(0.7) rotateY(0deg);
    }
    .family-section-item.center {
      transform: scale(0.9) translateY(0px);
    }
    .family-section-item img {
      max-width: 180px !important;
    }
  }

  @media (max-width: 480px) {
    .family-section-item img {
      max-width: 160px !important;
    }
    .family-section-item.center {
      transform: scale(0.8) translateY(0px);
    }
  }
`;

export default function FamilySection({ data = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const locale = useLocale()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  // make images and colors dynamic via `data` prop when supplied
  // Keep backward compatibility with a possible global `window.__K_SERIES_DATA__`.
  const globalData = (typeof window !== 'undefined' && window.__K_SERIES_DATA__) || {};
  const merged = Object.assign({}, globalData, data || {});

  // compute family images according to the viewing context (past/present/future)
  // allow full override if merged.familyImages provides left/center/right
  const accent = merged?.accentColor || "#e5d4b2";
  const baseUrl = `/${locale}/k-series/`;

  const defaultSets = {
    past: {
      left: "/assets/images/kseries/bottle/present_left.png",
      center: "/assets/images/kseries/bottle/past_center.png",
      right: "/assets/images/kseries/bottle/future_right.png",
      labels: { left: "K 2025", center: "K 2000", right: "K 2050" },
      links: {
        left: `${baseUrl}2025`,
        center: `${baseUrl}2000`,
        right: `${baseUrl}2050`
      },
    },
    present: {
      // when present page is open: show future at left, present center, past right
      left: "/assets/images/kseries/bottle/past_left.png",
      center: "/assets/images/kseries/bottle/present_center.png",
      right: "/assets/images/kseries/bottle/future_right.png",
      labels: { left: "K 2000", center: "K 2025", right: "K 2050" },
      links: {
        left: `${baseUrl}2000`,
        center: `${baseUrl}2025`,
        right: `${baseUrl}2050`
      },
    },
    future: {
      // when future page is open: show past at left, future center, present right
      left: "/assets/images/kseries/bottle/past_left.png",
      center: "/assets/images/kseries/bottle/future_center.png",
      right: "/assets/images/kseries/bottle/present_right.png",
      labels: { left: "K 2000", center: "K 2050", right: "K 2025" },
      links: {
        left: `${baseUrl}2000`,
        center: `${baseUrl}2050`,
        right: `${baseUrl}2025`
      },
    },
  };

  const viewKey = (merged?.key || merged?.year || "past").toString().toLowerCase();
  const chosenSet = defaultSets[viewKey] || defaultSets.past;

  const imgLeft = merged?.familyImages?.left || chosenSet.left;
  const imgCenter = merged?.familyImages?.center || chosenSet.center;
  const imgRight = merged?.familyImages?.right || chosenSet.right;

  const leftLabel = merged?.familyImages?.labels?.left || chosenSet.labels.left;
  const centerLabel = merged?.familyImages?.labels?.center || chosenSet.labels.center;
  const rightLabel = merged?.familyImages?.labels?.right || chosenSet.labels.right;

  const leftLink = merged?.familyImages?.links?.left || chosenSet.links.left;
  const centerLink = merged?.familyImages?.links?.center || chosenSet.links.center;
  const rightLink = merged?.familyImages?.links?.right || chosenSet.links.right;

  return (
    <>
      <style>{animationStyles.replace(/#e5d4b2/g, accent)}</style>

      <div
        className="bg-dark text-light py-5"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "-20%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(229,212,178,0.1), transparent)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-15%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(218,165,32,0.08), transparent)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <section ref={sectionRef} style={{ position: "relative", zIndex: 1 }}>
          <div className="container text-center">
            {/* Upper label */}
            <motion.span
              className="d-inline-block mb-3"
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: accent,
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              ✦ Collection Showcase ✦
            </motion.span>

            {/* Heading */}
            <motion.h2
              className="display-4 display-md-3 fw-bold mb-3"
              style={{ color: accent, letterSpacing: "1px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              THREE ERAS.
              <br />
              <span style={{ color: "#ffffff" }}>One Fragrance Family</span>
            </motion.h2>

            {/* Divider */}
            <motion.div
              style={{
                width: "80px",
                height: "2px",
                background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
                margin: "20px auto",
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />

            {/* Subheading */}
            <motion.p
              className="lead text-light mb-5 px-3"
              style={{
                maxWidth: "720px",
                margin: "0 auto",
                lineHeight: "1.8",
                fontSize: "1.1rem",
                fontWeight: 300,
                color: globalData?.textColor || '#dcdcdc'
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              A collection born from precision, innovation, and artistry. The
              K-Series brings bold identity with striking visuals, premium
              craftsmanship, and a fragrance experience unlike anything before.
            </motion.p>

            {/* Image Row */}
            <motion.div
              className="d-flex flex-row justify-content-center align-items-end mt-5 pt-5"
              style={{
                gap: "0",
                marginLeft: "-20px",
                marginRight: "-20px",
                perspective: "1000px",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              {/* Left Image */}
              <div
                className={`family-section-item left ${isVisible ? "is-visible" : ""}`}
                style={{ marginRight: "-50px" }}
              >
                <Link href={leftLink} style={{ textDecoration: 'none', display: 'block' }}>
                  <Image
                    src={imgLeft}
                    alt={leftLabel}
                    width={240}
                    height={360}
                    className="img-fluid"
                    style={{ transformOrigin: "bottom center", maxWidth: "240px", width: "100%", height: "auto" }}
                  />
                  <motion.p
                    className="mt-3"
                    style={{ fontSize: "0.95rem", color: accent, fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5 }}
                  >
                    {leftLabel}
                  </motion.p>
                </Link>
              </div>

              {/* Center Image */}
              <div
                className={`family-section-item center ${isVisible ? "is-visible" : ""}`}
                style={{ zIndex: 2, marginX: "0 -30px" }}
              >
                <Link href={centerLink} style={{ textDecoration: 'none', display: 'block' }}>
                  <Image
                    src={imgCenter}
                    alt={centerLabel}
                    width={280}
                    height={420}
                    className="img-fluid"
                    style={{ transformOrigin: "bottom center", maxWidth: "280px", width: "100%", height: "auto" }}
                  />
                  <motion.p
                    className="mt-3"
                    style={{ fontSize: "1rem", color: accent, fontWeight: 700 }}
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6 }}
                  >
                    {centerLabel}
                  </motion.p>
                </Link>
              </div>

              {/* Right Image */}
              <div
                className={`family-section-item right ${isVisible ? "is-visible" : ""}`}
                style={{ marginLeft: "-50px" }}
              >
                <Link href={rightLink} style={{ textDecoration: 'none', display: 'block' }}>
                  <Image
                    src={imgRight}
                    alt={rightLabel}
                    width={240}
                    height={360}
                    className="img-fluid"
                    style={{ transformOrigin: "bottom center", maxWidth: "240px", width: "100%", height: "auto" }}
                  />
                  <motion.p
                    className="mt-3"
                    style={{ fontSize: "0.95rem", color: accent, fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7 }}
                  >
                    {rightLabel}
                  </motion.p>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
