"use client";

import Image from "next/image";
import Link from "next/link";
import { HorizontalRule } from "@mui/icons-material";
import { useLocale, useTranslations } from "next-intl";

const productSlider = ({ prodSlide }) => {
    const locale = useLocale();
    const t = useTranslations();
    if (prodSlide == "bestSellers") {
        return (
            <div
                className="swiper swiper-initialized swiper-horizontal slider-artist swiper-backface-hidden mySwiper"
                data-v-8967c2b9=""
            >
                <div className="swiper-wrapper">
                    {/* First slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="0"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/zumar@1x.jpg 1x, /assets/images/best-sellers/notes/zumar@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/zumar@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Zumar")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "Crafted for those who embrace elegance"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/zumar@1x.jpg 1x, /assets/images/best-sellers/zumar@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/zumar@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/oriental-fragrance/zumar`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/zumar@1x.jpg 1x, /assets/images/best-sellers/notes/zumar@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/zumar@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/zumar@1x.jpg 1x, /assets/images/best-sellers/zumar@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/zumar.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Zumar")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t(
                                        "Crafted for those who embrace elegance"
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/oriental-fragrance/zumar`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* First slider */}

                    {/* Second slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="1"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/binshaikh@1x.jpg 1x, /assets/images/best-sellers/notes/binshaikh@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/binshaikh@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Bin Shaikh")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "concocted in royalty and lavishness"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/bin-shaikh@1x.jpg 1x, /assets/images/best-sellers/bin-shaikh@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/bin-shaikh@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/binshaikh@1x.jpg 1x, /assets/images/best-sellers/notes/binshaikh@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/binshaikh@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/bin-shaikh@1x.jpg 1x, /assets/images/best-sellers/bin-shaikh@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/bin-shaikh@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Bin Shaikh")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t("concocted in royalty and lavishness")}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Second slider */}

                    {/* Third slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="2"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/notes/ignite-oud@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/ignite-oud@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Ignite Oud")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "fragrance that sets your senses ablaze"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/ignite-oud@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/ignite-oud@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/occidental-fragrance/ignite-oud`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/notes/ignite-oud@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/ignite-oud@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/ignite-oud@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/ignite-oud@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Ignite Oud")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t(
                                        "fragrance that sets your senses ablaze"
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/occidental-fragrance/ignite-oud`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Third slider */}

                    {/* Fourth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="3"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/marj@1x.jpg 1x, /assets/images/best-sellers/notes/marj@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/marj@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Marj")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "The Sense of Sheer Elegance and Affection"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/marj@1x.jpg 1x, /assets/images/best-sellers/marj@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/marj@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/oriental-fragrance/marj`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/marj@1x.jpg 1x, /assets/images/best-sellers/notes/marj@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/marj@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/marj@1x.jpg 1x, /assets/images/best-sellers/marj@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/marj@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Marj")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t(
                                        "The Sense of Sheer Elegance and Affection"
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/oriental-fragrance/marj`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Fourth slider */}

                    {/* Fifth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="4"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/oud-and-rose@1x.jpg 1x, /assets/images/best-sellers/notes/oud-and-rose@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/oud-and-rose@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Oud & Roses")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "like a lush garden awakened in spring"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/oud-and-roses@1x.jpg 1x, /assets/images/best-sellers/oud-and-roses@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/oud-and-roses@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/occidental-fragrance/oud-roses`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/oud-and-rose@1x.jpg 1x, /assets/images/best-sellers/notes/oud-and-rose@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/oud-and-rose@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/oud-and-roses@1x.jpg 1x, /assets/images/best-sellers/oud-and-roses@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/oud-and-roses@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Oud & Roses")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t("like a lush garden awakened in spring")}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/occidental-fragrance/oud-roses`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Fifth slider */}

                    {/* Sixth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="5"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            className="container-desktop d-none d-md-block"
                            data-v-8967c2b9=""
                        >
                            <div
                                className="container-desktop"
                                data-v-8967c2b9=""
                            >
                                <div className="col-left" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/notes/kaaf@1x.jpg 1x, /assets/images/best-sellers/notes/kaaf@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/notes/kaaf@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <div
                                        className="container-artist flex__column__left"
                                        data-v-8967c2b9=""
                                    >
                                        <div
                                            className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                            data-v-8967c2b9=""
                                        >
                                            {t("Kaaf")}
                                        </div>
                                        <div
                                            class="t-subtitle"
                                            data-v-8967c2b9=""
                                        >
                                            {t(
                                                "a secret charm that is enticing to the senses"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-right" data-v-8967c2b9="">
                                    <img
                                        className="img-classic loading-background"
                                        srcSet="/assets/images/best-sellers/kaaf@1x.jpg 1x, /assets/images/best-sellers/kaaf@2x.jpg 2x"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/best-sellers/kaaf@2x.jpg"
                                        alt=""
                                        loading="lazy"
                                        data-v-8967c2b9=""
                                        data-v-399c522e=""
                                    />
                                    <Link
                                        href={`${locale}/shop/perfumes/oriental-fragrance/kaaf`}
                                    >
                                        <button
                                            className="btn-classic"
                                            data-v-8967c2b9=""
                                            data-v-7aa9e1a2=""
                                        >
                                            <span data-v-7aa9e1a2="">
                                                {t("Discover")}
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/kaaf@1x.jpg 1x, /assets/images/best-sellers/notes/kaaf@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/kaaf@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/kaaf@1x.jpg 1x, /assets/images/best-sellers/kaaf@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/kaaf@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Kaaf")}
                                </div>
                                <div
                                    class="t-subtitle mb-3 text-center"
                                    data-v-8967c2b9=""
                                >
                                    {t(
                                        "a secret charm that is enticing to the senses"
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`${locale}/shop/perfumes/oriental-fragrance/kaaf`}
                            >
                                <button
                                    data-v-7aa9e1a2=""
                                    data-v-8967c2b9=""
                                    className="btn-classic"
                                >
                                    <span data-v-7aa9e1a2="">{t("Discover")}</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Sixth slider */}
                </div>

                {/* Navigation buttons */}
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
                {/* Pagination Bullets */}
            </div>
        );
    } else {
        return (
            /* Mobile Horizontal Section Slide */
            <div
                className="swiper swiper-initialized swiper-horizontal slider-artist swiper-backface-hidden mySwiper"
                data-v-8967c2b9=""
            >
                <div className="swiper-wrapper">
                    {/* Mobile Horizontal First slider */}

                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="0"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <Link
                                href={`/${locale}/shop/dakhoon/oud-maattar/oud-mtr-asaateen`}
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="container-images"
                                >
                                    <img
                                        data-v-399c522e=""
                                        data-v-8967c2b9=""
                                        className="img-classic img-artist"
                                        srcSet="/assets/images/dakhoon/oud-mtr/maria-horizontal.jpg"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/dakhoon/oud-mtr/maria-horizontal.jpg"
                                        alt=""
                                        loading="lazy"
                                    />
                                    <img
                                        data-v-399c522e=""
                                        data-v-8967c2b9=""
                                        className="img-classic img-fragrance"
                                        srcSet="/assets/images/dakhoon/oud-mtr/maria-1080.jpg"
                                        sizes="(min-width: 768px) 1040w"
                                        src="/assets/images/dakhoon/oud-mtr/maria-1080.jpg"
                                        alt=""
                                        loading="lazy"
                                    />
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="container-artist flex__column__left"
                                >
                                    <div
                                        data-v-8967c2b9=""
                                        className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                    >
                                        {t("Maria Oud Mubakhar")}
                                    </div>
                                    <div
                                        data-v-8967c2b9=""
                                        className="t__sub-title t__color-blue"
                                    ></div>
                                </div>
                            </Link>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://www.ahmed-perfume.com/en/shop?q=maria-oud"
                                    )
                                }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>

                    {/* First slider */}

                    {/* Second slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="1"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/binshaikh@1x.jpg 1x, /assets/images/best-sellers/notes/binshaikh@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/binshaikh@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/bin-shaikh@1x.jpg 1x, /assets/images/best-sellers/bin-shaikh@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/bin-shaikh@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Bin Shaikh")}
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="t__sub-title t__color-blue"
                                ></div>
                            </div>
                            <button
                                // onClick={() =>
                                //     window.open(
                                //         "https://www.ahmed-perfume.com/en/shop/perfumes/oriental-fragrance/bin-shaikh"
                                //     )
                                // }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Second slider */}

                    {/* Third slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="2"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/notes/ignite-oud@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/ignite-oud@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/ignite-oud@1x.jpg 1x, /assets/images/best-sellers/ignite-oud@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/ignite-oud@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Ignite Oud")}
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="t__sub-title t__color-blue"
                                ></div>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://www.ahmed-perfume.com/en/shop/perfumes/occidental-fragrance/ignite-oud"
                                    )
                                }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Third slider */}

                    {/* Fourth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="3"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/marj@1x.jpg 1x, /assets/images/best-sellers/notes/marj@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/marj@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/marj@1x.jpg 1x, /assets/images/best-sellers/marj@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/marj@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Marj")}
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="t__sub-title t__color-blue"
                                >
                                    {/* as painted by Zoé Rumeau */}
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://www.ahmed-perfume.com/en/shop/perfumes/oriental-fragrance/marj"
                                    )
                                }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Fourth slider */}

                    {/* Fifth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="4"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/oud-and-rose@1x.jpg 1x, /assets/images/best-sellers/notes/oud-and-rose@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/oud-and-rose@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/oud-and-roses@1x.jpg 1x, /assets/images/best-sellers/oud-and-roses@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/oud-and-roses@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Oud & Roses")}
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="t__sub-title t__color-blue"
                                >
                                    {/* Sculptured by Victoire de Lencquesaing */}
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://www.ahmed-perfume.com/en/shop/perfumes/occidental-fragrance/oud-roses"
                                    )
                                }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Fifth slider */}

                    {/* Sixth slider */}
                    <div
                        className="swiper-slide slide"
                        data-swiper-slide-index="5"
                        data-v-8967c2b9=""
                        style={{ width: "752px", marginRight: "10px" }}
                    >
                        <div
                            data-v-8967c2b9=""
                            className="container-mobile d-sm-block d-md-none"
                        >
                            <div
                                data-v-8967c2b9=""
                                className="container-images"
                            >
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-artist"
                                    srcSet="/assets/images/best-sellers/notes/kaaf@1x.jpg 1x, /assets/images/best-sellers/notes/kaaf@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/notes/kaaf@2x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                                <img
                                    data-v-399c522e=""
                                    data-v-8967c2b9=""
                                    className="img-classic img-fragrance"
                                    srcSet="/assets/images/best-sellers/kaaf@1x.jpg 1x, /assets/images/best-sellers/kaaf@2x.jpg 2x"
                                    sizes="(min-width: 768px) 1040w"
                                    src="/assets/images/best-sellers/kaaf@1x.jpg"
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                            <div
                                data-v-8967c2b9=""
                                className="container-artist flex__column__left"
                            >
                                <div
                                    data-v-8967c2b9=""
                                    className="t__h4 t__color-primary t__capitalize fs-2 font-weight-bold"
                                >
                                    {t("Kaaf")}
                                </div>
                                <div
                                    data-v-8967c2b9=""
                                    className="t__sub-title t__color-blue"
                                >
                                    {/* Imagined by François Azambourg */}
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://www.ahmed-perfume.com/en/shop/perfumes/oriental-fragrance/kaaf"
                                    )
                                }
                                data-v-7aa9e1a2=""
                                data-v-8967c2b9=""
                                className="btn-classic"
                            >
                                <span data-v-7aa9e1a2="">{t("Discover")}</span>
                            </button>
                        </div>
                    </div>
                    {/* Sixth slider */}
                </div>

                {/* Navigation buttons */}
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
                {/* Pagination Bullets */}
            </div>
        );
    }
};
export default productSlider;