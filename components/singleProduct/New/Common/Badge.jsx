import Image from "next/image";
import React from "react";

// Configuration for different badge types
const badgeConfig = {
    bestseller: {
        src: "/assets/images/badge/bestseller.png",
        alt: "Bestseller Badge",
    },
    newlaunch: {
        src: "/assets/images/badge/newlaunch.png",
        alt: "New Launch Badge",
    },
    onlineexclusive: {
        src: "/assets/images/badge/online-exclusive-1.png",
        alt: "Online Exclusive Badge",
    },
    buyonegetone: {
        src: "/assets/images/badge/buy-one-get-one.png",
        alt: "Buy One Get One Badge",
    },
};

const Badge = ({ type, index }) => {
    const config = badgeConfig[type];

    if (!config) {
        return null; // Don't render anything if the type is unknown
    }

    // Use inline styles to position each badge based on its index
    const badgeStyle = {
        // top: `${1.75 + (index * 4)}rem`, // Example of vertical stacking
        "--badge-index": index, // Using a CSS variable for more flexibility
    };

    return (
        <div className={`product-badge`} style={badgeStyle}>
            <Image height={500} width={500} className="img" src={config.src} alt={config.alt} />
        </div>
    );
};

export default Badge;
