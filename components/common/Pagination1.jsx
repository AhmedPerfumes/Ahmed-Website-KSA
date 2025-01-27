import React from "react";

export default function Pagination1() {
  return (
    <div
      className="mb-3 ms-auto me-auto"
      style={{ width: "300px" }}
    >
      {/* <div
        className="progress-bar"
        role="progressbar"
        style={{ width: "39%" }}
        aria-valuenow="39%"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div> */}
      <img src="/assets/images/page-loader.gif" alt="loading"/>
    </div>
  );
}
