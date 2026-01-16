import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import "./HeroSection.css";

function HeroSection({ data = {}, onBookNow }) {
  return (
    <section className="hero-section d-flex align-items-center justify-content-center text-white">
      <div className="overlay"></div>

      <div className="container position-relative z-1">
        <div className="row align-items-center">
          {/* Left Column: Perfume Bottle */}
          <div className="col-lg-6 text-center mb-5 mb-lg-0 order-2 order-lg-1">
            <motion.div
              className="hero-image position-relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Image
                src={data?.bottleImg || "/assets/images/kseries/past-center.png"}
                alt={data?.title || "K Series Perfume Bottle"}
                width={600}
                height={800}
                className="perfume-bottle"
                style={{ width: '100%', height: 'auto' }}
              />
              <div className="bottle-glow"></div>
              <div className="bottle-glow-small"></div>
            </motion.div>
          </div>

          {/* Right Column: Owner Message */}
          <div className="col-lg-6 order-1 order-lg-2">
            <motion.div
              className="hero-message ps-0 ps-lg-5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="display-4 fw-bold mb-4 fade-in-top" style={{ color: data?.accentColor || '#e5d4b2' }}>
                {data?.title || 'K Series'}: <span style={{ color: data?.textColor || '#ffffff' }}>{data?.subtitle || 'Past'}</span>
              </h1>

              <motion.div
                className="mb-4"
                style={{
                  width: "60px",
                  height: "2px",
                  background: "linear-gradient(to right, #e5d4b2, transparent)",
                }}
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />

              <p className="lead mb-4 fade-in-top delay-1" style={{ fontSize: "1.1rem", lineHeight: "1.9", color: data?.textColor || '#dcdcdc' }}>
                <em>{data?.heroQuote || '"This perfume is a tribute to the memories that shaped us."'}</em>
              </p>

              <p className="fst-italic mb-5 fade-in-top delay-2" style={{ fontSize: "0.95rem", color: data?.textColor || '#ffffff' }}>
                — Crafted by our founder — Mr. Kafeel Ahmed
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  className="btn btn-lg px-5 py-3 fade-in-top delay-3"
                  style={{
                    background: data?.buttonColor || '#ffffff',
                    color: data?.buttonTextColor || '#111',
                    borderRadius: 50, // pill shape
                    border: 'none'
                  }}
                  onClick={onBookNow}
                >
                  Buy Now
                </button>

              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
