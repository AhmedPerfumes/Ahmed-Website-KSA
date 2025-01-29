"use client";
import { useEffect, useRef, useState } from "react";
import "./Canvas.css";

const MobileAnimation = () => {
  const previousScrollY = useRef(0); // Store previous scroll position
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [showModal, setShowModal] = useState(true); // Modal state
  const [currentTextSlide, setCurrentTextSlide] = useState(null); // Track text slide

  const totalImages = 136; // Total frames

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollTop / totalHeight; // Get scroll percentage (0 to 1)
    const imageIndex = Math.floor(scrollPercentage * totalImages); // Calculate image index

    // Show specific text slides based on the frame range
    if (imageIndex >= 1 && imageIndex <= 8) {
      setCurrentTextSlide(1);
    } else {
      setCurrentTextSlide(null); // Hide text when not in specified ranges
    }

    // Auto-scroll to next section
    const currentScrollY = window.scrollY;
    if (currentScrollY > previousScrollY.current && imageIndex === 8) {
      const nextSection = document.getElementById("main2");
      if (nextSection) {
        setShowSkipButton(false);
        setCurrentTextSlide(null);
        nextSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    previousScrollY.current = currentScrollY;
  };

  const skipAnimation = () => {
    console.log("Skip button clicked");
    
    const nextSection = document.getElementById("main2");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
      setShowSkipButton(false);
    }
  };

  useEffect(() => {
    // Modal behavior
    const modalTimer = setTimeout(() => {
      setShowModal(false);
    }, 3000);

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    // if (showModal) {
    //   document.body.style.overflow = "hidden";
    // } else {
    //   document.body.style.overflow = "auto";
    // }

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(modalTimer);
    };
  }, [showModal]);

  return (
    <section className="sectionWebMob">
      {/* Modal */}
      {showModal && (
        <div className="modal loader-modal">
          <div className="modal-content loader-modal-content">
            <div className="preload">
              <img
                src="/assets/preloader.gif"
                alt="Modal Image"
                className="preloader-gif"
              />
            </div>
          </div>
        </div>
      )}

      <div
        scroll-frames="demo"
        data-url-mask="/assets/mobilescreencomp/|1 to 136|.jpg"
        data-background-size="cover"
        data-detector="the_detector"
      ></div>

      <hr id="the_detector" />
      {showSkipButton && (
        <button onClick={skipAnimation} className="skip-button2">
          SKIP INTRO
        </button>
      )}

      {/* Text Slide Animations */}
      <div className="text-slide-container">
        {currentTextSlide === 1 && (
          <>
            <p className="text-uppercase text-white fw-medium text-nowrap">
              Explore The New Experience
            </p>
            <h2 className="fw-lighter text-white text-wrap">
              Step Into The World of Fragrance Wonders
            </h2>
          </>
        )}
      </div>
    </section>
  );
};

export default MobileAnimation;
