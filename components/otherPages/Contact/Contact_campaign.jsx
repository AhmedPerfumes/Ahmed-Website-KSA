"use client";

import { storesLocations } from "@/data/storeLocations";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Contact_campaign() {
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
        `${process.env.NEXT_PUBLIC_API_URL}api/campaign`,
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
    <section className="contact-us py-5">
    <div className="container d-flex justify-content-center">
      <div className="row w-100">
        {/* Left Side - Form */}
        <div className="col-lg-6 mx-auto">
          <div className="card shadow border-0">
            <div className="card-body p-5">
              <h4 className="pb-3 text-center">Simply Fill out the form</h4>
              <p className="fs-6 text-muted text-center">
                Include your message 
              </p>
              {error ? (
                <div className="alert alert-danger text-center">{error}</div>
              ) : (
                success && <div className="alert alert-success text-center">{success}</div>
              )}
              <form
                className="needs-validation"
                onSubmit={onSubmit}
                ref={formRef}
              >
                <div className="form-floating mb-3">
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
                <div className="form-floating mb-3">
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
                
                <div className="form-floating mb-3">
                  <textarea
                    name="message"
                    className="form-control"
                    placeholder="Your Message"
                    id="contact_us_message"
                    cols="30"
                    rows="5"
                    style={{ height: "150px" }}
                    required
                  ></textarea>
                  <label htmlFor="contact_us_message">What makes your father special *</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    name="subject"
                    className="form-control"
                    id="contact_us_subject"
                    placeholder="Subject *"
                    required
                  />
                  <label htmlFor="contact_us_subject">Dedicated a Perfume*</label>
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Enter Draw"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  );
}
