import React from "react";
import { motion } from "framer-motion";
import "./ProductDescription.css";
import Image from "next/image";
// 1. Import the translation hooks
import { useLocale, useTranslations } from "next-intl";

const ProductDescription = ({ product }) => {
    // 2. Initialize the hooks
    const t = useTranslations('ProductDetails');
    const locale = useLocale();

    if (!product) return null;

    // 3. The 'notes' array is now built using translated data
    let notes = [
        {
            label: t('notes.openingLabel'),
            scriptTitle: t('notes.openingScriptTitle'),
            // Selects the correct description based on locale
            text: locale === 'ar' ? product.top_note_description_ar : product.top_note_description,
            image: product.top_note_image,
        },
        {
            label: t('notes.heartLabel'),
            scriptTitle: t('notes.heartScriptTitle'),
            text: locale === 'ar' ? product.heart_note_description_ar : product.heart_note_description,
            image: product.heart_note_image,
        },
        {
            label: t('notes.legacyLabel'),
            scriptTitle: t('notes.legacyScriptTitle'),
            text: locale === 'ar' ? product.base_note_description_ar : product.base_note_description,
            image: product.base_note_image,
        },
    ].filter((note) => note.text);

    if (notes.length === 0) return null;

    if (notes.length === 1) {
        notes[0] = {
            ...notes[0],
            // Also translate the special "SIGNATURE" case
            label: t('notes.signatureLabel'),
            scriptTitle: t('notes.signatureScriptTitle'),
        };
    }

    // Animation variants remain the same
    const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
    const container = { hidden: {}, show: { transition: { staggerChildren: 0.25 } } };
    const card = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
    const dot = { hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } } };

    return (
        <div className="pd-container">
            {/* Main Title Section */}
            <motion.div
                className="pd-header"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
            >
                {/* 4. Translate the main title and subtitle */}
                <h1 className="pd-main-title">{t('notes.mainTitle')}</h1>
                <p className="pd-subtitle">{t('notes.subtitle')}</p>
            </motion.div>

            {/* Timeline Header with connecting lines */}
            <motion.div
                className="pd-timeline"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
            >
                {notes.length > 1 && <div className="pd-timeline-line"></div>}
                {notes.map((note, index) => (
                    <motion.div className="pd-timeline-point" key={index} variants={dot}>
                        <div className="pd-timeline-marker">
                            <span className="pd-timeline-label">{note.label}</span>
                            <div className="pd-dot"></div>
                            <div className="pd-connector"></div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Fragrance Notes Grid */}
            <motion.div
                className="pd-notes-grid"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
            >
                {notes.map((note, index) => (
                    <motion.div key={index} className="pd-note-card" variants={card}>
                        <div className="pd-image-container">
                            <Image
                                width={500}
                                height={500}
                                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${note.image}`}
                                alt={note.scriptTitle}
                                className="pd-image"
                            />
                        </div>
                        <h3 className="pd-card-script-title">{note.scriptTitle}</h3>
                        <div className="pd-card-content">
                            <div
                                className="pd-card-text"
                                dangerouslySetInnerHTML={{ __html: note.text }}
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ProductDescription;