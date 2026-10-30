"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const NOTE_TIERS = [
  {
    tier: "01",
    title: "Top Notes",
    glowColor: "rgba(212, 175, 55, 0.22)",
    borderColor: "rgba(212, 175, 55, 0.28)",
    tagBg: "rgba(212, 175, 55, 0.08)",
    tagColor: "#e6cf94",
    notes: ["Bright Orange", "Cardamom", "Black Pepper", "Saffron", "Leather"],
  },
  {
    tier: "02",
    title: "Heart Notes",
    glowColor: "rgba(212, 175, 55, 0.22)",
    borderColor: "rgba(212, 175, 55, 0.28)",
    tagBg: "rgba(212, 175, 55, 0.08)",
    tagColor: "#e6cf94",
    notes: ["Turkish Rose", "Orris Root", "Balkan Immortelle", "Heliotrope"],
  },
  {
    tier: "03",
    title: "Base Notes",
    glowColor: "rgba(212, 175, 55, 0.22)",
    borderColor: "rgba(212, 175, 55, 0.28)",
    tagBg: "rgba(212, 175, 55, 0.08)",
    tagColor: "#e6cf94",
    notes: ["Sacred Oud", "Vanilla Bean", "Patchouli", "Musk", "Incense", "Ambroxan"],
  },
];

export default function NoteSection({ data = {} }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  const defaultNoteImgs = {
    top: "/assets/images/auric/top.jpeg",
    mid: "/assets/images/auric/heart.jpeg",
    base: "/assets/images/auric/base.jpeg",
  };

  const noteImgs = Object.assign({}, defaultNoteImgs, data?.notesImages || {});
  const notesDescription = Object.assign(
    {
      top: "Bright orange opens the fragrance, warmed by cardamom, pepper and saffron, with an unexpected touch of leather.",
      mid: "Immortelle Absolute from the Balkans, heliotrope and orris meet the distinctive Ahmed Al Maghribi Rose Accord.",
      base: "Vanilla, patchouli, musk and incense settle into a deep, lingering base, enriched by the Ahmed Al Maghribi Oud Accord.",
    },
    data?.notesDescription || {}
  );

  const isArabic = Boolean(data?.isArabic);

  const cardsData = [
    {
      ...NOTE_TIERS[0],
      title: data?.notesTiers?.[0] || NOTE_TIERS[0].title,
      img: noteImgs.top,
      description: notesDescription.top,
    },
    {
      ...NOTE_TIERS[1],
      title: data?.notesTiers?.[1] || NOTE_TIERS[1].title,
      img: noteImgs.mid,
      description: notesDescription.mid,
    },
    {
      ...NOTE_TIERS[2],
      title: data?.notesTiers?.[2] || NOTE_TIERS[2].title,
      img: noteImgs.base,
      description: notesDescription.base,
    },
  ];

  const scrollToCard = (index) => {
    setActiveIndex(index);
    if (!trackRef.current) return;
    const cards = trackRef.current.children;
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleTrackScroll = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const cardWidth = el.scrollWidth / cardsData.length;
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    if (newIdx !== activeIndex && newIdx >= 0 && newIdx < cardsData.length) {
      setActiveIndex(newIdx);
    }
  };

  return (
    <section className="auric-notes-section">
      {/* Background ambient lighting */}
      <div className="auric-notes-ambient-glow" />

      <div className="auric-notes-container">
        {/* Section Header */}
        <div className="auric-notes-header">
          <motion.h2
            className="auric-notes-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              className="auric-gold-text"
              style={{
                fontFamily: isArabic ? "inherit" : "'Wonderful Melanesia', Georgia, serif",
                letterSpacing: isArabic ? "normal" : undefined,
                lineHeight: isArabic ? "1.3" : undefined,
                background:
                  "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "#d4af37",
                display: "inline-block",
                filter: "drop-shadow(0 2px 20px rgba(212, 175, 55, 0.35))",
              }}
            >
              {data?.notesHeading || "The Fragrance Notes"}
            </span>
          </motion.h2>

          <motion.p
            className="auric-notes-subtitle text-white"
            style={{
              color: "#ffffff",
              fontFamily: isArabic ? "inherit" : undefined,
              letterSpacing: isArabic ? "normal" : undefined,
              lineHeight: isArabic ? "1.85" : undefined,
            }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {data?.notesSubtitle ||
              "A refined journey from radiant spice and rose to warm oud, crafted with depth, character and enduring elegance."}
          </motion.p>
        </div>

        {/* Mobile Quick Selector Tabs (< 992px) */}
        <div className="auric-notes-mobile-tabs" role="tablist">
          {cardsData.map((item, idx) => (
            <button
              key={item.tier}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              className={`auric-notes-tab-btn ${activeIndex === idx ? "active" : ""}`}
              onClick={() => scrollToCard(idx)}
            >
              {item.tier} {item.title.replace(" Notes", "")}
            </button>
          ))}
        </div>

        {/* 3 Botanical Art Cards (Desktop Grid / Mobile Snap Carousel) */}
        <div
          ref={trackRef}
          className="auric-notes-grid"
          onScroll={handleTrackScroll}
        >
          {cardsData.map((item, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div className="auric-note-card-col" key={item.tier}>
                <motion.div
                  className="auric-note-card"
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.7, delay: index * 0.12 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    borderColor: isHovered
                      ? item.borderColor
                      : "rgba(255, 255, 255, 0.08)",
                    boxShadow: isHovered
                      ? `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px ${item.glowColor}`
                      : "0 14px 36px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {/* Botanical Card Image Frame (Square 1:1 matching 828x828 source) */}
                  <div className="auric-note-img-wrap">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 380px"
                      priority={index === 0}
                      style={{
                        objectFit: "contain",
                        transition: "transform 0.5s ease",
                        transform: isHovered ? "scale(1.04)" : "scale(1)",
                      }}
                    />
                  </div>

                  {/* Main Title */}
                  <h3
                    className="auric-note-card-title text-white"
                    style={{
                      color: "#ffffff",
                      fontFamily: isArabic ? "inherit" : undefined,
                      letterSpacing: isArabic ? "normal" : undefined,
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Description Paragraph */}
                  <p
                    className="auric-note-card-desc text-white"
                    style={{
                      color: "#ffffff",
                      fontFamily: isArabic ? "inherit" : undefined,
                      letterSpacing: isArabic ? "normal" : undefined,
                      lineHeight: isArabic ? "1.85" : undefined,
                    }}
                  >
                    {item.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination Indicators (< 992px) */}
        <div className="auric-notes-dots" aria-hidden="true">
          {cardsData.map((item, idx) => (
            <button
              key={item.tier}
              type="button"
              className={`auric-notes-dot ${activeIndex === idx ? "active" : ""}`}
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
