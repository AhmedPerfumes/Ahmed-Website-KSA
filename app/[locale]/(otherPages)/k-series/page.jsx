// app/kseries/page.js

"use client";
import React, { useState } from "react";
import HeroSection from "../../../../components/otherPages/KSeries/HeroSection";
import KSeriesProductCards from "@/components/otherPages/KSeries/KSeriesProductCards";
import Footer14 from "@/components/footers/Footer14";
import FoundersStoryTransition from "@/components/otherPages/KSeries/FoundersStoryTransition";
// import PrebookingWidget from "@/components/otherPages/KSeries/PrebookingWidget";
import VideoSectionStatic from "@/components/otherPages/KSeries/VideoSectionStatic";


export default function Page() {
      const [showPrebooking, setShowPrebooking] = useState(false);
    return (
        <>
            {/* comment */}
            <main className="">
                <HeroSection />
                <KSeriesProductCards />
                <FoundersStoryTransition />
                <VideoSectionStatic/>
            </main>
            {/* <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, #b8860b 0%, #d4af37 25%, #f7e9a0 50%, #d4af37 75%, #b8860b 100%)", borderRadius: "2px"}}></div> */}

            <Footer14 />
            {/* <PrebookingWidget showModal={showPrebooking} setShowModal={setShowPrebooking}/> */}
        </>
    );
}
