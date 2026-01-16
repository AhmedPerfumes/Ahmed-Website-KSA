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

  return (
    <section
      style={{
        background:
          "radial-gradient(circle at top, rgba(229,212,178,0.16) 0%, transparent 55%) #000000",
        color: "#f2f2f2",
        position: "relative",
        overflow: "hidden",
        padding: "80px 20px",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(229,212,178,0.08), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

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
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(229,212,178,0.35)",
            background: "rgba(10,10,10,0.9)",
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#e5d4b2",
            marginBottom: "24px",
          }}
        >
          <span style={{ width: "8px", height: "8px", background: "#e5d4b2", borderRadius: "50%" }} />
          {data?.subtitle}
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "700",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #e5d4b2 0%, #f2f2f2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1.2",
          }}
        >
          {data?.journeyHeading}
          {/* Journey Through Time */}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: "1rem",
            color: data?.mutedTextColor || "rgba(242, 242, 242, 0.7)",
            marginBottom: "60px",
            maxWidth: "600px",
            margin: "0 auto 60px",
          }}
        >
          Experience the essence of {data?.subtitle} through our cinematic journey
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
            minHeight: "600px",
            boxShadow: isHovered
              ? "0 30px 100px rgba(229, 212, 178, 0.3)"
              : "0 20px 60px rgba(229, 212, 178, 0.15)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "scale(1.02)" : "scale(1)",
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              background:
                "radial-gradient(circle at center, rgba(229,212,178,0.2), transparent 70%)",
              pointerEvents: "none",
              borderRadius: "16px",
              zIndex: 2,
            }}
          />

          <VideoPanel
            src={data?.journeyVideoSrc || "/assets/videos/kseries/joruney.mp4"}
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