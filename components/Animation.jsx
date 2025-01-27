"use client";
import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";
import Hero from "@/components/homes/home-8/Hero";
import Hero2 from "@/components/homes/home-8/Hero2";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "./footers/MobileFooter2";
import VideoPanel from "./VideoPanel";

import Categories from "@/components/homes/home-15/Categories";
import Lookbook from "@/components/homes/home-9/Lookbook";

import Swiper from "swiper";
import "./Animation.css";
import MobileSlider from "./singleProduct/sliders/MobileSlider";
import { duration } from "@mui/material";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftOutlined, ArrowLeftRounded, ArrowLeftTwoTone, KeyboardArrowLeftRounded, KeyboardArrowRightRounded, MoveDownOutlined, RampLeft, SwipeLeft, SwipeLeftAltOutlined, SwipeLeftAltRounded, SwipeLeftRounded, SwipeRight } from "@mui/icons-material";
import { FiArrowLeft, FiArrowLeftCircle, FiArrowRight, FiChevronsLeft } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);
const Animation = () => {
  const locale = useLocale();
  const t = useTranslations();
  useEffect(() => {
    // Check if the necessary elements exist before proceeding
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
          end: "+=" + window.innerWidth * 3,
          pin: true,
          scrub: 1,
        },
      });
    }

    const mobilepanel = gsap.utils.toArray(".mobilecontainer .mobilepanel");
    if (mobilepanel.length > 0) {
      const mobilepanelTween = gsap.to(mobilepanel, {
        xPercent:
          locale == "en"
            ? -100 * (mobilepanel.length - 1)
            : 100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: ".mobilecontainer",
          start: "top top",
          end: "+=" + window.innerWidth * 3,
          pin: true,
          scrub: 3,
        },
      });
    }

    const swiper = new Swiper(".mySwiper", {
      navigation: {
        nextEl: ".swiper-next-button",
        prevEl: ".swiper-prev-button",
      },
      effect: "fade",
      loop: true,
    });

    swiper.on("slideChange", function (sld) {
      document.body.setAttribute("data-sld", sld.realIndex);
    });

    swiper.on("slideChange", function () {
      const activeIndex = swiper.realIndex;
      updateNavCircle(activeIndex);
    });

    function updateNavCircle(activeIndex) {
      const circles = document.querySelectorAll(".nav-circle");
      circles.forEach((circle) => {
        circle.classList.remove("active");
      });
    
      const activeCircle = document.querySelectorAll(".nav-circle")[activeIndex];
      if (activeCircle) {
        activeCircle.classList.add("active");
      }
    }
    
    function updateNavCircle(activeIndex) {
      const circles = document.querySelectorAll(".nav-circle");
      circles.forEach((circle) => {
        circle.classList.remove("active");
      });
    
      const activeCircle = document.querySelectorAll(".nav-circle")[activeIndex];
      if (activeCircle) {
        activeCircle.classList.add("active");
      }
    }
    
    function handleNavCircleClick(index) {
      swiper.slideTo(index);
      updateNavCircle(index); // Update the circle based on the new slide
    }
    
    // Add functionality for left and right arrows
    function handleArrowClick(direction) {
      const activeIndex = swiper.realIndex; // Get the current active slide index
      let newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    
      // Wrap around the slides when reaching the end or beginning
      if (newIndex < 0) {
        newIndex = swiper.slides.length - 1;
      } else if (newIndex >= swiper.slides.length) {
        newIndex = 0;
      }
    
      swiper.slideTo(newIndex);
      updateNavCircle(newIndex); // Update the circle based on the new slide
    }
    
    // Attach event listeners to the navigation circles
    const navCircles = document.querySelectorAll(".nav-circle");
    navCircles.forEach((circle, index) => {
      // Add mouse and touch events to handle clicks/taps on both desktop and mobile
      circle.addEventListener("click", () => handleNavCircleClick(index));
      circle.addEventListener("touchstart", () => handleNavCircleClick(index)); // For mobile devices
    });
    
    // Attach event listeners to the left and right arrows
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    
    if (leftArrow) {
      leftArrow.addEventListener("click", () => handleArrowClick('left'));
      leftArrow.addEventListener("touchstart", () => handleArrowClick('left')); // For mobile devices
    }
    
    if (rightArrow) {
      rightArrow.addEventListener("click", () => handleArrowClick('right'));
      rightArrow.addEventListener("touchstart", () => handleArrowClick('right')); // For mobile devices
    }
    
    

    gsap.utils.toArray(".testsect").forEach((section) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 400px",
          end: "bottom 95%",
          scrub: 4,
        },
      });

      timeline.to(section.querySelector(".sub-title"), {
        opacity: 1,
        duration: 1,
      });

      timeline.fromTo(
        section.querySelector(".h2"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.75 }
      );

      timeline.fromTo(
        section.querySelector(".p"),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.85 }
      );
    });

    let imgs = gsap.utils.toArray(".zoom_img");
    imgs.forEach((img, i) => {
      if (img) {
        gsap.fromTo(
          img,
          { scale: 0.75 },
          {
            scale: 1,
            scrollTrigger: {
              trigger: img,
              start: "top 70%",
              end: "top 7.5%",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div id="main2">
      <section className="vh-100 hero-banner d-none d-lg-block">
        <Hero />
        <Hero />
      </section>
      <div className="d-sm-block d-md-none">
      <Hero2/> 

      </div>
      <section className="testsect bg-custom">
        <div className="panel2 position-relative d-flex justify-content-center">
          <img
            className="zoom_img section1"
            style={{ width: "100%" }}
            src="/assets/images/home/demo8/avif/multiple-products-banner.avif"
            alt={t("Signature Selections")}
          />
          <div className="text_reveal position-absolute">
            <div className="text-center text-white sub-title">
              {t("Signature Selections")}
            </div>
            <h2 className="text-center text-white h2">
              {t("Fragrances Adored by All")}
            </h2>
            <p className="text-center text-white p">
              {t(
                "Discover our bestsellers crafted to suit diverse tastes From classics to modern blends each fragrance offers something unique for every scent lover"
              )}
            </p>
          </div>

          <a
            href="#footer"
            className="d-block position-absolute start-50 translate-middle-x text_dash text-white text-uppercase fw-medium mb-5 text-nowrap"
            style={{ bottom: "0" }}
          >
            {t("Scroll To Discover More")}
          </a>
        </div>
      </section>

      {/* Top 10 Products */}
      <section className="testsect section2 d-flex">
        <div className="panel2 d-flex justify-content-center align-items-lg-center">
          <div className="contai ">
            <div className="mySwiper">
              <div className="main-wrapper swiper-wrapper">
                <div className="mainnn swiper-slide " id="beach">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Bin Shaikh")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 215.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("French Lavender Saffron Rose Citrus Oakmoss")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("Jasmine Orchid Sugar Violet Icennse Bakhoor")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t(
                            "Patchouli Agarwood Ambroxan Musk White Amber Resins"
                          )}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/bin-shaikh.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/bin-shaikh.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="savanna">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Ignite Oud")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 250.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("GERANIUM LEATHER")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("CEDARWOOD PATCHOULI")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("MOSS MUSK AMBER SANDALWOOD")}
                        </p>
                      </div>
                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/oriental-fragrance/ignite-oud`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/ignite-oud.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/ignite-oud.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="glacier">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Kaaf")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 100.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("RED FRUITS WATERMELON LAVENDER SICILIAN ORANGE")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("SANDALWOOD AMBBROXAN WHITE MUSK")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("LOTUS JASMINE LILLY OF THE VALLEY SEA ACCORD")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/oriental-fragrance/kaaf`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/kaaf.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/kaaf.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Laathani")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 175.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("FRESH NOTES CANDIED FRUITS PINK PEPPER")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("OUD ACCORDS ROSEMARY BAKHOOR ACCORDS")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("WHITE AMBER VETIVER MUSK LEATHER")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/oriental-fragrance/laathani`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/laathani.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/laathani.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Marj")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 165.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t(
                            "BERGAMOT PINK PEPPER ELEMI NUTMEG TANGERINE OUD HONEY"
                          )}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t(
                            "PATCHOULI AROMATIC ACCORDS VETIVER CASHMERE WOOD CINNAMON ROSE SAFFRON JASMINE ORANGE BLOSSOM"
                          )}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t(
                            "MUSK AMBER RASPBERRY SAFFRON OAKMOSS POWDER AMBRETTE SEEDS LEATHER SANDALWOOD VIOLET AGARWOOD AMBROXAN"
                          )}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/marj`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/marj.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/marj.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Musk & Roses")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 110.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("Floral Raspberry")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("Roses")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("Musky")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/musk-roses`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/musk-and-roses.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/musk-and-roses.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Oud & Roses")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 135.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("Turkish rose lavender lemon peony")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("sandal wood white flowers frankincense")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("agarwood guaiac wood oak moss Musk amber")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/oud-roses`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/oud-and-roses.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/oud-and-roses.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Oud Lavender")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 135.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("Hyacinth Lavender Fruits")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("Iris Jasmine Pink Pepper")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("Vetiver Amber Oud Musk")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/oud-lavender`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/oud-lavender.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/oud-lavender.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Rose Noir")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 110.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("Rose Jasmine Peony")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("White Flower Sandal Wood Frankincense")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("Agarwood Musk Amber Oak Moss")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/rose-noir`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/rose-noir.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/rose-noir.png"
                      />
                    </div>
                  </div>
                </div>
                <div className="mainnn swiper-slide" id="coral">
                  <div className="left-sideee">
                    <div className="mainnn-wrapper">
                      <h3 className="mainnn-header">{t("Best Sellers")}</h3>
                      <h1 className="mainnn-title">{t("Summer Oud")}</h1>
                      <h2 className="mainnn-subtitle">د.إ 150.00</h2>
                    </div>
                    <div className="mainnn-content">
                      <div className="mainnn-content__title ">
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Top Notes: ")}
                          </span>
                          {t("CYPRIOL SAFFRON INCENSE MANDARIN")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Heart Notes: ")}
                          </span>
                          {t("ROSE AMBER PATCHOULI CASHMERE WOOD CARAMEL")}
                        </p>
                        <p>
                          <span style={{ color: "#bb8c1c", fontSize: "18px" }}>
                            {t("Base Notes: ")}
                          </span>
                          {t("OUD ACCORDS MUSK OAKMOSS VETIVER LEATHER")}
                        </p>
                      </div>

                      <div className="moreee-menu pt-5">
                        <Link
                          href={`/${locale}/shop/perfumes/occidental-fragrance/summer-oud`}
                          className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                        >
                          {t("Shop Now")}
                        </Link>
                        
                      </div>
                      
                    </div>
                  </div>
                  <div className="centerrr">
                    <div className="right-side__img">
                      <img
                        className="bottle-bg"
                        src="assets/images/home/demo8/top/summer-oud.jpg"
                        alt=""
                      />
                      <img
                        className="bottle-img"
                        src="assets/images/home/demo8/top/bottles/summer-oud.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="nav-circle-container">
              {/* <SwipeLeft style={{color: "#bb8c1c"}}/> */}
              {/* <FiArrowLeft className="left-arrow" style={{ color: "#bb8c1c", cursor: "pointer" }} /> */}
              <KeyboardArrowLeftRounded className="left-arrow" style={{ color: "#bb8c1c", cursor: "pointer" }}/>
              
              <div className="nav-circle" data-target="#beach"></div>
              <div className="nav-circle" data-target="#savanna"></div>
              <div className="nav-circle" data-target="#glacier"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              <div className="nav-circle" data-target="#coral"></div>
              {/* <SwipeRight style={{color: "#bb8c1c"}}/> */}
              <KeyboardArrowRightRounded className="right-arrow" style={{ color: "#bb8c1c", cursor: "pointer" }} />
            </div>
          </div>
        </div>
      </section>

      {/* <div className="mb-4 pb-4 mb-xl-4 mt-xl-3 pt-xl-3 pb-xl-4"></div> */}

      {/* <div className="mb-4 pb-4 mb-xl-4 mt-xl-3 pt-xl-3 pb-xl-4"></div> */}
      <section className="testsect">
        <div className="panel2 position-relative d-flex justify-content-center">
          <img
            className="zoom_img section3"
            style={{ width: "100%" }}
            src="/assets/images/home/demo8/avif/collection-bnr.avif"
            alt="Exclusive Collection"
          />

          <div className="text_reveal position-absolute">
            <div className="text-center text-white sub-title">
              {t("Where Luxury Meets Your Senses")}
            </div>
            <h2 className="text-center text-white h2">
              {t("Exclusive Collection")}
            </h2>
            <p className="text-center text-white p">
              {t(
                "Explore our exclusive collection of refined scents made with the finest ingredients Elegant and original each fragrance complements your style"
              )}
            </p>
          </div>
          <Link
            href="#footer"
            className="d-block position-absolute start-50 translate-middle-x text_dash text-white text-uppercase fw-medium mb-5 text-nowrap"
            style={{ bottom: "0" }}
          >
            {t("Scroll To Discover More")}
          </Link>
        </div>
      </section>

      <section id="start" className="testsect zoom_img">
        <div className="panel2 d-flex flex-column justify-content-center align-items-center text-center pt-5">
          {/* For Large Screens */}
          <div className="d-none d-lg-block pt-2">
            <h2 className="fw-lighter sec-two-h2 pt-2">
              {t("Crafted for the Discerning")}
            </h2>
            <VideoPanel src="/assets/videos/multi-product.mp4" />
          </div>
          {/* For small screens */}
          <div className="d-block d-lg-none pt-2">
            <h2 className="fw-lighter sec-two-h2 pt-2 s-font">
              {t("Crafted for the Discerning")}
            </h2>

            <VideoPanel src="/assets/videos/multi-product-mobile.mp4" />
          </div>

          <Link
            href={`/${locale}/shop`}
            className="btn-link btn-link_lg default-underline text-uppercase fw-medium pt-5"
          >
            {t("Discover More")}
          </Link>
        </div>
      </section>

      <section className="testsect">
        <div className="panel2 position-relative d-flex justify-content-center">
          <img
            className="zoom_img gifting"
            style={{ width: "100%" }}
            src="/assets/images/home/demo8/avif/giftset-bnr.avif"
            alt="Art of Gifting"
          />
          <div className="text_reveal position-absolute">
            <div className="text-center text-white sub-title">
              {t("Elegant Treasures for Every Occasion")}
            </div>
            <h2 className="text-center text-white h2">
              {t("The Art of Gifting")}
            </h2>
            <p className="text-center text-white p">
              {t(
                "Celebrate special moments with our curated fragrance gift sets Beautifully presented and featuring our finest scents they make the perfect gift for any occasion"
              )}
            </p>
          </div>
          <Link
            href="#footer"
            className="d-block position-absolute start-50 translate-middle-x text_dash text-white text-uppercase fw-medium mb-5 text-nowrap"
            style={{ bottom: "0" }}
          >
            {t("Scroll To Discover More")}
          </Link>
        </div>
      </section>
      {/* <div className="mb-4 pb-4 mb-xl-4 mt-xl-3 pt-xl-3 pb-xl-4 zoom_img"></div> */}
      <section className="testsect d-flex zoom_img">
        <div
          className="panel2 d-flex flex-column justify-content-around
        gap-5"
        >
          <Lookbook />

          <Categories section="section3" />
        </div>
      </section>
      {/* Arabian Dakhoon Section */}
      <section className="testsect">
        <div className="panel2 position-relative d-flex justify-content-center">
          <img
            className="zoom_img section4"
            style={{ width: "100%" }}
            src="/assets/images/home/demo8/avif/dakhoon-bnr.avif"
            alt="Ethereal Essence"
          />
          <div className="text_reveal position-absolute zoom_img">
            <div className="text-center text-white sub-title">
              {t("Ancient Aromas")}
            </div>
            <h2 className="text-center text-white h2">
              {t("The Essence of Arabic Dakhoon")}
            </h2>
            <p className="text-center text-white p">
              {t(
                "Experience the heritage of Arabic Dakhoon made from natural ingredients Enjoy rich long lasting aromas that bring warmth and tradition to your home"
              )}
            </p>
          </div>
          <Link
            href="#footer"
            className="d-block position-absolute start-50 translate-middle-x text_dash text-white text-uppercase fw-medium mb-5 text-nowrap"
            style={{ bottom: "0" }}
          >
            {t("Scroll To Discover More")}
          </Link>
        </div>
      </section>
      {/* Full screen vertical Scroll Slider */}
      <section className="cont testsect ">
        <div className="panel2 mb-4">
          <div className="inner2 mt-5 d-flex align-items-center">
            {/* Iconic indulgence */}
            <Categories section="section4" />
          </div>
        </div>

        <div className="panel2 mt-5">
          <div className="inner2">
            <VideoPanel src="/assets/videos/zumar-video.mp4" />
          </div>
        </div>

        <div className="panel2 mt-5">
          <div className="d-flex flex-column align-items-center justify-content-center">
            <h3 className="text-center">
              {t("Essence of Arabia")}
            </h3>
            <p className="text-center px-3">{t("Step into")}</p>
            <div className="row mt-4 justify-content-center">
              <div className="col-6 col-md-4 px-1">
                <Link href={`/${locale}/shop/dakhoon/bakhoor/bakhoor-ahmed-40-tabs`}>
                  <img
                    className="w-100"
                    src="/assets/images/home/demo8/Bakhoor-Ahmed.jpg"
                    alt="Bakhoor Ahmed"
                  />
                </Link>
              </div>
              <div className="col-6 col-md-4 px-1">
                <Link href={`/${locale}/shop/dakhoon/oud-maattar/oud-mtr-asaateen`}>
                  <img
                    className="w-100"
                    src="/assets/images/home/demo8/Oud-Asateen.jpg"
                    alt="Oud Asateen"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="inner2 mt-5">
            <Categories />
          </div>
        </div>


        <div className="panel2 mt-5">
          <div className="d-flex flex-column align-items-center justify-content-center">
            <h3 className="text-center">
              {t("Reaching Every Corner of the World")}
            </h3>
            <p className="text-center px-3">{t("Exports Text")}</p>
            <Link
              href={`/${locale}/export`}
              className="btn-link btn-link_lg default-underline text-uppercase fw-medium pt-5"
            >
              {t("Discover More")}
            </Link>
          </div>
          <div className="inner2 mt-4 d-flex flex-column flex-md-row justify-content-start">
            <Link href={`/${locale}/export`}>
              <img
                className="px-2 w-100 w-md-auto"
                src="/assets/images/home/demo8/export/aqua-oud.jpg"
                alt="Image 1"
              />
            </Link>
            <Link href={`/${locale}/export`}>
              <img
                className="px-2 w-100 w-md-auto"
                src="/assets/images/home/demo8/export/endless.jpg"
                alt="Image 2"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* This is the Mobile Slider  */}
      <section className="MobileSlider mobilecontainer d-lg-none zoom_img">
        &nbsp;&nbsp;&nbsp;
        <div className="mobilepanel d-flex justify-content-center">
          <div className="inner text-center pt-5 mt-4">
            <Categories section="section4" />
          </div>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div className="mobilepanel">
          <div className="inner d-flex align-items-center">
            <VideoPanel src="/assets/videos/zumar-video.mp4" />
          </div>
        </div>
        <div className="mobilepanel ">
          <div className="inner text-center pt-5 mt-4">
            <Categories />
          </div>
        </div>
        <div className="mobilepanel">
          <div className="inner text-center pt-5 mt-4">
            <h1>{t("Essence of Arabia")}</h1>
            <p className="fs-5">{t("Step into")}</p>

            <Link href={`/${locale}/shop/dakhoon/bakhoor/bakhoor-ahmed-40-tabs`}>
              <img src="assets/images/home/demo8/Bakhoor-Ahmed.jpg" alt="" />
            </Link>
          </div>
        </div>
        <div className="mobilepanel d-flex justify-content-center">
          <div className="inner text-center pt-5 mt-4">
            <h1>Reaching Every Corner of the World</h1>
            <p className="fs-5">
              Ahmed Al Maghribi Perfumes proudly spans over 91 countries,
              sharing our luxurious fragrances with the world. With an
              unwavering commitment to craftsmanship and excellence, our
              signature scents are now available for global distribution,
              spreading the essence of timeless luxury and rich tradition to
              every corner of the globe.
            </p>

            <div className="row">
              <div className="col-6">
                <Link href={`/${locale}/export`}>
                  <img
                    src="assets/images/home/demo8/export/aqua-oud.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </Link>
              </div>
              <div className="col-6">
                <Link href={`/${locale}/export`}>
                  <img
                    src="assets/images/home/demo8/export/endless.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mobilepanel d-flex justify-content-center">
          <div className="inner text-center pt-5 mt-4">
            <div className="row"></div>
          </div>
        </div>
      </section>
      <div className="mb-4 pb-4 mb-xl-4 mt-xl-3 pt-xl-3 pb-xl-4"></div>

      <section className="testsect section4">
        <div className="panel2 position-relative d-flex justify-content-center">
          <img
            className="zoom_img"
            style={{ width: "100%" }}
            src="/assets/images/home/demo8/avif/production.avif"
            alt="Ethereal Essence"
          />
          <div className="text_reveal position-absolute zoom_img">
            <h2 className="text-center text-white h2">
              {t("Your Journey Begins with a Scent")}
            </h2>
            <p className="text-center text-white p">
              {t(
                "At Ahmed Al Maghribi Perfumes each fragrance tells your story Our luxurious scents evoke memories and emotions becoming a lasting part of who you are"
              )}
            </p>
          </div>
          <a
            href="#footer"
            className="d-block position-absolute start-50 translate-middle-x text_dash text-white text-uppercase fw-medium mb-5 text-nowrap"
            style={{ bottom: "0" }}
          >
            {t("Scroll To Discover More")}
          </a>
        </div>
      </section>

      {/* Company Information Section */}
      <section
        id="end"
        className="testsect container d-flex flex-column justify-content-center zoom_img"
      >
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mb-5 pt-5">
          <div className="order-1 order-md-0">
            <VideoPanel src="/assets/videos/production.mp4" />
          </div>
          <div className="col-lg-7 p-5 text-center order-3 order-md-1">
            <h3 className="mb-3">
              {t("Quality Crafted Through Expertise 20 plus Years of Mastery")}
            </h3>
            <p>
              {t(
                "For over 20 years Ahmed Al Maghribi Perfumes has been dedicated to creating luxurious timeless scents Using only the finest natural ingredients we ensure every fragrance is crafted with precision and excellence offering lasting quality"
              )}
            </p>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mt-5">
          <div className="col-lg-7 p-5 text-center order-1 order-md-0">
            <h3 className="mb-3">{t("The Company")}</h3>
            <p>{t("Steps")}</p>
          </div>
          <div className="order-0 order-md-1">
            <img
              className="h-auto w-100"
              src="/assets/images/home/demo8/Shop.jpg"
              alt="image"
            />
          </div>
        </div>
      </section>
      <div className="mb-4 pb-4 mb-xl-4 mt-xl-3 pt-xl-3 pb-xl-4 d-none d-lg-block"></div>
    </div>
  );
};

export default Animation;
