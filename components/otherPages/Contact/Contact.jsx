"use client";

import { storesLocations } from "@/data/storeLocations";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const router = useRouter();

  const formRef = useRef(null);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(formRef.current);
      const formValues = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      console.log("Form submitted:", formValues);

      // Clear the form fields by resetting the form using the ref
      formRef.current.reset(); // This will clear all form fields
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/contact`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit the data. Please try again.");
      }

      // Handle response if necessary
      const data = await response.json();
      if (data.message.split(" ")[0] != "Contact") {
        setError(data.message);
        setSuccess(null);
      } else {
        setSuccess(data.message);
        setError(null);
        // localStorage.setItem('token', data.access_token);
        // setTimeout(() => router.push('/contact'), 1000);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="contact-us">
      {/* Embedded Google Maps */}
      <div className="row">
        <div className="col-12">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d548912.0419635491!2d55.485115147598435!3d25.3351151799685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sAhmed%20Al%20Maghribi%20Perfumes!5e0!3m2!1sen!2sus!4v1723718972956!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center">
        {/* Contact Form and Information */}
        <div className="row">
          {/* Left Side - Form */}
          <div className="col-lg-6 mb-5">
            <div className="contact-us__form ">
              <form
                className="needs-validation mx-5"
                onSubmit={onSubmit}
                ref={formRef}
              >
                <h4 className="pt-5 fs-3">Drop us a Line</h4>
                <p className="fs-5">
                  Simply fill out the form, include your message, and we’ll get
                  back to you as soon as we can.
                </p>
                {error ? (
                  <div style={{ color: "red" }}>{error}</div>
                ) : (
                  <div style={{ color: "green" }}>{success}</div>
                )}
                <div className="form-floating my-4">
                  <input
                    type="text"
                    name="name"
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
                    name="email"
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
                    name="subject"
                    className="form-control"
                    id="contact_us_subject"
                    placeholder="Subject *"
                    required
                  />
                  <label htmlFor="contact_us_subject">Subject *</label>
                </div>
                <div className="my-4">
                  <textarea
                    name="message"
                    className="form-control form-control_gray"
                    placeholder="Your Message"
                    cols="30"
                    rows="8"
                    required
                  ></textarea>
                </div>
                <div className="my-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Contact Information and Office Timing */}
          <div className="col-lg-6 ">
            <h4 className="pt-5 mb-4 fs-3">Contact Information</h4>
            <p className="mb-2 fs-5">
              Address: Ahmed Al Maghrebi Perfume Manuf L.L.C, Jurf Industrial
              Zone 3, AJMAN, P. O. Box – 3850, U.A.E
            </p>
            <p className="mb-2 fs-5">Email: info@ahmedalmaghribi.com</p>
            <p className="mb-2 fs-5">
              Phone: +971 67420602 / 67422496 / 67446076
            </p>

            <h4 className="pt-4 mb-2 fs-3">Head Office Timing</h4>
            <p className="mb-2 fs-5">Monday – Saturday: 8:00 AM to 5:00 PM</p>
            <p className="fs-5">Sunday: Closed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
