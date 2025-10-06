import React, { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const Description = ({ description }) => {
  const t = useTranslations('ProductDetails');
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [height, setHeight] = useState("60px");
  const contentRef = useRef(null);
  const maxCollapsedHeight = 60; // in pixels; can be made a prop for flexibility

  useEffect(() => {
    if (contentRef.current) {
      const sh = contentRef.current.scrollHeight;
      setShowToggle(sh > maxCollapsedHeight);
      if (sh <= maxCollapsedHeight) {
        setExpanded(false); // Reset expanded if content is short
        setHeight(`${sh}px`);
      } else {
        setHeight(expanded ? `${sh}px` : `${maxCollapsedHeight}px`);
      }
    }
  }, [expanded, description]);

  return (
    <div
      style={{
        overflow: "hidden",
        transition: "max-height 0.5s ease-in-out",
        // fontFamily: `'Merriweather', serif`,
      }}
    >
      
      <div
        ref={contentRef}
        style={{
          maxHeight: height,
          transition: "max-height 0.5s ease-in-out",
          overflow: "hidden",
          fontSize: "0.875rem", // text-sm
          color: "#6E6E73",
          letterSpacing: "0.025em",
          lineHeight: "1.5"
        }}
      >
        {description || ''}
      </div>

      {showToggle && (
        <div className="d-flex justify-content-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-link p-0 mt-1"
            style={{
              fontSize: "0.875rem",
              fontWeight: "bold",
              color: "#6E6E73",
              textDecoration: "none",
            }}
            onMouseOver={(e) => (e.target.style.color = "#1C1C1E")}
            onMouseOut={(e) => (e.target.style.color = "#6E6E73")}
            aria-expanded={expanded}
          >
            {expanded ? t('showLess') : t('readMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Description;