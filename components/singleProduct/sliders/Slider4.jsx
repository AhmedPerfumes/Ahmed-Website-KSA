"use client";

import { useEffect, useState } from "react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/thumbs";
import "swiper/css";
import "photoswipe/dist/photoswipe.css";

import { Gallery, Item } from "react-photoswipe-gallery";

// const images = [
//   {
//     imgSrc: "https://www.guerlain.com/dw/image/v2/BDCZ_PRD/on/demandware.static/-/Sites-GSA_master_catalog/default/dw200bc326/primary_packshot_3/2024/FRAGRANCE/L__HOMME_IDEAL_-_EDP_100ml-263403.jpg?sw=700&sh=700&sfrm=png",
//   },
//   {
//     imgSrc: "https://www.guerlain.com/dw/image/v2/BDCZ_PRD/on/demandware.static/-/Sites-GSA_master_catalog/default/dwa899995d/primary_packshot_3/2024/FRAGRANCE/LES-MASCULINS-24_SECONDARY-VISUAL_PDP_KV_LHI.jpg?sw=700&sh=700&sfrm=jpg",
//   },
//   {
//     imgSrc: "https://www.guerlain.com/dw/image/v2/BDCZ_PRD/on/demandware.static/-/Sites-GSA_master_catalog/default/dwdb8fe874/primary_packshot_3/2024/FRAGRANCE/G030522_3346470305229_H-IDEAL-24-PARFUM-SPR-100ML_1.jpg?sw=700&sh=700&sfrm=png",
//   },
//   {
//     imgSrc: "https://www.ahmedalmaghribi.com/wp-content/uploads/2023/02/hubb-o-salam-3.jpg",
//   },
// ];

import Image from "next/image";
import tippy from "tippy.js";

export default function Slider4({ product }) {
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);
  
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const handleMouseMove = (e) => {
    const magnifier = e.currentTarget.querySelector(".magnifier-glass");
    const img = e.currentTarget.querySelector("img");
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    magnifier.style.backgroundImage = `url(${img.src})`;
    magnifier.style.backgroundSize = `${width * 2}px ${height * 2}px`; // Zoom factor (2x in this case)
    magnifier.style.backgroundPosition = `-${x * 2}px -${y * 2}px`; // Move background position based on mouse
    magnifier.style.left = `${x - magnifier.offsetWidth / 2}px`;
    magnifier.style.top = `${y - magnifier.offsetHeight / 2}px`;
  };

  const handleMouseOut = (e) => {
    e.currentTarget.querySelector(".magnifier-glass").style.display = "none";
  };

  const handleMouseOver = (e) => {
    e.currentTarget.querySelector(".magnifier-glass").style.display = "block";
  };

  return (
    <div
      className="product-single__media horizontal-thumbnail product-media-initialized"
      data-media-type="horizontal-thumbnail"
    >
      <div className="product-single__image">
        <Gallery>
          <Swiper
            modules={[Thumbs, Navigation]}
            slidesPerView={1}
            navigation={{ prevEl: ".ssnbp1", nextEl: ".ssnbn1" }}
            thumbs={{ swiper: thumbsSwiper }}
            className="swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
            style={{ maxWidth: "100%", overflow: "hidden" }}
          >
            {product?.images && JSON.parse(product.images).map((elm, i) => (
              <SwiperSlide
                key={i}
                className="swiper-slide product-single__image-item magnifier-container"
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onMouseOver={handleMouseOver}
              >
                <Item
                  original={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm}`}
                  thumbnail={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm}`}
                  width="674"
                  height="674"
                >
                  {({ ref, open }) => (
                    <>
                      <img
                        loading="lazy"
                        className="h-auto w-100"
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm}`}
                        width="674"
                        height="674"
                        alt="image"
                      />
                      <a
                        ref={ref}
                        onClick={open}
                        data-fancybox="gallery"
                        className="item-zoom"
                        data-bs-toggle="tooltip"
                        data-bs-placement="left"
                        data-tippy-content="Zoom"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <use href="#icon_zoom" />
                        </svg>
                      </a>
                      <div className="magnifier-glass"></div>
                    </>
                  )}
                </Item>
              </SwiperSlide>
            ))}

            <div className="cursor-pointer swiper-button-prev ssnbp1">
              <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_prev_sm" />
              </svg>
            </div>
            <div className="cursor-pointer swiper-button-next ssnbn1">
              <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#icon_next_sm" />
              </svg>
            </div>
          </Swiper>
        </Gallery>
      </div>
      <div className="product-single__thumbnail">
        <Swiper
          className="swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events swiper-container-free-mode swiper-container-thumbs swiper-thumb-3"
          modules={[Thumbs, FreeMode]}
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
        >
          {product?.images && JSON.parse(product.images).map((elm, i) => (
            <SwiperSlide
              key={i}
              className="swiper-slide product-single__image-item"
            >
              <img
                loading="lazy"
                className="h-auto"
                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm}`}
                width="200"
                height="200"
                alt="image"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
