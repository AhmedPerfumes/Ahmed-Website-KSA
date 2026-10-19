"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiX, FiStar, FiUser, FiMessageCircle } from "react-icons/fi";
import { getCountryFlagUrl } from "./utils";
import "./storelocator.scss";

const STAR_MAP = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function parseStarRating(rating) {
  if (typeof rating === "number") return rating;
  if (!rating) return 5;
  return STAR_MAP[rating.toUpperCase()] || parseInt(rating, 10) || 5;
}

export default function StoreReviewsModal({ store, isOpen, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local cache to avoid re-fetching the same store's reviews in the same session
  const [cache, setCache] = useState({});

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch reviews for store
  useEffect(() => {
    if (!isOpen || !store?.locationName) return;

    const loc = store.locationName;
    if (cache[loc]) {
      setReviews(cache[loc]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/store-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationName: loc, location: loc }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const revs = data?.result?.reviews || [];
        setReviews(revs);
        setCache((prev) => ({ ...prev, [loc]: revs }));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load store reviews:", err);
        setError("Unable to load reviews at this moment.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, store?.locationName]);

  if (!isOpen || !store) return null;

  const avgRating = store.averageRating > 0 ? Number(store.averageRating).toFixed(1) : "5.0";
  const count = store.totalReviewCount || reviews.length || 0;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Minimal Header with tight, balanced whitespace */}
        <div className="reviews-modal-header">
          <div className="reviews-modal-title-wrap">
            <div className="reviews-modal-title-row">
              <h5 className="reviews-modal-title">{store.storeCode || store.title}</h5>
              {store.countryCode && (
                <span className="reviews-modal-country-tag d-inline-flex align-items-center gap-1">
                  {getCountryFlagUrl(store.countryCode) && (
                    <Image
                      src={getCountryFlagUrl(store.countryCode)}
                      alt={store.countryCode}
                      width={13}
                      height={9}
                      className="rounded-1"
                      style={{ objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <span>{store.countryCode.toUpperCase()}</span>
                </span>
              )}
            </div>
            <div className="reviews-modal-stats-row">
              <span className="reviews-modal-rating-pill">
                <FiStar size={11} style={{ fill: "#C5A262", stroke: "#C5A262" }} />
                {avgRating}
              </span>
              <span className="reviews-modal-dot">•</span>
              <span className="reviews-modal-count">
                {count} {count === 1 ? "review" : "verified reviews"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="reviews-modal-close-btn"
            title="Close"
            aria-label="Close"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Minimal Body */}
        <div className="reviews-modal-body luxury-scrollbar">
          {loading ? (
            <div className="reviews-modal-loading">
              <div className="spinner-border spinner-border-sm text-warning mb-2" role="status" />
              <p className="mb-0 text-muted small">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="reviews-modal-empty text-danger">
              <p className="mb-0">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="reviews-modal-empty">
              <FiMessageCircle size={28} className="mb-2 opacity-40 text-muted" />
              <p className="mb-0">No written reviews yet for this store.</p>
            </div>
          ) : (
            reviews.map((rev, idx) => {
              const stars = parseStarRating(rev.starRating);
              const dateStr = rev.createTime
                ? new Date(rev.createTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const initials = rev.reviewer ? rev.reviewer.trim().charAt(0).toUpperCase() : "";

              return (
                <div key={rev.reviewId || idx} className="review-card-minimal">
                  <div className="review-card-header">
                    <div className="review-card-user">
                      <div className="review-card-avatar">
                        {initials || <FiUser size={12} />}
                      </div>
                      <div className="review-card-meta">
                        <p className="review-card-name">
                          {rev.reviewer || "Verified Customer"}
                        </p>
                        <div className="review-card-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              size={10}
                              style={{
                                fill: s <= stars ? "#D4AF37" : "none",
                                stroke: "#D4AF37",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {dateStr && <span className="review-card-date">{dateStr}</span>}
                  </div>

                  {rev.comment ? (
                    <p className="review-card-comment">{rev.comment}</p>
                  ) : (
                    <p className="review-card-norating">Rated {stars} out of 5 stars</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
