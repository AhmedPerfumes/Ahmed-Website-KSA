"use client";
import React, { useRef, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

// LuxuryLanding: immersive 3‑scene product journey (morning / evening / night)
// Right: layered 3D bottles; Left: product copy and price, both scroll‑driven.
// Uses Bootstrap grid classes for responsive layout.
export default function LuxuryLanding() {
  const rootRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });

  // Scene mood colors (morning → evening → night)
  const bgStart = useTransform(scrollYProgress, [0, 0.5, 1], ["#0f0c07", "#2a140f", "#050813"]);
  const bgEnd = useTransform(scrollYProgress, [0, 0.5, 1], ["#2a1d0b", "#1a1b2a", "#00020a"]);
  const background = useMotionTemplate`linear-gradient(180deg, ${bgStart} 0%, ${bgEnd} 100%)`;

  // Ambient light intensity per mood
  const lightOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.28, 0.38, 0.24]);

  // Product data (swap with brand content / images under public/)
  const products = useMemo(
    () => [
      {
        key: "past",
        year: "2000",
        title: "The Roots",
        name: "2000 — The Roots",
        desc: "Vintage warmth in golden browns: grounded woods, hushed spice, and a signature amber glow.",
        price: "$145",
        img: "/assets/images/past.png",
      },
      {
        key: "present",
        year: "2025",
        title: "The Alchemy Lab",
        name: "2025 — The Alchemy Lab",
        desc: "Modern lab clarity: silver, glass, precise florals and mineral brightness in perfect balance.",
        price: "$165",
        img: "/assets/images/present.png",
      },
      {
        key: "future",
        year: "2050",
        title: "The Beyond",
        name: "2050 — The Beyond",
        desc: "Futuristic neon aura: cosmic musk, dark fruits, and luminous oud bending time forward.",
        price: "$195",
        img: "/assets/images/future.png",
      },
    ],
    []
  );

  // Stage windows
  const s1 = { in: [0, 0.18, 0.33], out: [1, 1, 0] };
  const s2 = { in: [0.32, 0.5, 0.68], out: [0, 1, 0] };
  const s3 = { in: [0.66, 0.82, 1], out: [0, 1, 1] };

  // Copy transitions (left column)
  const name1Opacity = useTransform(scrollYProgress, s1.in, s1.out);
  const name2Opacity = useTransform(scrollYProgress, s2.in, s2.out);
  const name3Opacity = useTransform(scrollYProgress, s3.in, s3.out);
  const nameX = useTransform(scrollYProgress, [0, 1], [8, 0]);

  // 3D stack transforms (right column)
  const centerScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.06, 1.02]);
  const centerY = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -6]);

  // Side cards gently swap sides as scenes change
  const leftX = useTransform(scrollYProgress, [0, 0.5, 1], [-140, -110, -140]);
  const rightX = useTransform(scrollYProgress, [0, 0.5, 1], [140, 110, 140]);

  // Opacity by scene for each bottle (center focus swaps through scenes)
  const b1Opacity = name1Opacity;
  const b2Opacity = name2Opacity;
  const b3Opacity = name3Opacity;

  // Particles / orbs parallax
  const orbOffset = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const orbOffsetX = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const orbOffsetXNeg = useTransform(orbOffsetX, (v) => -v);

  const handleBuy = useCallback(() => {
    // placeholder: connect to PDP or modal cart
  }, []);

  const goToScene = useCallback((i) => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    const rect = el.getBoundingClientRect();
    const total = el.scrollHeight - window.innerHeight;
    const anchors = [0, 0.5, 1];
    const y = window.scrollY + rect.top + anchors[i] * total;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <section ref={rootRef} className="position-relative" style={{ height: "320vh" }}>
      <motion.div className="position-sticky top-0 w-100" style={{ height: "100vh", background }}>
        {/* Hero heading */}
        <motion.div className="position-absolute start-50 translate-middle-x text-center" style={{ top: 28 }}>
          <h1 className="display-3 fw-semibold m-0" style={{ color: "#f5f7fb", letterSpacing: 1.2 }}>The K Series</h1>
          <p className="mt-2 mb-0" style={{ color: "#dfe5f3", letterSpacing: 0.6 }}>A Journey Through Time, in Scent.</p>
        </motion.div>
        {/* Ambient light */}
        <motion.div
          aria-hidden
          className="position-absolute start-50 translate-middle rounded-circle"
          style={{
            top: "45%",
            width: "90vmin",
            height: "90vmin",
            background: "radial-gradient(closest-side, rgba(255,255,255,0.18), rgba(255,255,255,0) 65%)",
            opacity: lightOpacity,
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />

        {/* Floating socials */}
        <div className="position-absolute" style={{ left: 18, top: "50%", transform: "translateY(-50%)" }}>
          <ul className="list-unstyled m-0 d-flex flex-column gap-2">
            {["IG", "FB", "YT"].map((l) => (
              <li key={l}>
                <a
                  href="#"
                  aria-label={l}
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                  style={{ width: 38, height: 38, border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }}
                >
                  <span style={{ fontSize: 12, letterSpacing: 1 }}>{l}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline nav */}
        <div className="position-absolute" style={{ right: 16, top: "50%", transform: "translateY(-50%)" }}>
          <ul className="list-unstyled m-0 d-flex flex-column align-items-end gap-2 timeline-nav">
            <li>
              <button type="button" className="timeline-btn" onClick={() => goToScene(0)}>
                <span className="timeline-dot" />
                <span className="timeline-label">2000</span>
              </button>
            </li>
            <li>
              <button type="button" className="timeline-btn" onClick={() => goToScene(1)}>
                <span className="timeline-dot" />
                <span className="timeline-label">2025</span>
              </button>
            </li>
            <li>
              <button type="button" className="timeline-btn" onClick={() => goToScene(2)}>
                <span className="timeline-dot" />
                <span className="timeline-label">2050</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Particles / orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + (i % 3) * 25}%`,
              width: 14 + (i % 3) * 6,
              height: 14 + (i % 3) * 6,
              background: "rgba(255,255,255,0.22)",
              filter: "blur(6px)",
              y: orbOffset,
              x: i % 2 ? orbOffsetX : orbOffsetXNeg,
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
        ))}

        <div className="container h-100 position-relative">
          <div className="row h-100 align-items-center">
            {/* Left: Product copy */}
            <div className="col-12 col-lg-5 order-2 order-lg-1 text-center text-lg-start">
              <div className="position-relative" style={{ minHeight: 240 }}>
                <motion.div style={{ opacity: name1Opacity, x: nameX }} className="position-absolute w-100">
                  <h1 className="display-5 fw-semibold lh-1 luxe-title">{products[0].name}</h1>
                  <p className="lead luxe-desc mb-2">{products[0].desc}</p>
                  <div className="d-flex align-items-center gap-3 justify-content-center justify-content-lg-start">
                    <span className="luxe-price">{products[0].price}</span>
                    <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={handleBuy}>Shop Now</button>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: name2Opacity, x: nameX }} className="position-absolute w-100">
                  <h1 className="display-5 fw-semibold lh-1 luxe-title">{products[1].name}</h1>
                  <p className="lead luxe-desc mb-2">{products[1].desc}</p>
                  <div className="d-flex align-items-center gap-3 justify-content-center justify-content-lg-start">
                    <span className="luxe-price">{products[1].price}</span>
                    <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={handleBuy}>Shop Now</button>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: name3Opacity, x: nameX }} className="position-absolute w-100">
                  <h1 className="display-5 fw-semibold lh-1 luxe-title">{products[2].name}</h1>
                  <p className="lead luxe-desc mb-2">{products[2].desc}</p>
                  <div className="d-flex align-items-center gap-3 justify-content-center justify-content-lg-start">
                    <span className="luxe-price">{products[2].price}</span>
                    <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={handleBuy}>Shop Now</button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Layered 3D bottles */}
            <div className="col-12 col-lg-7 order-1 order-lg-2 mb-5 mb-lg-0">
              <div className="d-flex justify-content-center justify-content-lg-end">
                <div className="luxe-viewport position-relative">
                  <div className="luxe-stage position-absolute top-50 start-50 translate-middle">
                    {/* Left / back */}
                    <motion.img
                      src={products[0].img}
                      alt={products[0].name}
                      className="luxe-bottle side left"
                      style={{ x: leftX, rotateY: 18, scale: 0.9, filter: "blur(1.6px) brightness(0.95)" }}
                    />
                    {/* Center focus (scene‑driven) */}
                    <motion.img
                      src={products[0].img}
                      alt={products[0].name}
                      className="luxe-bottle center"
                      style={{ opacity: b1Opacity, scale: centerScale, y: centerY }}
                    />
                    <motion.img
                      src={products[1].img}
                      alt={products[1].name}
                      className="luxe-bottle center"
                      style={{ opacity: b2Opacity, scale: centerScale, y: centerY }}
                    />
                    <motion.img
                      src={products[2].img}
                      alt={products[2].name}
                      className="luxe-bottle center"
                      style={{ opacity: b3Opacity, scale: centerScale, y: centerY }}
                    />
                    {/* Right / back */}
                    <motion.img
                      src={products[2].img}
                      alt={products[2].name}
                      className="luxe-bottle side right"
                      style={{ x: rightX, rotateY: -18, scale: 0.9, filter: "blur(1.6px) brightness(0.95)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .luxe-title {
            color: #f5f7fb;
            letter-spacing: 0.4px;
            text-shadow: 0 2px 24px rgba(0,0,0,.28);
            font-family: ui-serif, Georgia, "Times New Roman", serif;
          }
          .luxe-desc {
            color: #d6dbe6;
            max-width: 34rem;
            margin-left: 0;
            margin-right: 0;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .luxe-price {
            color: #ffffff;
            font-weight: 600;
            letter-spacing: 0.6px;
          }
          .luxe-viewport {
            width: min(86vmin, 720px);
            height: min(70vmin, 560px);
            perspective: 1200px;
            overflow: hidden; /* sides half-cut */
          }
          .luxe-stage { width: 100%; height: 100%; }
          .luxe-bottle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(46vmin, 420px);
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 36px 70px rgba(0,0,0,.55));
            will-change: transform, opacity, filter;
            user-select: none;
            pointer-events: none;
          }
          .luxe-bottle.center { z-index: 2; }
          .luxe-bottle.side { z-index: 1; opacity: 0.75; }
          .luxe-bottle.side.left { transform: translate(-50%, -50%) rotateY(18deg); }
          .luxe-bottle.side.right { transform: translate(-50%, -50%) rotateY(-18deg); }

          @media (max-width: 576px) {
            .luxe-viewport { width: 92vw; height: 58vh; }
            .luxe-bottle { width: 62vw; }
          }
        `}</style>
      </motion.div>
    </section>
  );
}
