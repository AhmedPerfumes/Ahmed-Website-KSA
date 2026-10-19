"use client";

import { useState } from "react";

const RATING_LABELS = {
  1: "1 Star - Needs Improvement",
  2: "2 Stars - Fair Experience",
  3: "3 Stars - Good Experience",
  4: "4 Stars - Very Good!",
  5: "5 Stars - Excellent! Loved it ✨",
};

export default function FeedbackForm({ orderId = null, customerName = "Guest" }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const activeRating = hoverRating || rating;

  const handleStarClick = (star) => {
    setRating(star);
    setHoverRating(0);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating (1 to 5 stars) before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://adminksa.ahmedalmaghribi.com/public/").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/api/submitReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId || null,
          customer_name: customerName || "Guest",
          star: rating,
          comment: message.trim(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        try {
          const data = await response.json();
          setError(data.message || "Error submitting feedback. Please try again.");
        } catch {
          setError("Error submitting feedback. Please try again.");
        }
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success State
  if (submitted) {
    return (
      <div className="container my-4">
        <div
          className="mx-auto text-center p-4 p-md-5 rounded-4 shadow-sm"
          style={{
            maxWidth: "580px",
            background: "linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)",
            border: "1px solid #EAE5DC",
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "rgba(185, 161, 107, 0.15)",
              color: "#B9A16B",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4 className="fw-bold mb-2" style={{ color: "#222" }}>
            Thank You for Your Feedback!
          </h4>
          <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
            Your review helps us continuously elevate our fragrances and customer experience.
          </p>
          <div className="d-flex justify-content-center align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={star <= rating ? "#B9A16B" : "#E2DDD5"}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div
        className="card border-0 shadow-sm mx-auto overflow-hidden rounded-4"
        style={{
          maxWidth: "580px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EAE5DC",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Top Gold Accent Line */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #D4AF37 0%, #B9A16B 50%, #E5C07A 100%)",
          }}
        />

        <div className="card-body p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <span
              className="badge text-uppercase px-3 py-1 mb-2"
              style={{
                backgroundColor: "rgba(185, 161, 107, 0.12)",
                color: "#987e46",
                fontSize: "11px",
                letterSpacing: "1px",
                fontWeight: 600,
              }}
            >
              Order Feedback
            </span>
            <h4 className="fw-bold mb-1" style={{ color: "#222" }}>
              How Was Your Experience?
            </h4>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Your feedback helps us continuously improve our services.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div
              className="alert alert-danger py-2 px-3 text-center mb-3 rounded-3"
              style={{ fontSize: "13px" }}
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Star Rating Section */}
            <div
              className="text-center p-3 mb-4 rounded-3"
              style={{
                backgroundColor: "#FAF8F5",
                border: "1px solid #F0ECE4",
              }}
            >
              <label className="form-label d-block fw-semibold mb-2" style={{ color: "#333", fontSize: "14px" }}>
                Rate Your Experience <span style={{ color: "#B9A16B" }}>*</span>
              </label>

              {/* Interactive SVG Star Buttons */}
              <div
                className="d-flex justify-content-center align-items-center gap-1 my-1"
                role="radiogroup"
                aria-label="Star Rating"
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "6px 8px",
                        cursor: "pointer",
                        outline: "none",
                        transform: isFilled ? "scale(1.15)" : "scale(1)",
                        transition: "transform 0.15s ease",
                        touchAction: "manipulation",
                      }}
                    >
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill={isFilled ? "#B9A16B" : "#E2DDD5"}
                        stroke={isFilled ? "#A3874B" : "#D0C9BF"}
                        strokeWidth="1.2"
                        style={{
                          filter: isFilled
                            ? "drop-shadow(0 2px 4px rgba(185, 161, 107, 0.35))"
                            : "none",
                          transition: "fill 0.2s ease, stroke 0.2s ease",
                        }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Rating Label */}
              <div
                className="fw-medium mt-1"
                style={{
                  fontSize: "13px",
                  color: activeRating > 0 ? "#987e46" : "#888888",
                  minHeight: "20px",
                  transition: "color 0.2s ease",
                }}
              >
                {activeRating > 0 ? RATING_LABELS[activeRating] : "Tap a star to rate"}
              </div>
            </div>

            {/* Comments Textarea */}
            <div className="mb-4">
              <label
                htmlFor="feedbackMessage"
                className="form-label fw-semibold mb-2"
                style={{ color: "#444", fontSize: "13px" }}
              >
                Write your feedback or suggestions <span className="text-muted fw-normal">(Optional)</span>
              </label>
              <textarea
                className="form-control"
                id="feedbackMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Share your thoughts about your shopping experience or products..."
                style={{
                  fontSize: "14px",
                  borderColor: "#E2DDD5",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  boxShadow: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#B9A16B")}
                onBlur={(e) => (e.target.style.borderColor = "#E2DDD5")}
              />
            </div>

            {/* Submit Button */}
            <div className="d-flex flex-column align-items-center">
              <button
                type="submit"
                disabled={submitting}
                className="btn text-uppercase fw-semibold rounded-pill px-5 py-3 w-100"
                style={{
                  backgroundColor: "#B9A16B",
                  borderColor: "#B9A16B",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  letterSpacing: "0.8px",
                  boxShadow: "0 6px 18px rgba(185, 161, 107, 0.35)",
                  transition: "all 0.25s ease",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = "#987e46";
                    e.currentTarget.style.boxShadow = "0 8px 22px rgba(185, 161, 107, 0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = "#B9A16B";
                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(185, 161, 107, 0.35)";
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
