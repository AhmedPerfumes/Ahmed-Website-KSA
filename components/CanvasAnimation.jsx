"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollToPlugin from "gsap/ScrollToPlugin";

import "./Canvas.css";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const CanvasAnimation = () => {
  const canvasRef = useRef(null);
  const previousScrollY = useRef(0); // Store previous scroll position for comparison
  const [showSkipButton, setShowSkipButton] = useState(false);
  const frameCount = 343;
  let images = [];
  let ball = { frame: 0 };

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0); // Delay the scroll action to ensure it's executed after render

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const currentFrame = (index) =>
      `/assets/final/${(index + 1).toString()}.jpg`;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    const render = () => {
      if (images[0]) {
        context.canvas.width = images[0].width;
        context.canvas.height = images[0].height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(images[ball.frame], 0, 0);
      }
    };

    images[0].onload = render;

    gsap.to(ball, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 1,
        pin: canvas,
        end: "250%",
        onEnter: () => setShowSkipButton(true),
        onLeave: () => setShowSkipButton(false),
      },
      onUpdate: () => {
        render();
        const currentScrollY = window.scrollY;
        if (currentScrollY > previousScrollY.current) {
          // console.log(Math.round(ball.frame) +'==='+ frameCount);
          if (Math.round(ball.frame) + 50 > frameCount - 2) {
            gsap.to(window, {
              scrollTo: { y: "#main2", autoKill: false },
              duration: 0.5,
              ease: "power2.inOut",
            });
          }
        }
        previousScrollY.current = currentScrollY;
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const skipAnimation = () => {
    gsap.to(window, {
      scrollTo: { y: "#main2", autoKill: false },
      duration: 0.5,
      ease: "power2.inOut",
    });
  };

  return (
    <div>
      <canvas ref={canvasRef} className="canvas"></canvas>
      {showSkipButton && (
        <button onClick={skipAnimation} className="skip-button">
          SKIP INTRO
        </button>
      )}
    </div>
  );
};

export default CanvasAnimation;
