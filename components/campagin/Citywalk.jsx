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
import Products from "../homes/home-2/Products";
import TopCollections from "../homes/home-5/TopCollections";
import DiscountedProductsSlider from "../common/features/DiscountedProductsSlider";
import DiscountGrid from "../common/features/DiscountGrid";


function CityWalk() {
    const locale = useLocale();
    const t = useTranslations();
    return (
        <>
            {/* Hero Section */}
            <div>
            <div className="container-fluid p-0 pt-2">
                <Link href={`/${locale}/shop`}>
                    <Image
                        loading="lazy"
                        className="w-100 h-auto d-none d-lg-block"
                        src="/assets/images/campaigns/Saudi_Eos.jpg"
                        alt="Father's Day Web"
                        width={1500}
                        height={550}
                    />
                </Link>
            </div>
            <div className="container-fluid p-0 pt-2">
                <Link href={`/${locale}/shop`}>
                    <Image
                        loading="lazy"
                        className="w-100 h-auto d-lg-none"
                        src="/assets/images/campaigns/Saudi_Mob.jpg"
                        alt="Father's Day Mobile"
                        width={1500}
                        height={550}
                    />
                </Link>
            </div>
        </div>
        <div className="pt-3 mt-3">

        {/* <DiscountedProductsSlider title="Summer Vibes, Cooler Prices!" onlyDiscounted={true}/> */}
        {/* <DiscountedProductsSlider title="Celebrate 95 Years with 95 SAR Deals!" onlyDiscounted={true}/> */}
        <DiscountGrid title="Celebrate End of Season Deals!" onlyDiscounted={true} />
        </div>
        {/* <section className="d-flex section-3 justify-content-center">
  <div className="section-content text-center w-100">
    <div className="section-head pt-5 pb-5 text-uppercase">
      <h2 className="text-center">
        <span className="d-block h3 h3-sm h2-md">
          Capture Summer’s Essence:
        </span>
        <span className="d-block text-uppercase h3 h3-sm h3-md">
          Perfumes That Shine
        </span>
      </h2>
    </div>

    <div className="d-flex flex-column align-items-center">

      <div className="d-none d-md-block pb-3 w-100 d-flex justify-content-center">
        <div className="videoarea">
          <VideoPanel src="/assets/videos/SummerVideo.mp4" section="" />
        </div>
      </div>


      <div className="d-block d-sm-none pb-3 w-100 d-flex justify-content-center">
        <div className="videoarea">
          <VideoPanel src="/assets/videos/SummerMob.mp4" section="hundred" />
        </div>
      </div>


      <a
        className="btn-link btn-link_lg default-underline text-uppercase fw-medium mt-3"
        href={`/${locale}/shop`}
      >
        Shop Now
      </a>
    </div>
  </div>
</section> */}

            {/* <DiscountedProductsGrid onlyDiscounted={true} /> */}

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

{/* Summer vibes commented out */}
            {/* <div className="container pt-5 mt-5">
                <div className="row align-items-center">
                    <div className="col-md-6 order-1 order-md-2 mb-4 mb-md-0">
                        <Image
                            width={0}
                            height={0}
                            sizes="100%"
                            className="img-fluid"
                            src="/assets/images/campaigns/oud roses.jpg"
                            alt="Wedding products display"
                            loading="lazy"
                            style={{ width: "100%", height: "auto" }}
                            aria-label="Wedding products"
                        />
                    </div>
                    <div className="col-md-6 text-center px-md-5 mb-2 order-2 order-md-1">
                        <p className="fs-2 text-uppercase font-weight-bold mb-3">
                        Oud & Roses
                        </p>
                        <p className="fs-6 mb-3">
                        A timeless fusion of elegance and depth, Oud & Roses opens with a luminous bouquet of Turkish rose, lavender, and peony kissed by fresh lemon. At its heart, soft sandalwood and white florals entwine with a whisper of frankincense, leading to a rich, musky base of agarwood, amber, and oak moss. A truly captivating scent that lingers with sensual warmth.
                            </p>
                        <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                            href={`/${locale}/shop/perfumes/occidental-fragrance/oud-roses`}
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6 order-1 order-md-1 mb-4 mb-md-0">
                        <Image
                            width={0}
                            height={0}
                            sizes="100%"
                            className="img-fluid"
                            src="/assets/images/campaigns/ignite rose.jpg"
                            alt="Aazz-O-Azeez Gift Set"
                            loading="lazy"
                            style={{ width: "100%", height: "auto" }}
                            aria-label="Aazz-O-Azeez Gift Set"
                        />
                    </div>

                    <div className="col-md-6 text-center px-md-5 mb-2 order-2 order-md-2">
                        <p className="fs-2 text-uppercase font-weight-bold mb-3">
                        Ignite Rose
                        </p>
                        <p className="fs-6 mb-3">
                        Ignite Rose is more than a fragrance; it’s an invitation to experience a moment of pure indulgence, where every spray transports you to a world of luxury and timeless beauty
                        </p>
                        <a
                            className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                            href={`/${locale}/shop/perfumes/occidental-fragrance/ignite-rose`}
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>
            
           

            <section className="d-flex flex-column align-items-center pt-5">
                            <span className="t-subtitle text-uppercase fs-4 text-center">
                                {"Scent of Summer: Fresh & Vibrant Perfumes"}
                            </span>
                            <div className="d-flex flex-row align-items-center ">
                                <div className="mt-4 mb-5 d-none d-md-block">
                                    <a
                                        href={`/${locale}/shop/perfumes/oriental-fragrance/marj`}
                                    >
                                        <Image
                                            loading="lazy"
                                            src="/assets/images/campaigns/marj.jpg"
                                            width="600"
                                            height="600"
                                            alt="Aazz-o-Azzeez"
                                            className="px-1"
                                            style={{ objectFit: "contain" }}
                                        />
                                    </a>
                                    <div className="d-flex justify-content-center pt-3">
                                        <Link
                                            href={`/${locale}/shop/perfumes/oriental-fragrance/marj`}
                                            className="btn-rounded btn-link_lg text-uppercase fw-medium "
                                        >
                                            {t("Shop Now")}
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-4 mb-5 d-none d-md-block">
                                    <a
                                        href={`/${locale}/shop/perfumes/occidental-fragrance/oud-lavender`}
                                    >
                                        <Image
                                            className="px-1"
                                            src="/assets/images/campaigns/lavender.jpg"
                                            width="600"
                                            height="600"
                                            alt="Antee"
                                            style={{ objectFit: "contain" }}
                                        />
                                    </a>
                                    <div className="d-flex justify-content-center pt-3">
                                        <Link
                                            href={`/${locale}/shop/perfumes/occidental-fragrance/oud-lavender`}
                                            className="btn-rounded btn-link_lg text-uppercase fw-medium "
                                        >
                                            {t("Shop Now")}
                                        </Link>
                                    </div>
                                </div>
                            </div>
            
                            <div className="mt-4 mb-5 d-block d-sm-none d-flex flex-column">
                            <a
                                        href={`/${locale}/shop/perfumes/oriental-fragrance/marj`}
                                    >
                                        <Image
                                            loading="lazy"
                                            src="/assets/images/campaigns/marj.jpg"
                                            width="600"
                                            height="600"
                                            alt="Aazz-o-Azzeez"
                                            className="px-1"
                                            style={{ objectFit: "contain" }}
                                        />
                                    </a>
                                <div className="d-flex justify-content-center pt-3">
                                    
                                <Link
                                            href={`/${locale}/shop/perfumes/oriental-fragrance/marj`}
                                            className="btn-rounded btn-link_lg text-uppercase fw-medium "
                                        >
                                            {t("Shop Now")}
                                        </Link>
                                </div>
                                <a href={`/${locale}/shop/perfumes/occidental-fragrance/oud-lavender`}>
                                    <Image
                                        className="w-100 h-100 px-1"
                                        src="/assets/images/campaigns/lavender.jpg"
                                        width="600"
                                        height="600"
                                        alt="Oud-Asateen"
                                        style={{ paddingTop: "1rem", objectFit: "contain" }}
                                    />
                                </a>
                                <div className="d-flex justify-content-center pt-3">
                                    <Link
                                        href={`/${locale}/shop/perfumes/occidental-fragrance/oud-lavender`}
                                        className="btn-rounded btn-link_lg text-uppercase fw-medium "
                                    >
                                        {t("Shop Now")}
                                    </Link>
                                </div>
                            </div>
                        </section> */}
{/* Summer vibes commented out */}


                        {/* <TopCollections
  categoryId={8}
  category={"perfumes"}
  sub_category={"occidental"}
  title={"Indulge in the Rich Aroma of Bakhoor"}
  onlyDiscounted={true}
/> */}
                        

            {/* <Contact_campaign/> */}
        </>
    );
}

export default CityWalk;
