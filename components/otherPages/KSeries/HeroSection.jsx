"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import styles from "./HeroSection.module.css";

const DESKTOP_HERO = "/assets/images/kseries/website_banner.jpg";
const MOBILE_HERO = "/assets/images/kseries/mobile_banner_final.jpg";
const MOBILE_BREAKPOINT = 768;

export default function HeroSection({
  title = "Experience The Essence",
  subtitle = "Elevate your presence with our K-Series signature scents.",
  ctaText = "Pre-Book Now",
  ctaHref = "#k-series-product-cards",
}) {
  const heroRef = useRef(null);

  // Scroll-based parallax & fade
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(heroScrollY, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroScrollY, [0, 0.6], [1, 0]);

  // Simple viewport check for mobile hero image
  const [isMobile, setIsMobile] = useState(false);
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

  const heroSrc = isMobile ? MOBILE_HERO : DESKTOP_HERO;

  // Subtle floating specs (optional)
  // const particles = useMemo(
  //   () =>
  //     Array.from({ length: 10 }).map((_, i) => ({
  //       id: i,
  //       size: 6 + ((i * 11) % 10),
  //       left: `${(i * 91) % 100}%`,
  //       delay: (i * 0.41) % 2,
  //       duration: 4 + ((i * 1.1) % 4),
  //       blur: (i * 0.9) % 3,
  //       opacity: 0.12 + ((i * 5) % 20) / 100,
  //     })),
  //   []
  // );

  return (
    <div ref={heroRef} className={styles.heroWrapper}>
      {/* Background with parallax */}
      <motion.div style={{ y: heroImageY }} className={styles.heroBg}>
        <Image
          src={heroSrc}
          alt="K Series Perfume Collection"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
      </motion.div>


      {/* Centered K-Series logo + tagline, fixed a bit below top */}
      {/* <motion.div
        style={{ opacity: heroOpacity, zIndex: 10 }}
        className={`position-absolute w-100 d-flex flex-column align-items-center text-center px-4 ${styles.heroTitleWrapper}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className={`fw-bold ${styles.heroTitle}`}>
            <div className={styles.heroLogoWrapper}>
              <Image
                src="/assets/images/kseries/k-series[1].png"
                alt="K Series"
                width={425}
                height={189}
                className={styles.heroLogo}
                priority
              />
            </div>
          </h1>

          <p
            className={`${styles.textChampagne} ${styles.heroSubtitle} mb-0`}
          >
            The Founder’s Legacy
          </p>
        </motion.div>
      </motion.div> */}


      {/* Scroll indicator & CTA (new container) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="position-absolute bottom-0 start-50 translate-middle-x pb-5 d-flex flex-column align-items-center"
        style={{ zIndex: 10 }}
      >
        {/* Call to Action - Now positioned at the bottom */}
        {/* <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`btn ${styles.btnGold} ${styles.heroCta} text-uppercase mb-4`} // Added margin-bottom
        >
            {ctaText}
        </motion.a> */}
        
        {/* Scroll Arrow Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={styles.textGold}
          style={{ fontSize: "2rem", textShadow: "0 6px 18px rgba(0,0,0,0.85)" }}
        >
          ↓
        </motion.div>
      </motion.div>

      {/* Optional subtle particles */}
      {/* {particles.map((p) => (
        <motion.div
          key={p.id}
          className={styles.heroParticle}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
          }}
          animate={{ y: [-10, -60], opacity: [p.opacity, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))} */}
    </div>
  );
}
