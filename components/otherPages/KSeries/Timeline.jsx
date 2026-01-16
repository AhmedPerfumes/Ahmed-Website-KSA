"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "bootstrap/dist/css/bootstrap.min.css";

gsap.registerPlugin(ScrollTrigger);

const perfumes = [
  {
    id: 1,
    year: '2000',
    title: 'K 2000 — The Roots',
    description: 'A tribute to the origins of Arabian perfumery. Opens with natural citrus and white florals — lily and Indian rose. The base reveals soft musks, creamy vanilla, and warm woods, capturing the essence of authentic craftsmanship born from nature.',
    details: 'A tribute to the origins of Arabian perfumery, 2000 celebrates the timeless artistry that defines the brand\'s foundation. It opens with a radiant burst of natural citrus, bright and effervescent, leading into a heart of white florals — lily and Indian rose — evoking purity and grace. As it settles, soft musks, creamy vanilla, and warm woods reveal a scent both nostalgic and eternal.',
    image: '/assets/images/best-sellers/oud-lavender@2x.jpg',
    isReverse: false
  },
  {
    id: 2,
    year: '2025',
    title: 'K 2025 — The Alchemy Lab',
    description: 'The spirit of creation and innovation in modern perfumery. A harmonious blend of citrus symphony, jasmine sambac, and neroli, settling into smooth cedarwood and clean musk.',
    details: '2025 embodies the spirit of creation, transformation, and innovation — a reflection of today\'s mastery in modern perfumery. It opens with an exhilarating citrus symphony of bergamot, grapefruit, and orange, harmonized with jasmine sambac, neroli, and cardamom at the heart. The base unfolds into smooth cedarwood, clean musk, and glowing ambergris, representing balance and refinement.',
    image: '/assets/images/best-sellers/kaaf@2x.jpg',
    isReverse: true
  },
  {
    id: 3,
    year: '2050',
    title: 'K 2050 — The Beyond',
    description: 'A vision of perfumery\'s future — intelligent, emotive, and weightlessly elegant. Features luminous citrus, peach, and delicate florals, with a base of silky vanilla and soft musk.',
    details: '2050 is a vision of perfumery\'s future — intelligent, emotive, and weightlessly elegant. It begins with a luminous fusion of citrus and peach, transcending into delicate freesia, orange blossom, and jasmine sambac. The dry-down reveals silky vanilla, soft musk, and tender rose, creating a scent that feels alive — adaptive to its wearer.',
    image: '/assets/images/best-sellers/zumar@2x.jpg',
    isReverse: false
  }
];

const Timeline = () => {
  useEffect(() => {
    // Animate each timeline item (image + text)
    perfumes.forEach((perfume, i) => {
      const item = `.timeline-item-${i}`;

      // Animate image
      gsap.fromTo(
        `${item} .timeline-image`,
        { opacity: 0, x: perfume.isReverse ? 50 : -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            end: "top 60%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animate text
      gsap.fromTo(
        `${item} .timeline-text`,
        { opacity: 0, x: perfume.isReverse ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            end: "top 60%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  return (
    <section className="timeline-section position-relative bg-dark text-light py-5">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5">K Series Timeline</h2>

        {/* Timeline Items */}
        <div className="timeline-wrapper position-relative">
          {perfumes.map((perfume, index) => (
            <div
              key={perfume.id}
              className={`row align-items-center mb-5 flex-column flex-md-row timeline-item-${index} ${perfume.isReverse ? 'flex-md-row-reverse' : ''}`}
            >
              <div className="col-md-6 text-center mb-4 mb-md-0 timeline-image">
                <Image
                  src={perfume.image}
                  alt={perfume.title}
                  width={600}
                  height={400}
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: '400px', objectFit: 'cover', filter: 'brightness(0.9)', width: '100%', height: 'auto' }}
                />
              </div>
              <div className="col-md-6 text-center text-md-start timeline-text">
                <h3 className="fw-bold text-uppercase text-warning">{perfume.year}</h3>
                <h4 className="fw-bold mb-3">{perfume.title}</h4>
                <p className="text-muted mb-2">{perfume.description}</p>
                <p className="text-light">{perfume.details}</p>
                <motion.button
                  className="btn btn-outline-light mt-3 px-4 py-2 rounded-pill"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pre-Register
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .timeline-section {
          background: linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .timeline-text h3, .timeline-text h4, .timeline-text p {
          text-shadow: 0 0 8px rgba(0,0,0,0.7);
        }
      `}</style>
    </section>
  );
};

export default Timeline;
