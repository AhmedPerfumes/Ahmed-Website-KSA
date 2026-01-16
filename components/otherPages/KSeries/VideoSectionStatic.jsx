import React from "react";
import { motion } from "framer-motion";

function VideoSectionStatic() {
  const accent = "#e5d4b2";
  const textColor = "#dcdcdc";
  const year = "2000";
  const subtitle = "The Chronicles of Ahmed Al Maghribi";
  const description = "Discover the artistry behind each era of the K-Series collection.";

  return (
    <section
      style={{
        width: "100%",
        background: "#000",
        color: "#fff",
        padding: "80px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* TEXT FIRST */}
        <div style={{ marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
              lineHeight: 1.2,
              color: "#fff",
              marginTop: "16px",
              marginBottom: "0px",
              fontWeight: 600,
            }}
          >
            <span style={{ color: accent, fontWeight: 500 }}>
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
        </div>

        {/* RESPONSIVE VIDEO IFRAME */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            height: 0,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/SYCOHX2Ni_4?rel=0&modestbranding=1&showinfo=0&autoplay=0&mute=1&loop=1"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "0",
            }}
            title="The Chronicles Of Ahmed Al Maghribi"
            frameborder="0"
            allow="picture-in-picture;"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </motion.div>
    </section>
  );
}

export default VideoSectionStatic;