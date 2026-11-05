"use client";
// Runtime error boundary for every [locale] page — branded instead of Next's default.
import { useEffect } from "react";
import BrandedErrorPage from "@/components/otherPages/BrandedErrorPage";

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="page-wrapper">
      <BrandedErrorPage variant="error" onRetry={reset} />
    </main>
  );
}
