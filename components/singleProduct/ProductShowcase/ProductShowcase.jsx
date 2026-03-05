import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

const backgroundVariants = {
  initial: { opacity: 0.2 },
  animate: { opacity: 1, transition: { duration: 1.2 } },
  exit: { opacity: 0.2, transition: { duration: 0.6 } }
};

const GRADIENT_OVERLAY = "linear-gradient(180deg, rgba(10, 10, 10, 0.6) 0%, rgba(26, 26, 26, 0.9) 100%)";
const HIGHLIGHT_COLOR = "#e5d4b2";
const GLOW_COLOR = HIGHLIGHT_COLOR;

export default function FamilySection({ data = {} }) {
  const locale = useLocale();
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/${locale}/k-series/`;
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const items = [
    { 
      label: "K 2000",
      imgCenter: "/assets/images/kseries/bottle/past_center.png",
      imgLeft: "/assets/images/kseries/bottle/past_left.png",
      imgRight: "/assets/images/kseries/bottle/past_right.png",
      nameImg: "/assets/images/2000.svg",
      link: `${baseUrl}2000`,
      bgImg: "https://adminksa.ahmedalmaghribi.com/public/storage/banner/the-roots-background.jpg"
    },
    { 
      label: "K 2025",
      imgCenter: "/assets/images/kseries/bottle/present_center.png",
      imgLeft: "/assets/images/kseries/bottle/present_left.png",
      imgRight: "/assets/images/kseries/bottle/present_right.png",
      nameImg: "/assets/images/2025.svg",
      link: `${baseUrl}2025`,
      bgImg: "https://adminksa.ahmedalmaghribi.com/public/storage/banner/the-alchemy-lab-background.jpg"
    },
    { 
      label: "K 2050",
      imgCenter: "/assets/images/kseries/bottle/future_center.png",
      imgLeft: "/assets/images/kseries/bottle/future_left.png",
      imgRight: "/assets/images/kseries/bottle/future_right.png",
      nameImg: "/assets/images/2050.svg",
      link: `${baseUrl}2050`,
      bgImg: "https://adminksa.ahmedalmaghribi.com/public/storage/banner/the-beyond-background.jpg"
    }
  ];

  const [active, setActive] = useState(1);
  const rotateRight = () => setActive((prev) => (prev + 1) % 3);
  const rotateLeft = () => setActive((prev) => (prev + 2) % 3);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) rotateRight(); 
    if (info.offset.x > 60) rotateLeft();   
  };

  const getPosition = (index) => {
    if (index === active) return "center";
    if ((active + 1) % 3 === index) return "right"; 
    return "left";
  };

  const xOffset = isMobile ? 120 : 300;

  // Reduced rotateY because your images are already angled
  const positions = {
    center: { x: 0, z: 0, rotateY: 0, scale: isMobile ? 1.1 : 1.3, opacity: 1, zIndex: 10 },
    left: { x: -xOffset, z: -300, rotateY: 15, scale: 0.8, opacity: 0.4, zIndex: 5 },
    right: { x: xOffset, z: -300, rotateY: -15, scale: 0.8, opacity: 0.4, zIndex: 5 }
  };

  const currentBgImg = items[active].bgImg;
  const currentLabel = items[active].label;
  if (!mounted) return null;
  return (
    <>
      <style>{`
        .carousel-container-3d { perspective: 1500px; width: 100%; display: flex; justify-content: center; align-items: center; }
        .carousel-wrapper { position: relative; width: 100%; height: 50vh; display: flex; justify-content: center; align-items: center; transform-style: preserve-3d; }
        .carousel-item-container { position: absolute; width: 280px; height: 450px; transform-style: preserve-3d; }
        @media (max-width: 768px) { .carousel-item-container { width: 160px; height: 280px; } .carousel-wrapper { height: 35vh; } }
        .carousel-item-container:not(.active) { pointer-events: none; }
        .swiper-like-button {
          position: absolute;
          top: 50%;
          width: 44px;
          height: 44px;
          margin-top: -22px;
          z-index: 50;
          cursor: pointer;
          background: none;
          border: none;
        }

        .swiper-like-button::after {
          font-size: 38px;
          color: #e5d4b2;
          font-weight: bold;
        }

        .swiper-like-prev {
          left: 2%;
        }
        .swiper-like-prev::after {
          content: "‹";
        }

        .swiper-like-next {
          right: 2%;
        }
        .swiper-like-next::after {
          content: "›";
        }
      `}</style>

      <div style={{ position: "relative", color: "white", height: "100vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        
        {/* Background Layer */}
        <AnimatePresence initial={false}>
          <motion.div key={currentBgImg} variants={backgroundVariants} initial="initial" animate="animate" exit="exit" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
              <Image src={currentBgImg} alt="bg" fill priority style={{ objectFit: "cover" }} />
          </motion.div>
        </AnimatePresence>
        
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, background: GRADIENT_OVERLAY }} />

        <div className="container text-center" style={{ position: "relative", zIndex: 10, width: "100%", paddingTop: "10em" }}>
          <div className="carousel-container-3d">
            <div className="carousel-wrapper">
              {items.map((item, index) => {
                const pos = getPosition(index);
                const isCenter = index === active;
                
                return (
                  <motion.div
                    key={index}
                    className={`carousel-item-container ${isCenter ? 'active' : ''}`}
                    drag={isCenter ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    animate={positions[pos]}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    style={{ cursor: isCenter ? "grab" : "default", userSelect: 'none' }}
                  >
                    {/* Glow Component */}
                    {isCenter && (
                      <motion.div 
                        animate={{ opacity: 1 }} initial={{ opacity: 0 }}
                        style={{
                          position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
                          borderRadius: '50%', backgroundColor: GLOW_COLOR,
                          filter: `blur(60px) opacity(0.25)`, zIndex: -1,
                          transform: "translateZ(-50px)"
                        }}
                      />
                    )}

                    <Link href={item.link} style={{ display: 'block', height: '100%', position: 'relative', transformStyle: "preserve-3d" }}>
                      
                      {/* CENTER IMAGE LAYER */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: pos === "center" ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <Image src={item.imgCenter} fill style={{ objectFit: "contain" }} alt="center" priority />
                      </motion.div>

                      {/* LEFT IMAGE LAYER */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: pos === "left" ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <Image src={item.imgLeft} fill style={{ objectFit: "contain" }} alt="left" />
                      </motion.div>

                      {/* RIGHT IMAGE LAYER */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: pos === "right" ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <Image src={item.imgRight} fill style={{ objectFit: "contain" }} alt="right" />
                      </motion.div>

                    </Link>
                  </motion.div>
                );
              })}

              {/* <button onClick={rotateLeft} style={{ position: "absolute", left: "2%", top: "50%", zIndex: 50, background: "none", border: "none", color: HIGHLIGHT_COLOR, fontSize: "30px", cursor: "pointer", opacity: 0.5 }}>{"<"}</button>
              <button onClick={rotateRight} style={{ position: "absolute", right: "2%", top: "50%", zIndex: 50, background: "none", border: "none", color: HIGHLIGHT_COLOR, fontSize: "30px", cursor: "pointer", opacity: 0.5 }}>{">"}</button> */}
              <button
                className="swiper-like-button swiper-like-prev"
                onClick={rotateLeft}
                aria-label="Previous"
              >
              </button>

              <button
                className="swiper-like-button swiper-like-next"
                onClick={rotateRight}
                aria-label="Next"
              >
              </button>
            </div>
          </div>

          <motion.div style={{ width: "60px", height: "1px", background: `linear-gradient(to right, transparent, ${HIGHLIGHT_COLOR}, transparent)`, margin: "40px auto" }} />      

          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key={currentLabel} transition={{ delay: 0.1 }} className="d-flex flex-column align-items-center">
            <div style={{ position: "relative", width: isMobile ? "150px" : "220px", height: "80px" }}>
              <Image src={items[active].nameImg} alt={currentLabel} fill unoptimized style={{ objectFit: "contain" }} />
            </div>
          </motion.div>
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="d-flex flex-column align-items-center p-4">
                <Link
                 href="en/k-series">
                  <button
                    data-v-7aa9e1a2
                    data-v-8967c2b9
                    style={{
                      background: "linear-gradient(90deg, #a8a8a8 0%, #ffe6b0 50%, #4cb2ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      border: "1px solid rgb(255, 255, 255)",
                      padding: "12px 36px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      backdropFilter: "blur(6px)",
                      backgroundColor: "transparent",
                    }}
                  >
                    <span>Discover</span>
                  </button>
                 </Link>
          </motion.div>
          
        </div>
      </div>
    </>
  );
}
