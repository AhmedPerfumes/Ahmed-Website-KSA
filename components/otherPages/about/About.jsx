import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations();
  return (
    <section className="about-us">
      {/* Hero Image */}
      <div className="container-fluid p-0">
        <Image
          loading="lazy"
          className="w-100 h-auto d-block"
          src="/assets/images/about/corporate-banner.jpg"
          alt="image"
          width={1500}
          height={550}
        />
      </div>

      {/* Main Content */}
      <div className="container mt-5 pt-5">
        {/* <div className="mw-930">
          <h2 className="page-title text-center pt-4 fw-lighter">
            OUR ARABIC PERFUMES: INSPIRED BY TRADITIONS, MADE BY HANDS
          </h2>
          <p className="fs-5 text-center">
            For more than 20 years, Ahmed Al Maghribi Perfumes is a brand that
            has continued to encapsulate the Arabic cultural heritage in the
            finest collection of Arabic perfumes. In today’s era of
            technological innovation, our brand sets itself apart by keeping the
            traditional Arabic perfume making process alive – purely made by
            hands, using the highest quality and all natural ingredients. OVER
            THE YEARS, WE HAVE CONTINUED TO PERSEVERE TO MAKE THE BEST ARABIC
            PERFUMES IN DUBAI We have crafted a first-class selection of
            perfumes, including Dehn Al Oud, Arabian oud, Eau De Parfum, and
            exclusive perfumes for women and men. Our collection offers you a
            diverse array of scents, from delightful and charming, sensational
            and sophisticated, to earthy and spicy fragrances. Made from
            carefully selected raw materials, each of our original products
            produces a lingering scent that rejuvenates the mind and body while
            soothing the senses. Also part of our product line is a selection of
            Bakhoor home fragrances with complementary oils for creating a cozy,
            relaxing and aromatic ambience within your home. Welcome your family
            and friends into a refreshing and fragrant home, with one of our
            signature Bakhoor fragrances.
          </p>
        </div> */}

        <div className="row align-items-center pt-5 pb-5">
          {/* Left Side - Image */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="embed-responsive embed-responsive-16by9">
              <video
                className="embed-responsive-item"
                src="/assets/images/about/production.mp4" // Replace with your video URL
                autoPlay
                loop
                muted
                width="100%"
                height="auto"
              ></video>
            </div>
          </div>

          {/* Right Side - Text */}
          <div className="col-lg-6 text-center text-lg-start">
            <h4 className="fs-2">
              {t("Celebrating 20 Years of Fragrant Excellence")}
            </h4>
            <p className="fs-5">
              {t(
                "Founded by Mr Kafeel Ahmed in 2000 Ahmed Al Maghribi Perfumes is a beacon of tradition and quality in the realm of Arabic fragrances Our journey is deeply rooted in respect for our cultural heritage dedicated to crafting scents that capture the essence of our region with the finest globally sourced ingredients"
              )}
            </p>
            <p className="mt-3 fs-5">
              {t(
                "With over 180 branches across the GCC and a growing international presence we have evolved the art of perfumery While honoring traditional Arabic techniques our innovative blends cater to diverse tastes ensuring each fragrance delivers a rich lasting experience"
              )}
            </p>
            <p className="mt-3 fs-5">
              {t(
                "Our mission remains unwavering to create high quality perfumes that resonate with individuality At Ahmed Al Maghribi Perfumes we invite you to explore our luxurious collection and find the perfect scent that truly reflects who you are"
              )}
            </p>
          </div>
        </div>

        <div className="row align-items-center pt-5">
          {/* Left Side - Text */}
          <div className="col-lg-6 mb-lg-0 text-center text-lg-start">
            <h4 className="fs-2">{t("The Visionary Behind the Fragrance")}</h4>
            <p className="fs-5">
              {t(
                "Mr Kafeel Ahmed born and raised in the vibrant city of Mumbai has always possessed a deep seated passion for creation and innovation Despite initially being distant from the realms of luxury and fragrance his fascination with crafting unique experiences drew him into the captivating world of perfumery In 2000 he founded Ahmed Al Maghribi Perfumes starting with a humble home based factory and a single retail outlet Through relentless determination and the steadfast support of his dedicated team he navigated challenges to establish a brand that has become synonymous with luxury fragrances earning recognition across the GCC and beyond"
              )}
            </p>
            {/* <p className="mt-3 fs-5">
              In order to conserve the traditional feel in our fragrances, all
              of our perfumes are handmade. Machines are hardly part of our
              creation process. We do not believe in modernizing the way in
              which perfumes are created, as for us culture and tradition are of
              great value and importance. This is how our perfumes distinguish
              themselves from the mass-produced ones available in the market
              today.
            </p> */}
          </div>

          {/* Right Side - Video */}
          <div className="col-lg-6 text-center">
            <div className="embed-responsive embed-responsive-16by9">
              <video
                className="embed-responsive-item"
                src="/assets/images/about/shop.mp4" // Replace with your video URL
                autoPlay
                loop
                muted
                width="100%"
                height="auto"
              ></video>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <section className="image-section py-5 pt-5">
          <div className="container-fluid p-0 pt-5">
            <div className="row justify-content-center align-items-center">
              {/* Image 1 */}
              <div className="col-md-4 text-center mb-4 mb-md-0">
                <div
                  className="d-flex justify-content-center align-items-center mx-auto"
                  style={{ width: "150px", height: "150px" }}
                >
                  <Image
                    src="/assets/images/about/icon1.png"
                    alt="Sample Image 1"
                    width={300}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <h4 className="fw-bold mt-3">Fragrance</h4>
                <p className="text-muted">
                  Made from carefully selected raw materials
                </p>
              </div>

              {/* Image 2 */}
              <div className="col-md-4 text-center mb-4 mb-md-0">
                <div
                  className="d-flex justify-content-center align-items-center mx-auto"
                  style={{ width: "150px", height: "150px" }}
                >
                  <Image
                    src="/assets/images/about/icon2.png"
                    alt="Sample Image 2"
                    width={300}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <h4 className="fw-bold mt-3">Quality</h4>
                <p className="text-muted">
                  Over the years, we have continued to persevere to make the
                  best Arabic perfumes in Dubai
                </p>
              </div>

              {/* Image 3 */}
              <div className="col-md-4 text-center">
                <div
                  className="d-flex justify-content-center align-items-center mx-auto"
                  style={{ width: "150px", height: "150px" }}
                >
                  <Image
                    src="/assets/images/about/icon3.png"
                    alt="Sample Image 3"
                    width={300}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <h4 className="fw-bold mt-3">Natural</h4>
                <p className="text-muted">
                  Products made by hands, using the highest quality and all
                  natural ingredients
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Footer Section */}
      {/* <section className="testsect d-sm-block d-md-none bg-dark pt-5">
            <div className="MobileFooter"></div>
          </section> */}
    </section>
  );
}
