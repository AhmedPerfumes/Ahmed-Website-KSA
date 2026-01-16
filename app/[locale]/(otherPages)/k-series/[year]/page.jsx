// app/kseries/[year]/page.js
"use client";

import React, { useState } from "react";
import Header14 from "@/components/headers/Header14";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import VideoSection from "@/components/k-series/VideoSection";
import NoteSection from "@/components/k-series/NoteSection";
import FamilySection from "@/components/k-series/FamilySection";
import HeroSection from "@/components/k-series/HeroSection";
import JourneySection from "@/components/k-series/JourneySection";
// import PrebookingWidget from "@/components/otherPages/KSeries/PrebookingWidget";
import { useRouter } from "next/navigation";

// central config: ONLY 3 choices
const K_CONFIG = {
  "2000": {
    key: "past",
    year: "2000",
    title: "K-Series 2000",
    subtitle: "The Roots",
    description:"A tribute to the origins of Arabian perfumery, 2000 - \“The Roots\” celebrates the timeless artistry that defines the brand’s foundation.",
   
    bottleImg: "/assets/images/kseries/bottle/past_center.png",
    videoSrc: "/assets/videos/kseries/past.mp4",
    notesImages: {
      top: "/assets/images/kseries/notes/past_top.jpg",
      mid: "/assets/images/kseries/notes/past_mid.jpg",
      base: "/assets/images/kseries/notes/past_base.jpg",
    },
     notesDescription:{
      top:"A bright, invigorating opening of grapefruit, jasmine, and aldehydes creates a sparkling freshness that instantly captures attention, setting the stage for an elegant, uplifting fragrance experience.",
      mid:"A rich floral heart unfolds with white flowers, lily, Indian rose, and saffron, blending softness and exotic warmth to create depth, sophistication, and irresistible allure.",
      base:"The fragrance lingers with a luxurious legacy accord of musks, warm woods, vanilla, ambroxan, incense, aged Shamama signature, and Oud Hindi, leaving a captivating, sensual, and memorable trail."
    },
    heroQuote:
      `"A homage to beginning,where heritage and innovation intertwined to form our foundation.It carries the fragrance of memory and nostalgia,honouring deep cultural roots.The Roots is not just past It is the legacy that anchors our journey forward"`,
    // visual theme
    accentColor: "#e5d4b2",
    textColor: "#ffffff",
    buttonColor: "#e5d4b2",
    familyImages: {
      left: "/assets/images/kseries/bottle/present_left.png",
      center: "/assets/images/kseries/bottle/past_center.png",
      right: "/assets/images/kseries/bottle/future_right.png",
    },
    journeyVideoSrc: "/assets/videos/kseries/past_journey.mp4",
    journeyHeading:"Journey Through Time"
  },
  "2025": {
    key: "present",
    year: "2025",
    title: "K-Series 2025",
    subtitle: "The Alchemy Lab",
    description:"2025 - \“The Alchemy Lab\” embodies the spirit of creation, transformation, and innovation — A reflection of today’s mastery in modern perfumery.",
    bottleImg: "/assets/images/kseries/bottle/present_center.png",
    videoSrc: "/assets/videos/kseries/present.mp4",
    notesImages: {
      top: "/assets/images/kseries/notes/present_top.jpg",
      mid: "/assets/images/kseries/notes/present_mid.jpg",
      base: "/assets/images/kseries/notes/present_base.jpg",
    },
    notesDescription: {
  top: "A vibrant, invigorating opening of bergamot, grapefruit, orange, mandarin, juniper, pepper, clary sage, saffron, and apple creates a sparkling, energetic freshness that awakens the senses.",
  mid: "A luxurious heart blends sambac jasmine, neroli, cardamom, black pepper, rose, ambrette, muguet, clary sage, bakhoor notes, and sandalwood, offering depth, warmth, and a sophisticated floral-spicy elegance.",
  base: "The fragrance settles into a rich, enduring base of musk, ambergris, cedar, patchouli, vetiver, leather accord, cashmeran, signature combodi oud, and guaiac wood, leaving a captivating, sensual, long-lasting trail."
},

    heroQuote:
      `"The present in motion where craft becomes art and ambition Transforms into achievement. It Celebrates the pride of a homogrown legacy. Expanding with purpose and vision."`,
    accentColor: "#85785a",
    textColor: "#ffffff",
    buttonColor: "#85785a",
    familyImages: {
      left: "/assets/images/kseries/bottle/past_left.png",
      center: "/assets/images/kseries/bottle/present_center.png",
      right: "/assets/images/kseries/bottle/future_right.png",
    },
    journeyVideoSrc: "/assets/videos/kseries/present_journey.mp4",
    journeyHeading:"Essence of Today"
  },
  "2050": {
    key: "future",
    year: "2050",
    title: "K-Series 2050",
    subtitle: "The Beyond",
    description:"2050 - \“The Beyond\” is an olfactory glimpse into tomorrow, where scent becomes an emotion — The ultimate expression of imagination and connection.",
    bottleImg: "/assets/images/kseries/bottle/future_center.png",
    videoSrc: "/assets/videos/kseries/future.mp4",
    notesImages: {
      top: "/assets/images/kseries/notes/future_top.jpg",
      mid: "/assets/images/kseries/notes/future_mid.jpg",
      base: "/assets/images/kseries/notes/future_base.jpg",
    },
    notesDescription: {
  top: "A fresh and fruity opening of mandarin, peach, orange, pear, bergamot, and ginger creates an uplifting, vibrant, and energizing introduction that delights the senses.",
  mid: "A captivating heart of freesia, sambac jasmine, orange blossom, leather, woody notes, and saffron blends floral elegance with warm, spicy, and sophisticated undertones.",
  base: "The fragrance settles into a rich, lasting base of musk, vanilla, rose, bakhoory accord, ambroxan, cedar, and incense, leaving a sensual, warm, and memorable trail."
},

    heroQuote:
      `"A gaze into tomorrow, where dreams stretch beyond horizon and hope shape destiny. It reflects vision, light and promise the boundless essence of what is yet to come. The Beyond is more than the Future it is the spirit of endless "`,
    accentColor: "#40f5f5",
    textColor: "#f7f2e6",
    buttonColor: "#40f5f5",
    familyImages: {
      left: "/assets/images/kseries/bottle/past_left.png",
      center: "/assets/images/kseries/bottle/future_center.png",
      right: "/assets/images/kseries/bottle/present_right.png",
    },
    journeyVideoSrc: "/assets/videos/kseries/future_journey.mp4",
    journeyHeading:"Whispers of the Future"
  },
};

