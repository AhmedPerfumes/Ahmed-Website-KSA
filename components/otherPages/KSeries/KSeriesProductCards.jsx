// components/otherPages/KSeries/KSeriesProductCards.jsx

"use client";
import React from "react";
import Image from "next/image";
import styles from "./KSeriesProductCards.module.css";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// Re-using the product data from KSeriesScrollSection
const slidesData = [
  {
    id: "past",
    image: "/assets/images/kseries/PAST_Bottle_Final.jpg",
    title: "The Roots",
    subtitle: "2000",
    description: "“The Roots” captures the essence of Mr. Kafeel Ahmed’s beginnings - A return to authenticity, where every drop is a story of craftsmanship born from nature.",
    themeClass: "theme-past",
  },
  {
    id: "present",
    image: "/assets/images/kseries/Present_2025.jpg",
    title: "The Alchemy Lab",
    subtitle:"2025",
    description: "“The Alchemy Lab” symbolizes Mr. Kafeel Ahmed’s creative evolution - Blending science, soul, and scent into a work of living art.",
    themeClass: "theme-present",
  },
  {
    id: "future",
    image: "/assets/images/kseries/FUTURE_mobile_1.jpg",
    title: "The Beyond",
    subtitle: "2050",
    description: "“The Beyond” is an olfactory glimpse into tomorrow, where scent becomes an emotion - The ultimate expression of imagination and connection.",
    themeClass: "theme-future",
  },
];

const ProductCard = ({ data, onClick }) => {
  const { image, title, subtitle, description, themeClass } = data;

  return (
    <div className={`${styles.card} ${styles[themeClass]}`} onClick={() => onClick(data)}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
          className={styles.productImage}
        />
        {/* Subtle inner shadow/vignette */}
        <div className={styles.vignette}></div>
      </div>
      <div className={styles.content}>
        <span className={styles.subtitle}>{subtitle}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <button className={styles.ctaButton} onClick={(e) => { e.stopPropagation(); onClick(data); }}>Discover More</button>
      </div>
    </div>
  );
};

export default function KSeriesProductCards() {
    const locale = useLocale();
    const router = useRouter();
    const handleCardClick = (productData) => {
    let routeSegment;
    switch (productData.id) {
        case 'past':
            routeSegment = '2000';
            break;
        case 'present':
            routeSegment = '2025';
            break;
        case 'future':
            routeSegment = '2050';
            break;
        default:
            console.error("Unknown product ID:", productData.id);
            return; // Exit if ID is unexpected
    }
    // Construct the path: /en/K-Series/[routeSegment]
    const path = `/${locale}/k-series/${routeSegment}`;

    // Redirect the user
    router.push(path);
  };
  return (
        <section id="k-series-product-cards" className={styles.productCardsSection}>
        <div className={styles.header}>
            <h2 className={styles.mainTitle}>
            Legacy Crafted <span className={styles.goldText}>Through Time.</span>
            </h2>
            <p className={styles.subText}>
            Explore the iconic scents that define the K-Series - The founders signature collection.
            </p>
        </div>

        <div className={styles.cardsContainer}>
            {slidesData.map((slide) => (
            <ProductCard key={slide.id} data={slide} onClick={handleCardClick}/>
            ))}
        </div>
        </section>
  );
}
