// CollapsibleDescription.js
"use client";
import React, { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const COLLAPSED_LINES = 1; // number of visible lines when closed

export default function CollapsibleDescription({ description }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [fullHeight, setFullHeight] = useState(0);
    const [lineHeight, setLineHeight] = useState(22);
    const contentRef = useRef(null);
    const t = useTranslations();

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const lh = parseFloat(window.getComputedStyle(el).lineHeight) || 22;
        setLineHeight(lh);
        setFullHeight(el.scrollHeight);
        setIsOverflowing(el.scrollHeight > lh * COLLAPSED_LINES + 4);
    }, [description]);

    if (!description) return null;

    const collapsedHeight = lineHeight * COLLAPSED_LINES;
    const currentHeight = expanded ? fullHeight : collapsedHeight;

    return (
        <div style={{ position: "relative", maxWidth: 860, margin: "0 auto" }}>
            <hr style={{ border: "none", borderTop: "1px solid #e8e8e8", margin: "0 0 0.6rem" }} />
            {/* Text body */}
            <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: description }}
                style={{
                    height: isOverflowing ? currentHeight : "auto",
                    overflow: "hidden",
                    transition: "height 0.35s ease",
                    fontSize: "0.8rem",
                    lineHeight: "1.6",
                    color: "#888",
                    letterSpacing: "0.01em",
                    // strip big margins injected by CMS HTML
                    // (p tags inside will stack; we let them)
                }}
            />

            {/* Fade mask — only when collapsed and overflowing */}
            {isOverflowing && !expanded && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "1.4rem",
                        background: "linear-gradient(to bottom, transparent, var(--bs-body-bg, #fff))",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Toggle link */}
            {isOverflowing && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        marginTop: "0.25rem",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#a07840",
                        lineHeight: 1,
                    }}
                    aria-expanded={expanded}
                >
                    {expanded ? t("Show less") : t("Read more")}
                    <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        style={{
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.25s ease",
                        }}
                    >
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}