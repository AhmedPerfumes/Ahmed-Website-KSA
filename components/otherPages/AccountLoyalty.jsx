"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function Loyalty() {
  const t = useTranslations("Account");

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 12 }}>
      <h2 style={{ textAlign: "center", fontWeight: 600, marginBottom: 30, fontSize: 23 }}>
        {t("loyaltyComingSoon")}
      </h2>    
    </div>
  );
}
