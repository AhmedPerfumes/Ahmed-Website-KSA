"use client";
/**
 * Order lines for the thank-you pages (COD, card/Tabby, Tamara).
 *
 * Built from the order as the backend saved it (api/orderDetails → products):
 *   price            unit price, net of VAT, before discount
 *   discount_percent / discount_amount (net)
 *   gross_amount     line total incl. VAT, after discount — what the customer actually pays
 * so a discounted line shows the original price struck through next to the paid price.
 */
import he from "he";

const IMG_BASE = `${process.env.NEXT_PUBLIC_API_URL}storage/`;
const key = (s) => he.decode(String(s || "")).trim().toLowerCase();

/** Saved order products → display lines. `images` maps product name → image path (optional). */
export function normalizeOrderLines(products, vatRate, images = {}) {
  return (products || []).map((p) => {
    const name = he.decode(String(p.product_name || p.name || ""));
    const qty = Number(p.qty || p.quantity || 1);
    const isGift = !!Number(p.is_gift);
    const original = Math.round((parseFloat(p.price) || 0) * (1 + vatRate) * qty * 100) / 100;
    const gross = parseFloat(p.gross_amount);
    const paid = isGift ? 0 : Number.isFinite(gross) && gross > 0 ? gross : original;
    const percent = Number(p.discount_percent) || (original > 0 && paid < original ? Math.round((1 - paid / original) * 100) : 0);
    const image = p.image || images[key(name)] || null;
    return {
      name, qty, isGift, original, paid,
      discounted: !isGift && paid < original - 0.01,
      percent,
      image: image ? (String(image).startsWith("http") ? image : IMG_BASE + image) : null,
    };
  });
}

/** name → image path, from the storeOrder response (full product records) or the cart. */
export function imagesByName(items) {
  const map = {};
  (items || []).forEach((p) => {
    let img = p.image;
    if (!img && p.images) { try { img = JSON.parse(p.images)[0]; } catch { /* ignore */ } }
    if (img) map[key(p.name || p.product_name)] = img;
  });
  return map;
}

export function orderLineTotals(lines) {
  const original = lines.reduce((s, l) => s + (l.isGift ? 0 : l.original), 0);
  const paid = lines.reduce((s, l) => s + l.paid, 0);
  return { original, paid, discount: Math.max(0, Math.round((original - paid) * 100) / 100) };
}

export default function OrderLines({ lines, money, t, productName }) {
  return (
    <ul className="ol-list">
      {lines.map((l, i) => (
        <li key={i} className="ol-item">
          <div className="ol-item__media">
            {l.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.image} alt="" width={64} height={64} loading="lazy" />
            ) : (
              <span className="ol-item__placeholder" aria-hidden="true" />
            )}
          </div>
          <div className="ol-item__info">
            <span className="ol-item__name"><bdi>{productName(l.name)}</bdi></span>
            <span className="ol-item__meta">× {l.qty}{l.isGift && <> · <span className="ol-item__gift">{t("freeGift")}</span></>}</span>
          </div>
          <div className="ol-item__price">
            {l.discounted && <s className="ol-item__was">{money(l.original)}</s>}
            <span className={`ol-item__now${l.discounted ? " is-sale" : ""}`}>{money(l.paid)}</span>
            {l.discounted && l.percent > 0 && <span className="ol-item__chip" dir="ltr">−{l.percent}%</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
