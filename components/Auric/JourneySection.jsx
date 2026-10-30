"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import VideoPanel from "../VideoPanel";

function JourneySection({ data = {} }) {
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const isArabic = Boolean(data?.isArabic);

  return (
    <section
      style={{
        background: "#000000",
        color: "#f2f2f2",
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px",
      }}
    >
      <motion.div
        className="container"
        style={{
          maxWidth: "1180px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >

        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          style={{
            fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: "400",
            marginBottom: "18px",
            letterSpacing: isArabic ? "normal" : "0.04em",
            lineHeight: isArabic ? "1.3" : "1.2",
          }}
        >
          <span
            style={{
              fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
              background:
                "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "#d4af37",
              display: "inline-block",
              filter: "drop-shadow(0 2px 20px rgba(212, 175, 55, 0.35))",
            }}
          >
            {data?.journeyHeading || "The Story Continues"}
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
            fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
            color: "rgba(255, 255, 255, 0.78)",
            marginBottom: "40px",
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: "1.8",
            fontWeight: 300,
            letterSpacing: isArabic ? "normal" : "0.015em",
          }}
        >
          {data?.journeyDescription ||
            "Discover Auric’s story from the signature that came before it to its new expression."}
        </motion.p>

        {/* Video Container */}
        <motion.div
          variants={itemVariants}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            aspectRatio: "16 / 9",
            backgroundColor: "#000",
            boxShadow: isHovered
              ? "0 25px 80px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.12)"
              : "0 20px 60px rgba(0, 0, 0, 0.8)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
          }}
        >
          <VideoPanel
            src={data?.journeyVideoSrc || "/assets/videos/kseries/present_journey.mp4"}
            section="hundred"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              borderRadius: "16px",
              objectFit: "cover",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default JourneySection;
