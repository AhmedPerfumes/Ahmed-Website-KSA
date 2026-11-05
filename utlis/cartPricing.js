// Single source of truth for a cart line's unit price.
// Used by the cart subtotal (Context) and the cart drawer, so every line in the
// bag adds up exactly to the subtotal the customer sees.

const nowGST = () => {
  const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
  return new Date(d.toISOString().slice(0, 19).replace("T", " "));
};

export const isCouponActive = (coupon) => {
  if (!coupon || coupon.type !== "customer") return false;
  if (!coupon.start_date || !coupon.end_date) return true;
  const now = nowGST();
  return now >= new Date(coupon.start_date) && now <= new Date(coupon.end_date);
};

/**
 * @returns {{ unit: number, base: number, discounted: boolean }}
 *   unit — price actually charged per item; base — list price
 */
export function linePrice(product, couponData = null, promotions = []) {
  const base = Number(product?.price || 0);
  if (product?.is_gift) return { unit: 0, base, discounted: false };

  if (product?.discount?.value) {
    let d = base;
    if (product.discount.discount_type === "percent") {
      d = base - (base * Number(product.discount.value)) / 100;
    } else if (product.discount.discount_type === "amount") {
      d = product.discount.final_price ? Number(product.discount.final_price) : base - Number(product.discount.value);
    }
    if (d < base) return { unit: Number(d.toFixed(2)), base, discounted: true };
  }

  // Legacy flat sale_price field
  if (product?.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < base) {
    return { unit: Number(Number(product.sale_price).toFixed(2)), base, discounted: true };
  }

  // Customer / global coupon (not on discounted or promotion items)
  const inPromo = (promotions || []).some((promo) => promo.buy_products?.some((i) => i.product_id === product.product_id));
  if (isCouponActive(couponData) && !product.discount && !inPromo) {
    const v = Number(couponData?.value || 0);
    let d = base;
    if (couponData.coupon_type === "percent") d = base - (base * v) / 100;
    else if (couponData.coupon_type === "amount") d = base - v;
    return { unit: Number(d.toFixed(2)), base, discounted: d < base };
  }

  return { unit: base, base, discounted: false };
}

/** Full image URL for a product / cart line (handles `image`, JSON string or array `images`). */
export function productImageUrl(p) {
  const base = `${process.env.NEXT_PUBLIC_API_URL}storage/`;
  if (p?.image) return base + p.image;
  try {
    const imgs = typeof p?.images === "string" ? JSON.parse(p.images) : p?.images;
    if (Array.isArray(imgs) && imgs[0]) return base + imgs[0];
  } catch { /* ignore */ }
  return null;
}

/** Product page URL — same slug rules as the [...product] route (and the old cart page). */
export function productHref(p, locale) {
  const cat = String(p?.category_name || p?.category?.category_name || "").toLowerCase().trim().replace(/\s+/g, "-");
  // No subcategory (e.g. Online Exclusive) → the category slug doubles as the subcategory
  const sub = String(p?.subcategory_name || p?.subcategory?.subcategory_name || "").toLowerCase().trim().replace(/\s+/g, "-") || cat;
  const raw = String(p?.product_name || p?.name || "").replace(/&amp;/g, "&");
  const name = raw.replace(/[^a-zA-Z0-9؀-ۿ\s-]/g, "").trim().split(/\s+/).join("-").toLowerCase();
  if (!cat || !sub || !name) return null;
  return `/${locale}/shop/${cat}/${sub}/${name}`;
}
