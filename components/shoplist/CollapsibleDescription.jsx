// CollapsibleDescription.js

"use client";
import React, { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function CollapsibleDescription({ description }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [maxHeight, setMaxHeight] = useState("auto");
    const contentRef = useRef(null);
    const t = useTranslations();

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const parentStyle = window.getComputedStyle(element);
            const lineHeight = parseFloat(parentStyle.lineHeight);

            let doesOverflow = false;
            if (element.children.length > 0) {
                const firstChild = element.children[0];
                const childStyle = window.getComputedStyle(firstChild);
                const childMargin =
                    parseFloat(childStyle.marginTop) +
                    parseFloat(childStyle.marginBottom);
                doesOverflow = element.scrollHeight > lineHeight + childMargin + 2;
            } else {
                doesOverflow = element.scrollHeight > lineHeight + 2;
            }

            setIsOverflowing(doesOverflow);

            if (doesOverflow) {
                setMaxHeight(expanded ? `${element.scrollHeight}px` : `${lineHeight}px`);
            } else {
                setMaxHeight("none");
            }
        }
    }, [description, expanded]);

    // If there's no description, don't render anything
    if (!description) {
        return null;
    }

    return (
        <div
            style={{
                fontFamily: "Merriweather, serif",
                maxWidth: "930px",
                margin: "0 auto",
            }}
        >
            <div
                dangerouslySetInnerHTML={{ __html: description }}
                ref={contentRef}
                style={{
                    maxHeight: maxHeight,
                    overflow: "hidden",
                    transition: "max-height 0.5s ease-in-out",
                    fontSize: "0.875rem",
                    color: "#6E6E73",
                    letterSpacing: "0.02em",
                    fontWeight: "500",
                    textAlign: "center",
                }}
            ></div>
            {isOverflowing && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <a
                        onClick={() => setExpanded(!expanded)}
                        style={{ cursor: "pointer" }}
                        className="btn-rounded btn-link_lg text-uppercase fw-medium hover-effect mt-3"
                    >
                        {expanded ? t("Show less") : t("Find Out More")}
                    </a>
                </div>
            )}
        </div>
    );
}