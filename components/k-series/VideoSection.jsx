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
    accentColor: accent = "#e5d4b2",
    textColor = "#dcdcdc",
    title = "K-Series",
    subtitle = "Signature Chapter",
    year = "2000",
    description = "Discover the artistry behind each era of the K-Series collection.",
    videoSrc = "/assets/videos/kseries/past.mp4",
  } = data || {};

  return (
    <section
      style={{
        width: "100%",
        height: "auto",
        background: "#000",
        color: "#fff",
        padding: "80px 20px",
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
            borderRadius: "20px",
            overflow: "hidden",
            aspectRatio: "16/9",
            backgroundColor: "#000",
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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              border: "none",
              outline: "none",
              transition: "opacity 0.4s ease",
              opacity: 0.95,
            }}
          />


          {/* Gradient overlays for depth and style */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.15), transparent, rgba(229,212,178,0.05))",
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
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
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
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* CONTENT BELOW VIDEO */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: "60px",
            textAlign: "center",
            color: textColor,
          }}
        >
          <p
            style={{
              letterSpacing: "0.4em",
              fontSize: "1rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: accent,
              opacity: 0.85,
              marginBottom: "18px",
            }}
          >
            K-Series {"\u2022"} {year}
          </p>
          <h2
            style={{
              fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
              lineHeight: 1.2,
              color: "#fff",
              marginTop: "16px",
              marginBottom: "24px",
              fontWeight: 600,
            }}
          >
            {/* {title}{" "} */}
            <span style={{ color: accent, fontWeight: 500 }}>
              {/* {"\u2014"} */}
              {subtitle}
            </span>
          </h2>
          <p
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              lineHeight: 1.9,
              fontSize: "1.1rem",
              fontWeight: 300,
              color: textColor,
            }}
          >
            {description}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default VideoSection;
