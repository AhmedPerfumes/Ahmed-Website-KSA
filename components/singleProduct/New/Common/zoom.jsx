import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

const Zoom = ({ src, zoom = 2, lensSize = 150 }) => {
  const containerRef = useRef(null);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  // State for different interaction modes
  const [isHovering, setIsHovering] = useState(false); // For desktop hover
  const [isTapped, setIsTapped] = useState(false); // For mobile tap-to-activate
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect if the view is mobile-sized
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Common breakpoint for mobile
    };
    checkIsMobile(); // Initial check
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Combined visibility state
  const visible = isMobile ? isTapped : isHovering;

  const updateLens = (x, y) => {
    const rect = containerRef.current.getBoundingClientRect();
    setLensPosition({
      // Clamp the position to be within the container bounds
      x: Math.max(0, Math.min(x, rect.width)),
      y: Math.max(0, Math.min(y, rect.height)),
    });
  };

  // --- Event Handlers ---

  // For Desktop
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateLens(e.clientX - rect.left, e.clientY - rect.top);
    if (!isHovering) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovering(false);
  };

  // For Mobile (replaces all touch handlers with a simpler tap & move)
  const handleTouchMove = (e) => {
    if (!isMobile || !isTapped) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    updateLens(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  // Unified handler for mobile tap to toggle zoom
  const handleClick = () => {
    if (!isMobile) return;
    setIsTapped((prev) => !prev);
  };


  return (
    <div
      ref={containerRef}
      className="position-relative w-100"
      style={{
        overflow: "hidden",
        // CRITICAL CHANGE: Only disable touch actions when zoom is active on mobile
        touchAction: isMobile && isTapped ? "none" : "auto",
        backgroundColor: "#FAF9F7",
        cursor: isMobile ? 'pointer' : 'crosshair'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onClick={handleClick} // Use onClick for simple toggling on mobile
    >
      <Image
        height={1000}
        width={1000}
        src={src}
        alt="Product"
        className="w-100"
        style={{
          height: "auto",
          objectFit: "cover",
          mixBlendMode: "multiply",
          transition: "filter 0.3s ease",
          // The base image is blurred only when the lens is visible
          filter: visible ? "blur(2px)" : "none",
        }}
        loading="lazy"
      />

      <div
        className="position-absolute"
        style={{
          // The lens is always non-interactive
          pointerEvents: "none",
          width: `${lensSize}px`,
          height: `${lensSize}px`,
          left: `${lensPosition.x - lensSize / 2}px`,
          top: `${lensPosition.y - lensSize / 2}px`,
          borderRadius: "50%",
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${
            containerRef.current?.offsetWidth * zoom || 0
          }px`,
          backgroundPosition: `-${lensPosition.x * zoom - lensSize / 2}px -${
            lensPosition.y * zoom - lensSize / 2
          }px`,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          boxShadow:
            "0 0 15px 5px rgba(150, 150, 150, 0.4), 0 0 25px 10px rgba(100, 100, 100, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
          transform: visible ? "scale(1)" : "scale(0.25) translateY(-8px)",
          opacity: visible ? 1 : 0,
          zIndex: 50,
        }}
      />
    </div>
  );
};

export default Zoom;