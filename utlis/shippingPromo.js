// Temporary free-shipping promotion: zero shipping fee on all orders
// through December 5, 2026 (23:59:59 KSA / Asia/Riyadh, UTC+3).
// After this timestamp, normal admin-managed shipping charges and
// free-shipping thresholds automatically resume.

export const FREE_SHIPPING_PROMO_END = new Date("2026-12-05T23:59:59+03:00");

export function isFreeShippingPromoActive(now = new Date()) {
  return now <= FREE_SHIPPING_PROMO_END;
}
