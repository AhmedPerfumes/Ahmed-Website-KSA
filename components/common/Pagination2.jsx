"use client";
import React, { useState } from "react";
import Link from "next/link";

/**
 * Pagination2
 *
 * Can be used in two modes:
 * 1. Controlled  — pass `totalPages` + `currentPage` + `onPageChange` from parent (e.g. DiscountGrid).
 * 2. Uncontrolled — omit those props; component manages its own state.
 */
export default function Pagination2({
  totalPages = 4,
  currentPage: controlledPage,
  onPageChange,
}) {
  const [internalPage, setInternalPage] = useState(1);

  const isControlled = controlledPage !== undefined && onPageChange !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  const goTo = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    if (isControlled) {
      onPageChange(pageNumber);
    } else {
      setInternalPage(pageNumber);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) goTo(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) goTo(currentPage + 1);
  };

  // Smart page calculation with ellipsis for mobile & desktop
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="shop-pages d-flex align-items-center justify-content-between flex-wrap gap-2 my-4 px-2 overflow-hidden"
      aria-label="Page navigation"
      style={{ maxWidth: "100%", margin: "0 auto" }}
    >
      <Link
        href="#"
        className={`btn-link d-inline-flex align-items-center text-nowrap flex-shrink-0 ${
          currentPage === 1 ? "opacity-25 pe-none disabled" : ""
        }`}
        style={{ textDecoration: "none", fontSize: "13px" }}
        onClick={(e) => {
          e.preventDefault();
          handlePrev();
        }}
      >
        <svg
          className="me-1 rtl-flip"
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="#icon_prev_sm" />
        </svg>
        <span className="fw-medium">PREV</span>
      </Link>

      <ul className="pagination d-flex align-items-center justify-content-center flex-wrap mb-0 list-unstyled gap-1 gap-sm-2 px-1">
        {pages.map((item, index) => {
          if (item === "...") {
            return (
              <li
                key={`ellipsis-${index}`}
                className="page-item d-flex align-items-center justify-content-center text-muted user-select-none"
                style={{ width: "24px", height: "32px", fontSize: "14px" }}
              >
                <span>&hellip;</span>
              </li>
            );
          }

          const pageNum = item;
          const isActive = currentPage === pageNum;

          return (
            <li key={pageNum} className="page-item">
              <Link
                className={`btn-link d-inline-flex align-items-center justify-content-center text-decoration-none ${
                  isActive
                    ? "btn-link_active fw-bold text-dark bg-light rounded-circle shadow-sm"
                    : "text-secondary hover-dark"
                }`}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 6px",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                }}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goTo(pageNum);
                }}
              >
                {pageNum}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="#"
        className={`btn-link d-inline-flex align-items-center text-nowrap flex-shrink-0 ${
          currentPage === totalPages ? "opacity-25 pe-none disabled" : ""
        }`}
        style={{ textDecoration: "none", fontSize: "13px" }}
        onClick={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <span className="fw-medium me-1">NEXT</span>
        <svg
          className="rtl-flip"
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="#icon_next_sm" />
        </svg>
      </Link>
    </nav>
  );
}
