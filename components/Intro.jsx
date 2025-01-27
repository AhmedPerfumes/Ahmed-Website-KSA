"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Intro = () => {
  const containerRef = useRef(null);
  const images = [];
  const totalFrames = 353; // Number of frames

  // Preload the images
  useEffect(() => {
    for (let i = 1; i <= totalFrames; i++) {
      images.push(`/assets/webp/${i}.webp`); // Adjust the path if needed
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    let frameIndex = { value: 0 };
    const updateFrame = () => {
      const frame = Math.round(frameIndex.value);
      container.style.backgroundImage = `url(${images[frame]})`;
    };

    // Ensure images are preloaded before animation starts
    const preloadImages = () => {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();

    // Set up the GSAP animation
    gsap.to(frameIndex, {
      value: totalFrames - 1,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: `+=${totalFrames * 8}`, // Increase this value for a longer scroll distance
        scrub: 1,
        markers: true, // Debug markers for start and end points
      },
      onUpdate: updateFrame,
    });

    return () => {
      ScrollTrigger.killAll();
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export default Intro;
