"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import Hero from "@/components/homes/home-8/Hero";
import Hero2 from "@/components/homes/home-8/Hero2";
import ProductHero from "@/components/homes/home-5/Hero";
import {
    KeyboardArrowLeftRounded,
    KeyboardArrowRightRounded,
} from "@mui/icons-material";
import "./HomePage.css";
import Swiper from "swiper";
import VideoPanel from "./VideoPanel";
import Categories from "@/components/homes/home-15/Categories";
import Lookbook from "@/components/homes/home-9/Lookbook";
import Image from "next/image";
import Link from "next/link";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import ProductSlider from "./ProductSlider";

gsap.registerPlugin(ScrollTrigger);

const ScrollSnapHorizontalBootstrap = () => {
    const locale = useLocale();
    const t = useTranslations();

    const [isMobile, setIsMobile] = useState(null);

    useEffect(() => {
        const sections = gsap.utils.toArray(".scroll-section");
        // const panels = gsap.utils.toArray(".horizontal-scroll .panel");

        // Vertical snapping logic for all sections
        sections.forEach((section, i) => {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "bottom top",
                scrub: true,
                // snap: {
                //     snapTo: 1, // Snap to the nearest section immediately
                //     duration: 0.4, // Very short duration for snapping
                //     ease: "power1.inOut", // No easing for instant snapping
                //     delay: 0, // Remove additional delay
                //     inertia: false, // Disable inertia for quicker snapping
                // },
                onEnter: () => console.log(`Entering section ${i + 1}`),
                onLeaveBack: () => console.log(`Leaving section ${i + 1}`),
            });
        });

        const swiper = new Swiper(".mySwiper", {
            autoplay: {
                delay: 5000,
            },
            modules: [Autoplay, Pagination, Navigation],
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            effect: "fade",
            loop: true,
        });

        // swiper.on("slideChange", function () {
        //     const activeIndex = swiper.realIndex;
        //     updateNavCircle(activeIndex);
        // });

        // function updateNavCircle(activeIndex) {
        //     const circles = document.querySelectorAll(".swiper-pagination-horizontal .swiper-pagination-bullet");
        //     circles.forEach((circle) => {
        //         circle.classList.remove("swiper-pagination-bullet-active");
        //     });

        //     const activeCircle = document.querySelectorAll(".swiper-pagination-horizontal .swiper-pagination-bullet")[activeIndex];
        //     if (activeCircle) {
        //         activeCircle.classList.add("swiper-pagination-bullet-active");
        //     }
        // }

        // function handleNavCircleClick(index) {
        //     swiper.slideTo(index);
        // }

        // const navCircles = document.querySelectorAll(".swiper-pagination-horizontal .swiper-pagination-bullet");
        // navCircles.forEach((circle, index) => {
        //     circle.addEventListener("click", () => handleNavCircleClick(index));
        // });
        // Horizontal scrolling within `.horizontal-scroll`
        const panels = gsap.utils.toArray(".cont .panel2");
        if (panels.length > 0) {
            const panelTween = gsap.to(panels, {
                xPercent:
                    locale == "en"
                        ? -100 * (panels.length - 1)
                        : 100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: ".cont",
                    start: "top top",
                    end: `+=${panels.length * window.innerWidth}`,
                    pin: true,
                    scrub: 1,
                },
            });
        }

        // const mobilepanel = gsap.utils.toArray(".mobilecontainer .mobilepanel");
        //     if (mobilepanel.length > 0) {
        //     const mobilepanelTween = gsap.to(mobilepanel, {
        //         xPercent:
        //         locale == "en"
        //             ? -100 * (mobilepanel.length - 1)
        //             : 100 * (panels.length - 1),
        //         ease: "none",
        //         scrollTrigger: {
        //         trigger: ".mobilecontainer",
        //         start: "top top",
        //         end: "+=" + window.innerWidth * 3,
        //         pin: true,
        //         scrub: 3,
        //         },
        //     });
        //     }

        const isMobileDevice = () => {
            return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        };

        setIsMobile(isMobileDevice());

        return () => {
            // Cleanup all ScrollTriggers
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div id="main" className="">
            {/* Vertical Section 1 */}
            {/* <section className="scroll-section d-flex flex-direction-column">
                <div className="panel section-slider w-100 vh-100">
                    <Hero />
                </div>
            </section> */}

            <section className="vh-100 hero-banner d-none d-lg-block">
                <Hero />
            </section>
            <div className="d-block d-lg-none">
                <Hero2 />
            </div>

            <section className="scroll-section d-flex flex-direction-column section-1">
                <div className="panel section-slider w-100 vh-100">
                    {/* Background Overlay */}
                    {/* <div className="background-overlay"></div> */}
                    <div className="section-content">
                        <div className="text-center text-white d-flex justify-content-center">
                            <span className="t-subtitle">
                                {t("Signature Selections")}
                            </span>
                        </div>
                        <h2 className="h1 text-center text-white pt-3">
                            {t("Fragrances Adored by All")}
                        </h2>
                        <p className="text-center text-white section-paragraph">
                            {t(
                                "Discover our bestsellers crafted to suit diverse tastes From classics to modern blends each fragrance offers something unique for every scent lover"
                            )}
                        </p>
                        <div className="d-flex justify-content-center pt-5">
                            <Link
                                href={`/${locale}/product-category/perfumes`}
                                className="btn-rounded btn-link_lg  text-uppercase fw-medium text-white"
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bottom-scroll">
                    <Image
                        width={40}
                        height={40}
                        className="bottom-0 scroll-icon"
                        src="/assets/images/ahmed-icon.png"
                        alt="logo Ahmed"
                        loading="lazy"
                    />
                    <span className="text-white text-uppercase mt-2">
                        {t("Scroll to discover")}
                    </span>
                </div>
            </section>

            <section
                id="second-chapter-slider"
                className="container flex__column__center justify-content-center"
                data-v-ea8e1c8e=""
            >
                <div
                    className="container-description flex__column__center__bottom flex__g-xxs"
                    data-v-ea8e1c8e=""
                >
                    <h2 className="h1 text-center pt-3">{t("Best Sellers")}</h2>
                    <p className="text-center section-paragraph">
                        {t("Discover Best Selling")}
                    </p>
                </div>

                <ProductSlider prodSlide="bestSellers" />
            </section>

            <section className="scroll-section d-flex flex-direction-column section-2">
                <div className="panel sub-section w-100 vh-100">
                    <div className="section-content">
                        <div className="text-center text-white d-flex justify-content-center">
                            <span className="t-subtitle">
                                {t("WHERE LUXURY MEETS YOUR SENSES")}
                            </span>
                        </div>
                        <h2 className="h1 text-center text-white pt-3">
                            {t("Exclusive Collection")}
                        </h2>
                        <p className="text-center text-white section-paragraph">
                            {t(
                                "Explore our exclusive collection of refined scents made with the finest ingredients Elegant and original each fragrance complements your style"
                            )}
                        </p>
                        <div className="d-flex justify-content-center pt-5">
                            <Link
                                href={`/${locale}/shop`}
                                className="btn-rounded btn-link_lg  text-uppercase fw-medium text-white"
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bottom-scroll">
                    <Image
                        width={40}
                        height={40}
                        className="bottom-0 scroll-icon"
                        src="/assets/images/ahmed-icon.png"
                        alt="logo Ahmed"
                        loading="lazy"
                    />
                    <span className="text-white text-uppercase mt-2">
                        {t("Scroll to discover")}
                    </span>
                </div>
            </section>

            <section className="d-flex section-3">
                <div className="">
                    <div className="section-content">
                        <div className="d-flex flex-column justify-content-around ">
                            <div className="section-head pt-5 pb-5">
                                <h2 className="text-center">
                                    {t("Crafted for The")}
                                    <br />
                                    <span className="text-italic">
                                        {t("discerning")}
                                    </span>
                                </h2>
                                {/* <p className="text-center section-paragraph">
                                    {t(
                                        "Explore our exclusive collection of refined scents"
                                    )}
                                    <br />{" "}
                                </p> */}
                            </div>
                            <div className="d-none d-md-block pb-3">
                                <div className="videoarea d-flex align-items-center">
                                    <VideoPanel
                                        src="/assets/videos/multi-product.mp4"
                                        section="hundred"
                                    />
                                </div>
                            </div>
                            <div className="d-block d-sm-none pb-3">
                                <div className="videoarea d-flex align-items-center">
                                    <VideoPanel
                                        src="/assets/videos/multi-product-mobile.mp4"
                                        section="hundred"
                                    />
                                </div>
                            </div>
                            <p className="text-center section-paragraph">
                                {t(
                                    "Explore our exclusive collection of refined scents"
                                )}
                                <br />{" "}
                            </p>
                            <div className="d-flex justify-content-center ">
                                <Link
                                    href={`/${locale}/shop`}
                                    className="btn-rounded btn-link_lg  text-uppercase fw-medium "
                                >
                                    {t("Shop Now")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="scroll-section d-flex flex-direction-column section-4">
                <div className="panel sub-section w-100 vh-100">
                    <div className="section-content">
                        <div className="text-center text-white d-flex justify-content-center">
                            <span className="t-subtitle">
                                {t("Elegant Treasures for Every Occasion")}
                            </span>
                        </div>
                        <h2 className="h1 text-center text-white pt-3">
                            {t("The Art of Gifting")}
                        </h2>
                        <p className="text-center text-white section-paragraph">
                            {t(
                                "Celebrate special moments with our curated fragrance gift sets Beautifully presented and featuring our finest scents they make the perfect gift for any occasion"
                            )}
                        </p>
                        <div className="d-flex justify-content-center pt-5">
                            <Link
                                href={`/${locale}/shop`}
                                className="btn-rounded btn-link_lg text-uppercase fw-medium text-white"
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bottom-scroll">
                    <Image
                        width={40}
                        height={40}
                        className="bottom-0 scroll-icon"
                        src="/assets/images/ahmed-icon.png"
                        alt="logo Ahmed"
                        loading="lazy"
                    />
                    <span className="text-white text-uppercase mt-2">
                        {t("Scroll to discover")}
                    </span>
                </div>
            </section>

            <section className="d-flex">
                <div className="w-100 d-flex flex-column">
                    <div className="d-flex flex-column justify-content-around gap-5">
                        <div className="section-head">
                            <h2 className=" text-center pt-5">
                                {t("Gifts for Every")}
                                <br />
                                <span className="text-italic">
                                    {/* {t("Occasion")} */}
                                </span>
                            </h2>
                            <p className="text-center section-paragraph">
                                {t(
                                    "Delight your loved ones with our luxurious gift sets, thoughtfully curated to include our most exquisite fragrances"
                                )}
                            </p>
                        </div>
                    </div>
                    <Categories section="section3" />
                </div>
            </section>

            <section className="d-flex flex-column align-items-center pt-5">
                <span className="t-subtitle">
                    {t("The perfect gift for every occasion")}
                </span>
                <div className="d-flex flex-row align-items-center ">
                    <div className="mt-4 mb-5 d-none d-md-block">
                        <a
                            href={`/${locale}/shop/gift-sets/gift-sets/ihdaa-khaas`}
                        >
                            <Image
                                loading="lazy"
                                src="/assets/images/Ihda-khas-giftset.jpg"
                                width="600"
                                height="600"
                                alt="Ihda-khas-giftset"
                                className="px-1"
                                style={{ objectFit: "contain" }}
                            />
                        </a>
                        <div className="d-flex justify-content-center pt-3">
                            <Link
                                href={`/${locale}/shop/gift-sets/gift-sets/ihdaa-khaas`}
                                className="btn-rounded btn-link_lg text-uppercase fw-medium "
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4 mb-5 d-none d-md-block">
                        <a
                            href={`/${locale}/shop/gift-sets/gift-sets/antee-gift-set-05`}
                        >
                            <Image
                                className="px-1"
                                src="/assets/images/Antee-05-Giftset.jpg"
                                width="600"
                                height="600"
                                alt="Antee"
                                style={{ objectFit: "contain" }}
                            />
                        </a>
                        <div className="d-flex justify-content-center pt-3">
                            <Link
                                href={`/${locale}/shop/gift-sets/gift-sets/antee-gift-set-05`}
                                className="btn-rounded btn-link_lg text-uppercase fw-medium "
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-4 mb-5 d-block d-sm-none d-flex flex-column">
                    <a href={`/${locale}/shop/dakhoon/gift-sets`}>
                        <Image
                            loading="lazy"
                            src="/assets/images/Ihda-khas-giftset.jpg"
                            width="600"
                            height="600"
                            alt="Ihda-khas-giftset"
                            className="w-100 h-100 px-1"
                            style={{ paddingTop: "1rem", objectFit: "contain" }}
                        />
                    </a>
                    <div className="d-flex justify-content-center pt-3">
                        <Link
                            href={`/${locale}/shop/gift-sets/gift-sets/ihdaa-khaas`}
                            className="btn-rounded btn-link_lg text-uppercase fw-medium "
                        >
                            {t("Shop Now")}
                        </Link>
                    </div>
                    <a href={`/${locale}/shop/dakhoon/gift-sets`}>
                        <Image
                            className="w-100 h-100 px-1"
                            src="/assets/images/Antee-05-Giftset.jpg"
                            width="600"
                            height="600"
                            alt="Oud-Asateen"
                            style={{ paddingTop: "1rem", objectFit: "contain" }}
                        />
                    </a>
                    <div className="d-flex justify-content-center pt-3">
                        <Link
                            href={`/${locale}/shop/gift-sets/gift-sets/antee-gift-set-05`}
                            className="btn-rounded btn-link_lg text-uppercase fw-medium "
                        >
                            {t("Shop Now")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-section d-flex flex-direction-column section-6">
                <div className="panel w-100 vh-100">
                    <div className="section-content">
                        <div className="text-center text-white d-flex justify-content-center">
                            <span className="t-subtitle">
                                {t("Ancient Aromas")}
                            </span>
                        </div>
                        <h2 className="h1 text-center text-white pt-3">
                            {t("The Essence of Arabic Dakhoon")}
                        </h2>
                        <p className="text-center text-white section-paragraph">
                            {t(
                                "Experience the heritage of Arabic Dakhoon made from natural ingredients Enjoy rich long lasting aromas that bring warmth and tradition to your home"
                            )}
                        </p>
                        <div className="d-flex justify-content-center pt-5">
                            <Link
                                href={`/${locale}/product-category/dakhoon`}
                                className="btn-rounded btn-link_lg  text-uppercase fw-medium text-white"
                            >
                                {t("Shop Now")}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bottom-scroll">
                    <Image
                        width={40}
                        height={40}
                        className="bottom-0 scroll-icon"
                        src="/assets/images/ahmed-icon.png"
                        alt="logo Ahmed"
                        loading="lazy"
                    />
                    <span className="text-white text-uppercase mt-2">
                        ` {t("Scroll to discover")}
                    </span>
                </div>
            </section>

            {/* Horizontal Scrolling Section */}

            <section className="cont testsect">
                <div className="panel2 mb-4">
                    <div className="inner2 mt-5 d-flex align-items-center">
                        {/* Iconic indulgence */}
                        <Categories section="section4" />
                    </div>
                </div>

                <div className="panel2 mt-5">
                    <div className="inner2">
                        <VideoPanel
                            src="/assets/videos/zumar-video.mp4"
                            section="hundred"
                        />
                    </div>
                </div>

                <div className="panel2 mt-5">
                    <div className="inner2 d-flex flex-column align-items-center">
                        <Categories />
                    </div>
                </div>

                <div className="panel2 mt-5 ">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <h3 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-2">
                            {/* {t("Reaching Every Corner of the World")} */}
                            {t("Essence of Arabia")}
                        </h3>
                        <p className="text-center section-paragraph pb-3">
                            {/* {t("Exports Text")} */}
                            {t("Step into")}
                        </p>
                        <Link
                            href={`/${locale}/shop/dakhoon`}
                            className="btn-rounded btn-link_lg  text-uppercase fw-medium"
                        >
                            {t("Discover")}
                        </Link>
                    </div>
                    <div className="inner2 mt-4 d-flex align-items-center ">
                        <Link
                            href={`/${locale}/shop/dakhoon/bakhoor/bakhoor-ahmed-40-tabs`}
                        >
                            <img
                                className="w-100"
                                src="/assets/images/bakhoor-ahmed.jpg"
                                alt="Bakhoor Ahmed"
                            />
                        </Link>
                        <Link
                            href={`/${locale}/shop/dakhoon/oud-maattar/oud-kiflain`}
                        >
                            <img
                                className="w-100"
                                src="/assets/images/oud-kiflain.jpg"
                                alt="Oud Asateen"
                            />
                        </Link>
                    </div>
                </div>
            </section>

            {/* For Mobile Horizontal Slider  */}

            <section className="scroll-section d-lg-none d-flex flex-direction-column align-items-center">
                <Categories />
            </section>

            {/* <section
                id="second-chapter-slider"
                className="d-lg-none container flex__column__center justify-content-center"
                data-v-ea8e1c8e=""
            >
                <div
                    className="container-description flex__column__center__bottom flex__g-xxs"
                    data-v-ea8e1c8e=""
                >
                    <h2 className="h1 text-center pt-3">
                        {t("Luxury Delight")}
                    </h2>
                    <div className="t__m t__color-blue" data-v-ea8e1c8e="">
                        {t(
                            "Explore our full range of luxurious Dakhoon products and bring home the essence of tranquility today!"
                        )}
                    </div>
                </div>

                <ProductSlider prodSlide="mobileHorizontal" />
            </section> */}

            {/* Vertical Section 3 */}
            {/* <section className="scroll-section">
                <div className="panel orange w-100 vh-100"></div>
            </section> */}

            <section className="d-flex flex-direction-column section-7 mt-3">
                <div className="panel w-100 vh-100">
                    <div className="section-content">
                        <div className="text-center text-white d-flex justify-content-center">
                            <span className="t-subtitle">
                                {t("WHERE LUXURY MEETS YOUR SENSES")}
                            </span>
                        </div>
                        <h2 className="h1 text-center text-white pt-3">
                            {t("Your Journey Begins with a Scent")}
                        </h2>
                        <p className="text-center text-white section-paragraph">
                            {t(
                                "At Ahmed Al Maghribi Perfumes each fragrance tells your story Our luxurious scents evoke memories and emotions becoming a lasting part of who you are"
                            )}
                        </p>
                        <div className="d-flex justify-content-center pt-5">
                            <Link
                                href={`/${locale}/shop`}
                                className="btn-rounded btn-link_lg  text-uppercase fw-medium text-white"
                            >
                                {t("Discover Now")}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bottom-scroll">
                    <Image
                        width={40}
                        height={40}
                        className="bottom-0 scroll-icon"
                        src="/assets/images/ahmed-icon.png"
                        alt="logo Ahmed"
                        loading="lazy"
                    />
                    <span className="text-white text-uppercase mt-2">
                        {t("Scroll to discover")}
                    </span>
                </div>
            </section>

            {/* Vertical Section 4 */}
            {/* <section className="scroll-section">
                <div className="panel blue w-100 vh-100"></div>
            </section> */}
            <section
                id="end"
                className="container d-flex flex-column justify-content-center"
            >
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-center pt-5">
                    <div className="order-1 order-md-0">
                        <VideoPanel
                            src="/assets/videos/production.mp4"
                            section="hundred"
                        />
                    </div>
                    <div className="col-lg-7 p-3 text-center order-3 order-md-1">
                        <h3 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-2">
                            {t(
                                "Quality Crafted Through Expertise 20 plus Years of Mastery"
                            )}
                        </h3>
                        <p className="section-paragraph">
                            {t(
                                "For over 20 years Ahmed Al Maghribi Perfumes has been dedicated to creating luxurious timeless scents Using only the finest natural ingredients we ensure every fragrance is crafted with precision and excellence offering lasting quality"
                            )}
                        </p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mt-3">
                    <div className="col-lg-7 p-3 text-center order-1 order-md-0">
                        <h3 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-2">
                            {t(
                                "A gracious invitation to experience our boutique"
                            )}
                        </h3>
                        <p className="section-paragraph">{t("Steps")}</p>
                    </div>
                    <div className="order-0 order-md-1 mb-5">
                        <img
                            className="h-auto w-100"
                            src="/assets/images/home/demo8/Shop.jpg"
                            alt="image"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ScrollSnapHorizontalBootstrap;
