import TopDeals from "@/components/homes/home-11/TopDeals";
import Categories from "@/components/homes/home-5/Categories";
import TopCollections from "@/components/homes/home-5/TopCollections";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

export default function Export() {
  const t = useTranslations();
  return (
    <>
      <div className="container-fluid p-0 pt-2">
        <Image
          loading="lazy"
          className="w-100 h-auto d-none d-lg-block"
          src="/assets/images/export/map-banner-desk.jpg"
          alt="image"
          width={1500}
          height={550}
        />
      </div>
      <div className="">
        <Image
          loading="lazy"
          className="w-100 h-auto d-lg-none pt-5"
          src="/assets/images/export/map-banner-mob.jpg"
          alt="image"
          width={500}
          height={500}
        />
      </div>
      <div className="container pt-5 mt-2">
        <div className="section2 text-center">
          <h3 className="text-uppercase fs-2 mb-5">
            Ahmed Al Maghribi Exports
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
              {t("Global Reach of Ahmed Al Maghribi Perfumes")}
            </h4>
            <p className="mt-3 fs-6">
              {t(
                "At Ahmed Al Maghribi Perfumes our passion for excellence knows no borders Our International Exports Division with over a decade of expertise proudly serves more than 91 countries Our carefully crafted fragrances renowned for their unmatched quality captivate both distributors and consumers worldwide"
              )}
            </p>
            <p className="mt-3 fs-6">
              {t(
                "We have partnered with leading retail chains and independent perfumery stores ensuring our signature scents reach every corner of the globe From strategic growth to evolving product offerings we are dedicated to bringing the essence of luxury to a global audience"
              )}
            </p>
          </div>
        </div>
      </div>
      <TopCollections />

      {/* <div className="container d-flex justify-content-center">
  <video
    className="w-75 w-md-50 w-lg-25"
    src="https://www.ahmedalmaghribi.com/wp-content/uploads/2024/07/Ahmed-Perfume-Street-View.mp4"
    autoPlay
    loop
    muted
  ></video>
</div> */}

      <div className="container d-flex justify-content-center pt-5">
        <div className="contact-us__form ">
          <h3 className="text-center fs-2 text-uppercase">
            For Distributor's Enquiries
          </h3>
          <form className="needs-validation mx-5">
            <h4 className="pt-5 fs-3">Drop us a Line</h4>
            <p className="fs-5">
              Simply fill out the form, include your message, and we’ll get back
              to you as soon as we can.
            </p>
            <div className="form-floating my-4">
              <input
                type="text"
                className="form-control"
                id="contact_us_name"
                placeholder="Name *"
                required
              />
              <label htmlFor="contact_us_name">Name *</label>
            </div>
            <div className="form-floating my-4">
              <input
                type="email"
                className="form-control"
                id="contact_us_email"
                placeholder="Email address *"
                required
              />
              <label htmlFor="contact_us_email">Email address *</label>
            </div>
            <div className="form-floating my-4">
              <input
                type="text"
                className="form-control"
                id="contact_us_subject"
                placeholder="Subject *"
                required
              />
              <label htmlFor="contact_us_subject">Subject *</label>
            </div>
            <div className="my-4">
              <textarea
                className="form-control form-control_gray"
                placeholder="Your Message"
                cols="30"
                rows="8"
                required
              ></textarea>
            </div>
            <div className="my-4">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
