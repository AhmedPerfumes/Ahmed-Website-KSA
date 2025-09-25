// LOGIN & REGISTER MODULE
"use client";

import { openModalUserlogin } from "@/utlis/aside";
import { useEffect, useState } from "react";

export default function User() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // adjust breakpoint if needed
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      openModalUserlogin();
    }
  };

  return (
    <svg
      onClick={handleClick}
      className="d-block"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href="#icon_user" />
    </svg>
  );
}
