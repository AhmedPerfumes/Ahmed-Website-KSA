// components/otherPages/KSeries/FoundersStoryTransition.jsx

"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./FounderSection.module.css";

const BACKGROUND_IMAGE = "/assets/images/kseries/background_1.jpg";
const FOUNDER_IMAGE = "/assets/images/kseries/founder-2.jpg";

export default function FoundersStoryTransition() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 2, 0]);
  const blurFilter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className={`position-relative overflow-hidden ${styles.founderSection}`}
    >
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ y: backgroundY, filter: blurFilter }}
      >
        <Image
          src={BACKGROUND_IMAGE}
          alt="Founder's personal collection"
          fill
          sizes="100vw"
          priority={true}
          style={{ objectFit: "cover", objectPosition: "center center" }}
          className={styles.heroImage}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        />
      </div>

      {/* Content Block */}
      <Container
        className={`d-flex flex-column align-items-center justify-content-center ${styles.founderSectionContainer}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className={`text-light text-center ${styles.founderCard}`}
        >
          {/* Heading */}
          <div className="text-center mb-4 mb-md-5 pb-2 pb-md-4">
            <h2 className={styles.founderTitle}>
              The Founder's Legacy
            </h2>
          </div>

          <Row className="g-4 g-md-5 align-items-center">
            {/* Left: Image & short title */}
            <Col
              xs={12}
              md={4}
              lg={3}
              className="text-center"
              style={{ marginTop: "5px" }}
            >
              <div className={styles.founderImageWrapper}>
                <div className={styles.founderImageFrame}>
                  <Image
                    src={FOUNDER_IMAGE}
                    alt="Mr. Kafeel Ahmed, Founder and Master Perfumer"
                    fill
                    sizes="(max-width: 768px) 60vw, 300px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <h3 className={styles.founderName}>
                Mr. Kafeel Ahmed
              </h3>
              <p className={styles.founderBio}>
                Founder, Visionary, and Master Perfumer
              </p>
            </Col>

            {/* Right: Text */}
            <Col xs={12} md={8} lg={9} className={styles.founderTextCol}>
              <p className={styles.founderText}>
                <strong>Marking 25 years</strong> of Ahmed Al Maghribi Perfumes,
                the K-Series stands as the personal signature of Mr. Kafeel
                Ahmed.
                <br />
                <br />
                This distinguished trilogy — The Roots (<strong>2000</strong>),
                The Alchemy Lab (<strong>2025</strong>), and The Beyond (
                <strong>2050</strong>) — meticulously composed from the world’s
                finest ingredients, immortalizes his lifelong dedication to
                perfumery: a bridge between heritage, mastery, innovation, and
                the ultimate vision of scent's future.
                <br />
                <br />
                From The Roots to The Beyond, the K-Series encapsulates the
                journey of Mr. Kafeel Ahmed across time — Past, Present, and
                Future. Each fragrance is not just a scent, but a story of
                evolution, dedication, and passion — a true embodiment of The
                Founder’s Legacy.
              </p>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </section>
  );
}
