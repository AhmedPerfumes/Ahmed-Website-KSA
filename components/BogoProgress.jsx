"use client";
import React, { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useContextElement } from "@/context/Context";

// Module-level cache so cart, drawer and checkout share one request.
let promoPromise = null;
const loadPromotions = () => {
  if (!promoPromise) {
    promoPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}api/bogoProducts`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => (d.bogoProducts || []).filter((p) => p.campaign && p.buy_products?.length && Number(p.buy_quantity) > 0))
      .catch(() => {
        promoPromise = null; // allow retry later
        return [];
      });
  }
  return promoPromise;
};

/**
 * Progress bar(s) for Buy X Get Y campaigns, so the customer knows
 * how many more items to add to unlock the offer.
 * Only shows for campaigns where the cart already holds a qualifying item.
 */
const BogoProgress = ({ compact = false }) => {
  const { cartProducts } = useContextElement();
  const isAr = useLocale() === "ar";
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    let alive = true;
    loadPromotions().then((p) => alive && setPromos(p));
    return () => {
      alive = false;
    };
  }, []);

  if (!promos.length || !cartProducts?.length) return null;

  const rows = promos
    .map((promo) => {
      const buyQty = Number(promo.buy_quantity);
      const getQty = Number(promo.get_quantity) || 1;
      const total = cartProducts
        .filter((i) => !i.is_gift && promo.buy_products.some((b) => String(b.product_id) === String(i.product_id)))
        .reduce((s, i) => s + (Number(i.quantity) || 0), 0);
      if (total <= 0) return null;
      const rem = total % buyQty;
      const unlocked = total >= buyQty && rem === 0;
      const need = unlocked ? 0 : buyQty - rem;
      const pct = unlocked ? 100 : Math.round((rem / buyQty) * 100);
      return { promo, buyQty, getQty, need, unlocked, pct, total };
    })
    .filter(Boolean);

  if (!rows.length) return null;

  return (
    <div style={{ display: "grid", gap: 10, margin: compact ? "0 0 8px" : "0 0 16px" }}>
      {rows.map(({ promo, getQty, need, unlocked, pct }) => {
        const name = (isAr && promo.name_ar?.trim()) || promo.name || "";
        const text = unlocked
          ? isAr
            ? `🎉 تم تفعيل عرض ${name}! ${getQty} مجاني`
            : `🎉 ${name} offer unlocked! ${getQty} free`
          : isAr
            ? `أضف ${need} ${need > 1 ? "منتجات" : "منتج"} إضافية لتحصل على ${getQty} مجاناً${name ? ` (${name})` : ""}`
            : `Add ${need} more item${need > 1 ? "s" : ""} to get ${getQty} FREE${name ? ` — ${name}` : ""}`;
        return (
          <div
            key={promo.campaign}
            style={{
              padding: compact ? "8px 12px" : "12px 16px",
              border: "1px solid #e8e0d0",
              borderRadius: 8,
              background: unlocked ? "#f1f8f1" : "#fffaf0",
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: compact ? 12 : 14, fontWeight: 600, color: "#000" }}>{text}</p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              style={{ height: 6, borderRadius: 3, background: "#e5e5e5", overflow: "hidden" }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: unlocked ? "#2e9e4f" : "#b8860b",
                  transition: "width .3s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BogoProgress;
