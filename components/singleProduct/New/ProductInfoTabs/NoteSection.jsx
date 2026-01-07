import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const NoteSection = ({ number, title, text, image, position }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.4 });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const imageParallax = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    const sectionVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const contentVariants = {
        hidden: { opacity: 0, x: position === 'left' ? -50 : 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            ref={ref}
            className={`note-section note-section--${position}`}
            data-number={number}
            variants={sectionVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            <div className="note-content">
                <div className="note-content__image-wrapper">
                    <motion.img
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`}
                        alt={title}
                        className="note-content__image"
                        variants={contentVariants}
                        style={{ y: imageParallax }}
                    />
                </div>
                <motion.h3 className="note-content__title" variants={contentVariants}>
                    {title}
                </motion.h3>
                <motion.p className="note-content__text" variants={contentVariants}>
                    {text}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default NoteSection;