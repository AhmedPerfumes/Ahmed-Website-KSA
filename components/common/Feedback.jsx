"use client";

import { useState } from "react";

export default function FeedbackForm({ orderId, customerName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/submitReview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            customer_name: customerName,
            star: rating,
            comment: message,
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert("Error submitting feedback: " + (error.message || "Server error."));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-success">
          Thank you for rating your website experience!
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: "600px" }}
      >
        <div className="card-body text-center">
          {/* Title */}
          <h4 className="section-paragraph mb-2">
            Rate Your Website Experience
          </h4>

          {/* Subtitle */}
          <p className="text-muted mb-4">
            This feedback is about your experience using our website —
            not the product itself.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-4">
              <p className="fw-semibold mb-2">
                How was your experience using our website?
              </p>

              <div className="d-flex justify-content-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: "2.2rem",
                      color:
                        star <= (hoverRating || rating)
                          ? "#ffc107"
                          : "#e4e5e9",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      marginRight: "6px",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <h5 className="section-paragraph mb-2">
                Tell us about your experience using our website
              </h5>

              <textarea
                className="form-control"
                id="feedbackMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Example: Was the website easy to use? Was checkout smooth?"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-center">
              <button
                type="submit"
                className="btn-rounded btn-link_lg text-uppercase fw-medium"
                disabled={submitting || rating === 0 || !message.trim()}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}