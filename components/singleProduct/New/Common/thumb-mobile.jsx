import Image from "next/image";
import React from "react";

const ThumbMobile = ({ images, onThumbnailClick }) => {
  return (
    <div
      className="d-lg-none d-flex flex-wrap justify-content-center gap-2 p-2"
      style={{ backgroundColor: "#FAF9F7" }}
    >
      {images.map((img, i) => (
        <Image
          height={500}
          width={500}
          key={i}
          src={`${process.env.NEXT_PUBLIC_API_URL}storage/${img}`}
          alt={`thumb-${i}`}
          className="border"
          style={{
            width: "64px",
            height: "64px",
            cursor: "pointer",
            mixBlendMode: "multiply",
          }}
          onClick={() => onThumbnailClick(i)}
        />
      ))}
    </div>
  );
};

export default ThumbMobile;
