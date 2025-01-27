import React from "react";
import Link from "next/link";
import Image from "next/image";
import BannerLinks from "./BannerLinks";

export default function Banner5({ image }) {
  return (
    <section className="full-width_padding ">
      <div className="container-fluid" style={{ borderColor: "#eeeeee" }}>
        <div
          className="shop-banner position-relative"
          style={{ minHeight: "37rem" }}
        >
          <div
            className="background-img"
            style={{ backgroundColor: "#eeeeee" }}
          >
            <Image
              loading="lazy"
              src={`${process.env.NEXT_PUBLIC_API_URL}storage/${image}`}
              width="1920"
              height="1000"
              alt="Pattern"
              className="slideshow-bg__img object-fit-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
