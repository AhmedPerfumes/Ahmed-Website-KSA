// components/Preloader.js
"use client"
// import { useEffect, useState } from 'react';

const Loader = () => {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Check if the page is already loaded
  //   if (document.readyState === "complete") {
  //     setLoading(false);
  //     return;
  //   }

  //   const handlePageLoad = () => setLoading(false);

  //   // Add event listener to detect when the page finishes loading
  //   window.addEventListener("load", handlePageLoad);

  //   // Set a timeout to remove the loader after 1.5 seconds if still loading
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500); // Adjust the timeout as needed

  //   return () => {
  //     clearTimeout(timer);
  //     window.removeEventListener("load", handlePageLoad);
  //   };
  // }, []);

  // if (!loading) return null;

  // return (
  //   <div className="preloader">
  //     <img src="/assets/images/preloader.gif" alt="loading" className="preloader-gif" />
  //   </div>
  // );
};

export default Loader;
