"use client";

import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

/**
 * FragranceBreakdown — Section 5 (Scent Journey / Fragrance Notes)
 *
 * AE site-inspired design:
 * - Dark background
 * - Gold spaced eyebrow "FRAGRANCE NOTES"
 * - 3-col timeline with horizontal connecting line + labeled circle dots
 * - Full-bleed images below timeline
 * - Card body with title + description text below image
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const NOTE_CONFIG = {
  top:     { en: "Opening",  ar: "الافتتاحية",  subtitle_en: "The First Impression", subtitle_ar: "الانطباع الأول" },
  heart:   { en: "Heart",    ar: "قلب العطر",   subtitle_en: "The Core Character",   subtitle_ar: "جوهر الرائحة"   },
  base:    { en: "Legacy",   ar: "قاعدة العطر", subtitle_en: "The Lasting Memory",   subtitle_ar: "الذكرى الباقية" },
  accords: { en: "Notes",    ar: "النوتات",     subtitle_en: "Notes & Accords",      subtitle_ar: "النوتات والأكورد" },
};

const FragranceBreakdown = ({ product }) => {
  const locale  = useLocale();
  const t       = useTranslations("ProductDetails");
  const isAr    = locale === "ar";
  const onlyTop = !product?.heart_note && !product?.base_note;

  /* ── Build notes array ── */
  const notes = [];
  ["top", "heart", "base"].forEach((type) => {
    const name = (isAr
      ? (product?.[`${type}_note_ar`]?.trim() || product?.[`${type}_note`]?.trim())
      : (product?.[`${type}_note`]?.trim() || product?.[`${type}_note_ar`]?.trim())) || "";
    const desc = (isAr
      ? (product?.[`${type}_note_description_ar`]?.trim() || product?.[`${type}_note_description`]?.trim())
      : (product?.[`${type}_note_description`]?.trim() || product?.[`${type}_note_description_ar`]?.trim())) || "";
    const imgKey  = `${type}_note_image`;
    const image = product?.[imgKey] || null;

    if (!name && !desc && !image) return;

    const cfg  = type === "top" && onlyTop ? NOTE_CONFIG.accords : NOTE_CONFIG[type];
    const tier = isAr ? cfg.ar  : cfg.en;
    const sub  = isAr ? cfg.subtitle_ar : cfg.subtitle_en;

    notes.push({
      id:       type,
      tier,
      subtitle: sub,
      name,
      desc:     desc || null,
      image,
    });
  });

  if (notes.length === 0) return null;

  return (
    <section className="pdp-fragrance-ae" aria-labelledby="fragrance-ae-heading">
      <div className="pdp-container">

        {/* ── Header ── */}
        <header className="pdp-fragrance-ae__header">
          <span className="pdp-fragrance-ae__eyebrow" id="fragrance-ae-heading">
            {isAr ? "مكونات العطر" : "Fragrance Notes"}
          </span>
          <p className="pdp-fragrance-ae__subtext">
            {isAr
              ? "تكشف مكونات العطر عن جوهر العطر، وتقسم رحلة رائحته من الانطباع الأول إلى الرائحة العالقة، مما يساعدك على فهم شخصيته وطابعه الفريد."
              : "Fragrance Notes reveal the essence of a perfume, breaking down its scent journey from the first impression to the lingering aroma, helping you understand its personality and character."}
          </p>
        </header>

        {/* ── Timeline ── */}
        <div className="pdp-fragrance-ae__timeline" aria-hidden="true">
          <div className="pdp-fragrance-ae__line" />
          {notes.map((note) => (
            <div key={note.id} className="pdp-fragrance-ae__dot-col">
              <span className="pdp-fragrance-ae__tier-label">{note.tier}</span>
              <div className="pdp-fragrance-ae__dot" />
              <div className="pdp-fragrance-ae__dot-stem" />
            </div>
          ))}
        </div>

        {/* ── Cards ── */}
        <div className="pdp-fragrance-ae__cards" itemScope itemType="https://schema.org/ItemList">
          {notes.map((note) => (
            <div key={note.id} className="pdp-fragrance-ae__card" itemProp="itemListElement">

              {/* Image */}
              <div className="pdp-fragrance-ae__img-wrap">
                {note.image ? (
                  <Image
                    src={`${API_URL}storage/${note.image}`}
                    alt={note.name || note.subtitle}
                    width={500}
                    height={320}
                    loading="lazy"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="pdp-fragrance-ae__placeholder">✦</div>
                )}
              </div>

              {/* Card body */}
              <div className="pdp-fragrance-ae__card-body">
                <h3 className="pdp-fragrance-ae__card-title" itemProp="name">{note.subtitle}</h3>
                {note.name && (
                  <p className="pdp-fragrance-ae__card-name" style={{ margin: 0, fontWeight: 500, color: "var(--pdp-ink, #1A1A1A)", fontSize: "0.95rem" }}>
                    {note.name}
                  </p>
                )}
                {note.desc && (
                  <span className="pdp-fragrance-ae__card-desc" itemProp="description">
                    {note.desc}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FragranceBreakdown;
