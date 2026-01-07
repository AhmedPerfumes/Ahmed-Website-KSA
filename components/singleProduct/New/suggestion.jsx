import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";


const relatedProducts = [
  {
    name: "Ahl",
    image: "/assets/images/musk-roses-test/ahl.jpg",
    price: "AED 190.00",
  },
  {
    name: "Marj",
    image: "/assets/images/musk-roses-test/Marj-POM.jpg",
    price: "AED 165.00",
  },
  {
    name: "Kaaf",
    image: "/assets/images/musk-roses-test/kaaf.png",
    price: "AED 210.00",
  },
  {
    name: "Shaikha Hind",
    image: "/assets/images/musk-roses-test/al shaikha hind.jpg",
    price: "AED 175.00",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Suggestion = () => {
  return (
    <motion.div
      className="container pb-4"
      style={{
        fontFamily: "SofiaProRegular",
        color: "#1C1C1E",
        maxWidth: "1140px",
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <motion.div className="row g-3 g-sm-4" variants={containerVariants}>
        {relatedProducts.map((product, idx) => (
          <motion.div
            key={idx}
            className="col-6 col-sm-4 col-md-3"
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
          >
            <div
              className="shadow-sm bg-white"
              style={{
                backdropFilter: "blur(8px)",
                transition: "box-shadow 0.2s ease",
                cursor: "pointer",
                
                border: "1px solid rgba(0, 0, 0, 0.125)",
                borderRadius: "0.5rem",
                boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)",
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)")
              }
            >
              <Image
                src={product.image}
                alt={product.name}
                className="w-100"
                style={{
                  height: "280px", // mobile default
                  objectFit: "cover",
                  borderTopLeftRadius: "0.5rem",
                  borderTopRightRadius: "0.5rem"
                }}
              />
              <div className="p-3 d-flex flex-column gap-2">
                <h3
                  style={{
                    // fontFamily: "'Cinzel', serif",
                    fontWeight: "600",
                    fontSize: "1.125rem", // ~text-lg
                    margin: 0,
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    // fontFamily: "'Merriweather', serif",
                    fontSize: "0.875rem", // text-sm
                    margin: 0,
                    color: "#555",
                  }}
                >
                  {product.price}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-dark rounded-pill fw-semibold"
                  style={{
                    // fontFamily: "'Cinzel', serif",
                    fontSize: "0.875rem",
                    width: "100%",
                    padding: "0.5rem 0",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#181818")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#000")}
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Suggestion;
