"use client";
import { products17, products17mob } from "@/data/products/fashion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import Image from "next/image";
import { useMenu } from '@/context/MenuContext';
import Pagination1 from "../../common/Pagination1";

export default function Lookbook() {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const isMobileDevice = () => {
      return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    };

    setIsMobile(isMobileDevice());
  }, []);

  if (isMenuLoading) {
    return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  return (
    <div className="lookbook-products container position-relative">
      <img
        className="h-auto"
        loading="lazy"
        src={
          !isMobile
            ? "https://www.ahmedalmaghribi.com/wp-content/uploads/2024/05/web-banner.jpg"
            : "https://www.ahmedalmaghribi.com/wp-content/uploads/2024/05/giftset-mobile-banner.jpg"
        }
        alt="image"
      />
      {!isMobile
        ? products17.map(({ id, style, imgSrc, price, title }) => (
            <React.Fragment key={id}>
              <button
                className="popover-point type2 position-absolute"
                style={style}
                data-tooltip-id={id.toString()}
              >
                <span>+</span>
              </button>
              <Tooltip
                place="right-start"
                className="example"
                render={({ content, activeAnchor }) => (
                  <div className="popover-product">
                    <a href={`/product1_simple/${id}`}>
                      <img
                        width={330}
                        height={400}
                        loading="lazy"
                        className="mb-3"
                        src={imgSrc}
                        alt="image"
                      />
                    </a>
                    <p className="fw-medium mb-0">
                      <a href={`/product1_simple/${id}`}>{title}</a>
                    </p>
                    <p className="mb-0">{ currency.symbol }{price}</p>
                  </div>
                )}
                openOnClick
                id={id.toString()}
              />
            </React.Fragment>
          ))
        : products17mob.map(({ id, style, imgSrc, price, title }) => (
            <React.Fragment key={id}>
              <button
                className="popover-point type2 position-absolute"
                style={style}
                data-tooltip-id={id.toString()}
              >
                <span>+</span>
              </button>
              <Tooltip
                place="right-start"
                className="example"
                render={({ content, activeAnchor }) => (
                  <div className="popover-product">
                    <a href={`/product1_simple/${id}`}>
                      <img
                        width={330}
                        height={400}
                        loading="lazy"
                        className="mb-3"
                        src={imgSrc}
                        alt="image"
                      />
                    </a>
                    <p className="fw-medium mb-0">
                      <a href={`/product1_simple/${id}`}>{title}</a>
                    </p>
                    <p className="mb-0">${price}</p>
                  </div>
                )}
                openOnClick
                id={id.toString()}
              />
            </React.Fragment>
          ))}
    </div>
  );
}
