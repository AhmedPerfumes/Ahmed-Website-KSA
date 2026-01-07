import React, { useEffect, useRef } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import Zoom from "./zoom";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation } from "swiper/modules";
import "./carousel.css";
import Badge from "./Badge";

const Carousel = ({ images, activeIndex, setActiveIndex }) => {
    const swiperRef = useRef(null);

    useEffect(() => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideTo(activeIndex);
        }
    }, [activeIndex]);

    return (
        <Swiper
            ref={swiperRef}
            modules={[Navigation, EffectFade]}
            effect="fade"
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="w-100 responsive-swiper position-relative"
        >
            {images.map((image, index) => (
                <SwiperSlide key={index}>
                    {/* Render the badge if its data exists for this image */}
                    {image.badgeTypes && image.badgeTypes.map((badgeType, index) => (
                            <Badge key={index} type={badgeType} index={index} />
                            ))}
                    <div className="d-flex align-items-center justify-content-center w-100 h-100">
                        <Zoom
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image.src}`}
                            zoom={2}
                            lensSize={180}
                        />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default Carousel;