function resolveConfig(year) {
  if (year in K_CONFIG) return K_CONFIG[year];
  // fallback: 2000
  return K_CONFIG["2000"];
}

export default function Page({ params }) {
  const router = useRouter();
  const rawYear = params?.year?.toString() || "2000";
  const data = resolveConfig(rawYear);
  const [showPrebooking, setShowPrebooking] = useState(false);

  // const handleBookNow = () => setShowPrebooking(true);

  const handleBookNow = () => {
    const rawYear = params?.year?.toString() || "2000";
    router.push(`/en/shop/perfumes/oriental-fragrance/${K_CONFIG[rawYear].subtitle.toLowerCase().replace(/\s+/g, "-")}-${rawYear}`);
  };

  return (
    <>
      <Header14 />

      {/* Optional: visual divider */}
      {/* <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, #b8860b 0%, #d4af37 25%, #f7e9a0 50%, #d4af37 75%, #b8860b 100%)", borderRadius: "2px"}} /> */}

      <VideoSection data={data} />
      <HeroSection data={data} onBookNow={handleBookNow} />
      <JourneySection data={data} />
      <NoteSection data={data} />
      <FamilySection data={data} />
       {/* <PrebookingWidget showModal={showPrebooking} setShowModal={setShowPrebooking} /> */}

      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5">
        <div className="MobileFooter">
          <MobileFooter2 />
        </div>
      </section>
    </>
  );
}
