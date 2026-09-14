"use client";
import React, { useState } from "react";
import { useLocale } from "next-intl";

export default function Pagination2({
  totalPages = 1,
  currentPage: propCurrentPage,
  onPageChange,
}) {
  const [internalPage, setInternalPage] = useState(1);
  const activePage = propCurrentPage !== undefined ? propCurrentPage : internalPage;
  const locale = useLocale();

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === activePage) return;
    if (onPageChange) {
      onPageChange(pageNumber);
    } else {
      setInternalPage(pageNumber);
    }
  };

  const handlePrevClick = () => {
    if (activePage > 1) {
      handlePageClick(activePage - 1);
    }
  };

  const handleNextClick = () => {
    if (activePage < totalPages) {
      handlePageClick(activePage + 1);
    }
  };

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);

      if (activePage <= 3) {
        start = 2;
        end = 4;
      } else if (activePage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      className="shop-pages d-flex justify-content-between align-items-center mt-4 mb-4"
      aria-label="Page navigation"
    >
      <button
        type="button"
        className={`btn-link d-inline-flex align-items-center bg-transparent border-0 p-0 ${
          activePage <= 1 ? "disabled opacity-50 pe-none" : "cursor-pointer"
        }`}
        onClick={handlePrevClick}
        disabled={activePage <= 1}
        aria-label="Previous Page"
      >
        <svg
          className={locale === "ar" ? "ms-1" : "me-1"}
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
          style={locale === "ar" ? { transform: "rotate(180deg)" } : undefined}
        >
          <use href="#icon_prev_sm" />
        </svg>
        <span className="fw-medium">{locale === "ar" ? "السابق" : "PREV"}</span>
      </button>

      <ul className="pagination mb-0 d-flex align-items-center list-unstyled gap-1">
        {getPageNumbers().map((item, index) => (
          <li key={index} className="page-item">
            {item === "..." ? (
              <span className="px-2 text-muted">...</span>
            ) : (
              <button
                type="button"
                className={`btn-link px-2 py-1 mx-1 border-0 bg-transparent cursor-pointer ${
                  activePage === item ? "btn-link_active fw-bold text-decoration-underline" : "text-secondary"
                }`}
                onClick={() => handlePageClick(item)}
                aria-current={activePage === item ? "page" : undefined}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`btn-link d-inline-flex align-items-center bg-transparent border-0 p-0 ${
          activePage >= totalPages ? "disabled opacity-50 pe-none" : "cursor-pointer"
        }`}
        onClick={handleNextClick}
        disabled={activePage >= totalPages}
        aria-label="Next Page"
      >
        <span className={locale === "ar" ? "ms-1 fw-medium" : "me-1 fw-medium"}>
          {locale === "ar" ? "التالي" : "NEXT"}
        </span>
        <svg
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
          style={locale === "ar" ? { transform: "rotate(180deg)" } : undefined}
        >
          <use href="#icon_next_sm" />
        </svg>
      </button>
    </nav>
  );
}
