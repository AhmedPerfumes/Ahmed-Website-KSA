"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

/**
 * FragranceBreakdown — Section 6
 *
 * Clean 3-column note pyramid: Top / Heart / Base
 * No clutter — image, tier label, name, optional long description on tap.
 * Falls back gracefully if only top_note is present (Notes & Accords mode).
 *
 * API fields:
 *   top_note, top_note_ar, top_note_description, top_note_description_ar, top_note_image
 *   heart_note, heart_note_ar, heart_note_description, heart_note_description_ar, heart_note_image
 *   base_note, base_note_ar, base_note_description, base_note_description_ar, base_note_image
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const NOTE_TIER_LABELS = {
  top: { en: "Top Notes", ar: "النوتات العلوية" },
  heart: { en: "Heart Notes", ar: "النوتات الوسطى" },
  base: { en: "Base Notes", ar: "النوتات القاعدية" },
  accords: { en: "Notes & Accords", ar: "النوتات والأكورد" },
};

const NoteCard = ({ note, onClick, isExpanded }) => (
  <div className="pdp-note-card" itemScope itemType="https://schema.org/Thing">
    <span className="pdp-note-card__tier">{note.tierLabel}</span>

    <div className="pdp-note-card__img-wrap">
      {note.image ? (
        <Image
          src={`${API_URL}storage/${note.image}`}
          alt={note.name}
          width={80}
          height={80}
          loading="lazy"
          onError={(e) => { e.target.style.display = "none"; }}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      ) : (
        <span style={{ fontSize: "2rem", color: "#C9A96E" }}>✦</span>
      )}
    </div>

    <h3 className="pdp-note-card__name" itemProp="name">{note.name}</h3>

    {note.description && (
      <p className="pdp-note-card__desc" itemProp="description">
        {note.description}
      </p>
    )}

    {/* Expandable long description */}
    {note.longDescription && (
      <button
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.72rem",
          color: "#9E7A42",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: "0.5rem",
          padding: 0,
        }}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Show less ↑" : "Learn more ↓"}
      </button>
    )}

    {isExpanded && note.longDescription && (
      <p
        className="pdp-note-card__desc"
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem",
          background: "#F2EDE6",
          borderRadius: "8px",
          textAlign: "left",
        }}
      >
        {note.longDescription}
      </p>
    )}
  </div>
);

const FragranceBreakdown = ({ product }) => {
  const locale = useLocale();
  const t = useTranslations("ProductDetails");

  const [expandedNote, setExpandedNote] = useState(null);

  const isAr = locale === "ar";
  const onlyTop = !product?.heart_note && !product?.base_note;

  // Build notes array dynamically
  const notes = [];
  const noteTypes = ["top", "heart", "base"];

  noteTypes.forEach((type) => {
    const nameKey = isAr ? `${type}_note_ar` : `${type}_note`;
    const descKey = isAr ? `${type}_note_description_ar` : `${type}_note_description`;
    const imgKey = `${type}_note_image`;

    if (product?.[nameKey]) {
      let tierLabel;
      if (type === "top") {
        tierLabel = onlyTop
          ? (isAr ? NOTE_TIER_LABELS.accords.ar : NOTE_TIER_LABELS.accords.en)
          : (isAr ? NOTE_TIER_LABELS.top.ar : NOTE_TIER_LABELS.top.en);
      } else {
        tierLabel = isAr ? NOTE_TIER_LABELS[type].ar : NOTE_TIER_LABELS[type].en;
      }

      notes.push({
        id: type,
        tierLabel,
        name: product[nameKey],
        description: product[descKey] || null,
        longDescription: product[`${type}_note_description`] !== product[descKey]
          ? product[`${type}_note_description`]
          : null,
        image: product[imgKey] || null,
      });
    }
  });

  if (notes.length === 0) return null;

  return (
    <section className="pdp-fragrance pdp-fade-in" aria-labelledby="fragrance-heading">
      <div className="pdp-container">
        <header className="pdp-section-header">
          <span className="pdp-section-eyebrow">Scent Journey</span>
          <h2 className="pdp-section-title" id="fragrance-heading">
            {t("accordion.fragranceProfile")}
          </h2>
        </header>

        <div
          className="pdp-fragrance__notes"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          {notes.map((note, idx) => (
            <div key={note.id} itemProp="itemListElement">
              <NoteCard
                note={note}
                isExpanded={expandedNote === note.id}
                onClick={() =>
                  setExpandedNote(expandedNote === note.id ? null : note.id)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FragranceBreakdown;
