"use client";
import React, { useEffect, useRef } from "react";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules"; // Import the Pagination module
import "./Shop5.css"; // Import your CSS file for styling

const Shop5 = () => {
  const swiperRef = useRef(null); // Create a ref to the Swiper instance

  // Function to handle slide change
  const handleSlideChange = () => {
    if (swiperRef.current) {
      const { activeIndex, slides } = swiperRef.current.swiper;

      // Disable mousewheel interaction on the last slide
      if (activeIndex === slides.length - 1) {
        swiperRef.current.swiper.mousewheel.disable();

        // Delay the scroll to the next section by 2 seconds
        setTimeout(() => {
          const nextSection = document.getElementById('next-section'); // Replace with the actual ID of the next section
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly to the next section
          }
        }, 1000); // 2000ms = 2 seconds delay
      } else {
        swiperRef.current.swiper.mousewheel.enable(); // Enable mousewheel interaction for other slides
      }
    }
  };

  return (
    <div className="scrollify-container">
      <Swiper
        ref={swiperRef} // Attach the ref to the Swiper
        direction="vertical"
        mousewheel={true}
        modules={[Mousewheel, Pagination]} // Add Pagination module
        pagination={{
          clickable: true, // Make pagination circles clickable
          renderBullet: (index, className) => {
            return `<span class="${className} circle-pagination"></span>`; // Custom rendering of pagination circles
          },
        }}
        style={{ height: "100vh" }} // Make sure Swiper takes full height
        onSlideChange={handleSlideChange} // Handle slide change event
        onInit={handleSlideChange} // Call handleSlideChange on Swiper initialization
      >
        <SwiperSlide className="panel">
          <img
            src="/assets/images/home/demo8/gift-sets/oud-and-roses-gift-set-bnr.jpg"
            alt="Oud and Roses Gift Set"
          />
        </SwiperSlide>
        <SwiperSlide className="panel">
          <img
            src="/assets/images/home/demo8/gift-sets/shauque-al-shuyookh-bnr.jpg"
            alt="Shauque Al Shuyookh Gift Set"
          />
        </SwiperSlide>
        <SwiperSlide className="panel">
          <img
            src="/assets/images/home/demo8/gift-sets/Ihdakhaas-banner.jpg"
            alt="Bidun Esam Gift Set"
          />
        </SwiperSlide>
        <SwiperSlide className="panel">
          <img
            src="/assets/images/home/demo8/gift-sets/dakhoon-collection-bnr.jpg"
            alt="The Dukhoon Collection"
          />
        </SwiperSlide>
      </Swiper>

      {/* This is the next section to scroll to */}
  
    </div>
  );
};

export default Shop5;
