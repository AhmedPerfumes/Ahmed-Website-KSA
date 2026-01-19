"use client";

import { useState } from "react";
import InfoBase from "./infobase";
import GalleryBase from "./gallerybase";
import ProductAccordion from "./accordian";
import "./base.css"
// import "./bootstrap-local.scss"
import Sticky from './sticky';
import { useEffect } from 'react';
import he from 'he';
import dynamic from 'next/dynamic'


const Base = ({product}) => {
    const cleanName = he.decode(product?.product_name || "Default");
    const [activeIndex, setActiveIndex] = useState(0);

    // console.log(product, "product in base");

    const images = product?.images ? JSON.parse(product.images) : [];
    useEffect(() => {
        require("bootstrap");
    }, [])

    // Dynamically import the 3D viewer, and explicitly disable SSR.
    // const PerfumeViewer = dynamic(
    // () => import('./3D/PerfumeViewer'),
    // { 
    //     ssr: false,
    //     loading: () => <div style={{height: '600px', background: '#f0f0f0'}} /> 
    // }
    // )

    return (
        <div className="App lg:py-5" >
            <div className="head-container container">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 gap-lg-4 ">
                    <div className="info-container order-2 order-lg-1">
                        <InfoBase
                            images={images}
                            product={product}
                            onThumbnailClick={setActiveIndex}
                        />
                    </div>

                    <div className="gallery-container d-flex justify-content-center order-1 order-lg-2">
                        <GalleryBase
                            images={images}
                            product={product}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            onThumbnailClick={setActiveIndex}
                        />
                    </div>

                    <div className="accordion-container order-3 order-lg-3 accordion-padding">
                        <ProductAccordion product={product}/>
                    </div>
                </div>

                {/* <div className="product-media">
                    <PerfumeViewer />
                </div> */}

                <Sticky image={images[0]} name={cleanName} price={product?.price || "0.00"} product={product} />
            </div>
        </div>
    );
};

export default Base;
