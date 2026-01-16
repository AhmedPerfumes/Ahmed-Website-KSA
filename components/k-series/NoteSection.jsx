import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

function NoteSection({ data = {} }) {
  // allow overriding specific note images via data.notesImages
  const defaultNoteImgs = {
    top: "/assets/images/kseries/top.jpg",
    mid: "/assets/images/kseries/mid.jpg",
    base: "/assets/images/kseries/base.jpg",
  };

  const noteImgs = Object.assign({}, defaultNoteImgs, data?.notesImages || {});
  const notesDescription = data?.notesDescription || {};

  const notes = [
    {
      title: "Top Notes",
      description:
        notesDescription.top,
      img: noteImgs.top,
    },
    {
      title: "Heart Notes",
      description:
        notesDescription.mid,
      img: noteImgs.mid,
    },
    {
      title: "Base Notes",
      description:
        notesDescription.base,
      img: noteImgs.base,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: i * 0.18,
      },
    }),
  };

  return (
    <section
      className="py-5"
      style={{
        background:
          "radial-gradient(circle at top, rgba(229,212,178,0.16) 0%, transparent 55%) #000000",
        color: "#f2f2f2",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background element */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(229,212,178,0.08), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: "1180px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            border: `1px solid ${data?.accentColor || 'rgba(229,212,178,0.35)'}`,
            background: "rgba(10,10,10,0.9)",
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: data?.accentColor || "#e5d4b2",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#e5d4b2",
            }}
          />
          K-Series • Olfactory Journey
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="fw-bold mt-3"
          style={{
            fontSize: "2.2rem",
            letterSpacing: "-0.5px",
            color: data?.textColor || "#ffffff",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          Fragrance Notes
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-3"
          style={{
            fontSize: "0.95rem",
            color: data?.mutedTextColor || "#c6c6c6",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          A structured evolution from first impression to final memory — crafted for
          those who appreciate depth, detail, and enduring elegance.
        </motion.p>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            margin: "18px auto 0",
            width: "60px",
            height: "2px",
            background: "linear-gradient(to right, transparent, #e5d4b2, transparent)",
            transformOrigin: "center",
          }}
        />

        {/* Cards */}
        <div className="row gy-4 gy-md-5 mt-5">
          {notes.map((note, index) => (
            <div className="col-12 col-md-4" key={note.title}>
              <Card note={note} index={index} cardVariants={cardVariants} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ note, index, cardVariants }) {
  return (
    <motion.div
      className="h-100"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        y: -4,
        rotateX: 1,
        rotateY: -1,
        transition: { duration: 0.25 },
      }}
      style={{
        padding: "18px",
        borderRadius: "20px",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(229,212,178,0.02))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(4px)",
        minHeight: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Subtle corner glow */}
      <div
        style={{
          position: "absolute",
          top: "-15px",
          right: "-15px",
          width: "60px",
          height: "60px",
          background: "radial-gradient(circle, rgba(229,212,178,0.16), transparent)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      {/* Image */}
      <motion.div
        style={{
          marginBottom: "18px",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(229,212,178,0.1)",
          flexShrink: 0,
        }}
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
      >
        <Image
          src={note.img}
          alt={note.title}
          width={400}
          height={220}
          className="img-fluid"
          style={{ display: "block", width: "100%", height: "220px", objectFit: "cover" }}
        />
        {/* Top overlay strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "24px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
          }}
        />
      </motion.div>

      {/* Label above title */}
      {/* <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(229,212,178,0.78)",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "999px",
            backgroundColor: "#e5d4b2",
          }}
        />
        {index + 1 < 10 ? `0${index + 1}` : index + 1} • Layer
      </span> */}

      {/* Title */}
      <h4
        className="fw-bold"
        style={{
          fontSize: "1.2rem",
          color: "#e5d4b2",
          letterSpacing: "0.3px",
          marginBottom: "6px",
        }}
      >
        {note.title}
      </h4>

      {/* Short accent line */}
      <div
        style={{
          width: "28px",
          height: "1.2px",
          backgroundColor: "rgba(229,212,178,0.6)",
          marginBottom: "10px",
        }}
      />

      {/* Description */}
      <p
        style={{
          color: "#fff",
          lineHeight: 1.6,
          fontSize: "0.9rem",
          marginBottom: 0,
          flexGrow: 1,
        }}
      >
        {note.description}
      </p>
    </motion.div>
  );
}

export default NoteSection;
