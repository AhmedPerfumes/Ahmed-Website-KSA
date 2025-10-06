"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import ThumbLarge from "./Common/thumb-large";
import Top from "./Common/top";
import Description from "./Common/description";
import Checkout from "./Common/checkout";

const InfoBase = ({ images, product, onThumbnailClick }) => {
  const locale = useLocale();
  const description = locale === 'ar' ? product?.description_ar : product?.description;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Runs only on client
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile(); // initial check
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  

  return (
    <div
      // className="container"
      style={{
        maxWidth: "500px",
        fontFamily: "SofiaProRegular",
        display: "flex",
        flexDirection: "column",
        // minHeight: isMobile ? "auto" : "70vh",
      }}
    >
      <div className="d-none d-lg-block">
        <Top product={product} />
      </div>
      <div className="h1"></div>
      <Description description={<span dangerouslySetInnerHTML={{ __html: description }} />} />
      <ThumbLarge images={images} onThumbnailClick={onThumbnailClick} />
      <Checkout product={product} />
    </div>
  );
};

export default InfoBase;
