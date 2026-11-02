"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import VideoPanel from "../VideoPanel";

function VideoSection({ data = {} }) {
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const {
    accentColor: accent = "#c2596c",
    textColor = "#dcdcdc",
    title = "Auric",
    subtitle = "The Regal Expression",
    year = "Exclusive Edition",
    description = "Discover the artistry and opulence behind Auric, crafted with rare essences, precious amber, and sublime woods.",
    videoSrc = "/assets/videos/auric/auric-video.mp4",
  } = data || {};

  const isArabic = Boolean(data?.isArabic);

  return (
    <section
      style={{
        width: "100%",
        height: "auto",
        background: "#000000",
        color: "#ffffff",
        padding: "clamp(48px, 8vw, 100px) clamp(10px, 3.5vw, 24px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* CONTENT WRAPPER */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* VIDEO FIRST */}
        <motion.div
          variants={itemVariants}
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            borderRadius: "clamp(12px, 3vw, 20px)",
            overflow: "hidden",
            aspectRatio: "16/9",
            backgroundColor: "#000",
            boxShadow: "0 25px 70px rgba(0, 0, 0, 0.6)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <VideoPanel
            src={videoSrc}
            section="hundred"
            className="w-100 h-100"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              border: "none",
              outline: "none",
              transition: "opacity 0.4s ease",
              opacity: 0.98,
            }}
          />

          {/* Gradient overlays for depth and style */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.15), transparent, rgba(138,30,48,0.08))",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* CONTENT BELOW VIDEO */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: "clamp(36px, 5.5vw, 56px)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Eyebrow Subheading: Refined, delicate, wide-tracked couture label */}
          <div style={{ marginBottom: "12px" }}>
            <span
              className="auric-subheading"
              style={{
                fontFamily: isArabic
                  ? "inherit"
                  : "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
                fontSize: "clamp(0.76rem, 1.0vw, 0.92rem)",
                lineHeight: 1.3,
                letterSpacing: isArabic ? "normal" : "0.32em",
                marginRight: isArabic ? "0" : "-0.32em",
                fontWeight: 500,
                textTransform: isArabic ? "none" : "uppercase",
                display: "inline-block",
                background:
                  "linear-gradient(135deg, #FFF3D0 0%, #FAD06C 40%, #DDA136 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 1px 8px rgba(221, 161, 54, 0.2))",
              }}
            >
              {isArabic
                ? (data?.subtitle || data?.videoTopText || "تطور الأيقونة")
                : (data?.subtitle || data?.videoTopText || "The Evolution of an Icon").toUpperCase()}
            </span>
          </div>

          {/* Main Monumental Heading: Regal 24K Imperial Gold */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <h1
              style={{
                fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                fontSize: "clamp(2.3rem, 5.8vw, 4.2rem)",
                lineHeight: isArabic ? 1.3 : 1.15,
                fontWeight: 400,
                letterSpacing: isArabic ? "normal" : "0.14em",
                marginRight: isArabic ? "0" : "-0.14em",
                textTransform: isArabic ? "none" : "uppercase",
                margin: 0,
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                  background:
                    "linear-gradient(135deg, #FFF3D0 0%, #FAD06C 25%, #DDA136 50%, #FDE28A 75%, #B37B22 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                  filter: "drop-shadow(0 2px 22px rgba(221, 161, 54, 0.3))",
                }}
              >
                {isArabic
                  ? (data?.videoTitle || "عود آند روزيز أوريك")
                  : (data?.videoTitle || "Oud & Roses Auric").toUpperCase()}
              </span>
            </h1>
          </div>

          {/* Subtle Haute-Parfumerie Hairline Accent */}
          <div
            style={{
              width: "48px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #DDA136, transparent)",
              margin: "18px auto 20px",
              opacity: 0.7,
            }}
            aria-hidden="true"
          />

          {/* Poetic Narrative Description: Warm Silk Ivory with balanced cadence */}
          <p
            style={{
              maxWidth: "640px",
              margin: "0 auto",
              lineHeight: 1.85,
              fontSize: "clamp(0.95rem, 1.25vw, 1.1rem)",
              fontWeight: 400,
              color: "rgba(235, 230, 218, 0.82)",
              letterSpacing: isArabic ? "normal" : "0.025em",
              textWrap: "balance",
            }}
          >
            {data?.videoDescription ||
              "A founder’s signature. A house’s evolution. A gift to the people who made the journey possible."}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default VideoSection;
