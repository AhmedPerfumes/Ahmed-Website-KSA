"use client";
import React from "react";
import Hero from "../homes/home-2/Hero";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "../otherPages/Contact/ContactForm";
import { useLocale, useTranslations } from "use-intl";
import Categories from "@/components/homes/home-15/Categories";
import VideoPanel from "../VideoPanel";
import Contact_campaign from "../otherPages/Contact/Contact_campaign";

function CityWalk() {
    const locale = useLocale();
    const t = useTranslations();
    return (
        <>
            {/* Hero Section */}
            <div>
                <div className="container-fluid p-0 pt-2">
                    <Image
                        loading="lazy"
                        className="w-100 h-auto d-none d-lg-block"
                        src="/assets/images/campaigns/fathers-day-web-lp.jpg"
                        alt="image"
                        width={1500}
                        height={550}
                    />
                </div>
                <div className="container-fluid p-0 pt-2">
                    <Image
                        loading="lazy"
                        className="w-100 h-auto d-lg-none"
                        src="/assets/images/campaigns/fathers-day-mob.jpg"
                        alt="image"
                        width={1500}
                        height={550}
                    />
                </div>
            </div>
            <section className="d-flex section-3 justify-content-center">
  <div className="w-100">
    <div className="section-content">
      <div className="d-flex flex-column align-items-center justify-content-around">
      <div className="section-head pt-5 pb-5">
                                <h2 className="text-center">
                                    {"A Gift as Majestic as Your Love"}
                                    <br />
                                    <span className="text-uppercase">
                                        {"Happy Father's Day"}
                                    </span>
                                </h2>
                            </div>

        {/* Desktop Video */}
        {/* <div className="d-none d-md-block pb-3 w-100 text-center">
          <div className="videoarea d-flex justify-content-center align-items-center">
            <VideoPanel src="/assets/videos/multi-product.mp4" section="" />
          </div>
          <div className="mt-3">
          <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                            href={`/${locale}/shop/gift-sets/gift-sets/aazz-o-azeez`}
                        >
                            Shop Now
                        </a>
          </div>
        </div> */}

        {/* Mobile Video */}
        {/* <div className="d-block d-md-none pb-3 w-100 text-center">
          <div className="videoarea d-flex justify-content-center align-items-center">
            <VideoPanel
              src="/assets/videos/multi-product-mobile.mp4"
              section="hundred"
            />
          </div>
          <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium mt-3 mb-3"
                            href={`/${locale}/shop/gift-sets/gift-sets/aazz-o-azeez`}
                        >
                            Shop Now
                        </a>
        </div> */}
      </div>
    </div>
  </div>
</section>

            {/* <div className="container pt-2 mt-3">
        <div className="section2 text-center">
          <h3 className="text-uppercase fs-2 mb-5">
          This Father's Day, Give the Gift of Elegance
          </h3>
        </div>
        <div className="row align-items-center mt-4">
          <div className="col-md-6">
            <video className="w-100" autoPlay loop muted>
              <source
                src="https://www.ahmedalmaghribi.com/wp-content/uploads/2024/07/SHOP-VIDEO-1.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="col-md-6 text-center pt-5">
            <h4 className="text-uppercase fs-2">
              "The Perfect Father’s Day Gift"
            </h4>
            <p className="mt-3 fs-6">
           
                "Celebrate Father's Day with Gift Set a luxurious fragrance collection that captures the essence of strength, elegance, and timeless sophistication. Thoughtfully curated with premium perfumes, each scent is crafted to perfection making it the perfect gift for the father who deserves nothing but the finest. This Father's Day, honor him with a touch of class and a scent that lasts."
              
            </p>
            <div className="d-flex justify-content-center pt-3">
            <a
                                    className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                                    href={`/${locale}/shop/gift-sets/gift-sets/aazz-o-azeez`}
                                >
                                    Shop Now
                                </a>
                    </div>
          </div>
        </div>
      </div> */}
            <div className="container">
                <div className="row align-items-center">
                    {/* Image column - shown first on mobile/tablet, second on desktop */}
                    <div className="col-md-6 order-1 order-md-2 mb-4 mb-md-0">
                        <Image
                            width={0}
                            height={0}
                            sizes="100%"
                            className="img-fluid"
                            src="/assets/images/campaigns/bin-shaikh.jpg"
                            alt="Wedding products display"
                            loading="lazy"
                            style={{ width: "100%", height: "auto" }}
                            aria-label="Wedding products"
                        />
                    </div>

                    {/* Text column - shown second on mobile/tablet, first on desktop */}
                    <div className="col-md-6 text-center px-md-5 mb-2 order-2 order-md-1">
                        <p className="fs-2 text-uppercase font-weight-bold mb-3">
                            Bin Shaikh
                        </p>
                        <p className="fs-6 mb-3">
                            Like priceless wisdom passed down over the ages, the Bin Shaikh was passed down from our forefathers, making this vintage scent a truly priceless work of art. An exotic blend of distinct aromas.
                        </p>
                        <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                            href={`/${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`}
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row align-items-center">
                    {/* Image column - shown first on desktop, second on mobile/tablet */}
                    <div className="col-md-6 order-1 order-md-1 mb-4 mb-md-0">
                        <Image
                            width={0}
                            height={0}
                            sizes="100%"
                            className="img-fluid"
                            src="/assets/images/zumar 2.jpg"
                            alt="Aazz-O-Azeez Gift Set"
                            loading="lazy"
                            style={{ width: "100%", height: "auto" }}
                            aria-label="Aazz-O-Azeez Gift Set"
                        />
                    </div>

                    {/* Text column - shown second on desktop, first on mobile/tablet */}
                    <div className="col-md-6 text-center px-md-5 mb-2 order-2 order-md-2">
                        <p className="fs-2 text-uppercase font-weight-bold mb-3">
                            Zumar
                        </p>
                        <p className="fs-6 mb-3">
                            Show Dad how much he means to you with Zumar Eau de
                            Parfum. A rich, aromatic fragrance that blends bold
                            saffron, fresh pear, and red berries with a
                            captivating floral heart. The warm, earthy base of
                            patchouli and cacao creates a sensual finish —
                            perfect for the man who leaves a lasting impression.
                        </p>
                        <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                            href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`}
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>

            <section className="d-flex flex-direction-column bg-white mt-5 ">
                <div className="panel2 mb-4">
                    <div className="inner2 mt-5 d-flex align-items-center">
                        {/* Limited Quantity */}
                        <Categories section="fathersDay" />
                    </div>
                </div>
            </section>
           
                        

            <Contact_campaign/>
        </>
    );
}

export default CityWalk;
