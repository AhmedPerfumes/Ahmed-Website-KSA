import React from "react";
import FlipCards from "../card";
import InteractivePerfumeNotes from "../InteractivePerfumeNotes";

const Fragrance = () => {
  return (
    <div>
      <h2>
        <p
          className="font-cinzel h4 text-dark mt-3"
          style={{
            backgroundColor: "#FAF9F7",
            color: "#222",
            paddingTop: "2rem",
          }}
        >
          Fragrance Profile
        </p>
      </h2>
      <div style={{ backgroundColor: "#FAF9F7" }}>
        <div>
          <div className="d-flex flex-wrap justify-content-between mb-4 ">
            {/* <FlipCards /> */}
            <InteractivePerfumeNotes />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fragrance;
