/**
 * productsCache.js
 * Module-level singleton cache for the allProducts API call.
 * Prevents BestSellers, SpecialOffers, and OnlineExclusive from each
 * independently calling the same endpoint on mount — which was causing
 * 3× the API round-trips and ~600ms extra TBT on mobile.
 *
 * Usage:
 *   import { fetchAllProducts, fetchProductsByCategory } from '@/utlis/productsCache';
 *   const products = await fetchAllProducts();
 *   const perfumes = await fetchProductsByCategory('PERFUMES');
 */

let _cache = null;
let _inFlight = null;

/**
 * Fetches all products (limit 60), deduplicating concurrent requests.
 * The result is cached for the lifetime of the browser tab (module scope).
 */
export async function fetchAllProducts() {
  // Return cached result immediately
  if (_cache) return _cache;

  // If a request is already in-flight, wait for it
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 1, limit: 250, search: '' }),
        }
      );
      const result = await res.json();
      _cache = result?.data ?? [];
      return _cache;
    } catch (e) {
      console.error('[productsCache] fetch failed:', e);
      return [];
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

/**
 * Fetches best-selling products from /api/getBestSelling.
 * Returns the full keyed object: { Perfumes: [...], Dakhoon: [...], ... }
 * Cached for the lifetime of the browser tab.
 */
let _bestSellingCache = null;
let _bestSellingInFlight = null;

export async function fetchBestSelling() {
  if (_bestSellingCache) return _bestSellingCache;
  if (_bestSellingInFlight) return _bestSellingInFlight;

  _bestSellingInFlight = (async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/getBestSelling`
      );
      const data = await res.json();
      _bestSellingCache = data || {};
      return _bestSellingCache;
    } catch (e) {
      console.error('[productsCache] getBestSelling failed:', e);
      return {};
    } finally {
      _bestSellingInFlight = null;
    }
  })();

  return _bestSellingInFlight;
}

/**
 * @deprecated use fetchBestSelling() instead
 * Kept for backward compat with other components.
 */
export async function fetchProductsByCategory(category) {
  const data = await fetchBestSelling();
  // Find the matching key case-insensitively
  const key = Object.keys(data).find(
    k => k.toUpperCase() === category.toUpperCase()
  );
  const products = key ? (data[key] || []) : [];
  return products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
}

/**
 * Fetches products in the Online Exclusive category.
 * Filters allProducts (full 250-product fetch) by category_name or
 * subcategory_name containing "online" or "exclusive" (case-insensitive).
 * NOTE: the allProducts API does not support server-side category filtering —
 * we must fetch all products and filter client-side.
 */
let _oeCache = null;
let _oeInFlight = null;

export async function fetchOnlineExclusiveProducts() {
  if (_oeCache) return _oeCache;
  if (_oeInFlight) return _oeInFlight;

  _oeInFlight = (async () => {
    try {
      const all = await fetchAllProducts();
      _oeCache = all.filter((p) => {
        if ((p.product_qty ?? 0) <= 0) return false;
        const cat    = (p.category_name ?? "").toLowerCase();
        const subcat = (p.subcategory?.subcategory_name ?? "").toLowerCase();
        return (
          cat.includes("online") ||
          cat.includes("exclusive") ||
          subcat.includes("online") ||
          subcat.includes("exclusive")
        );
      });
      return _oeCache;
    } catch (e) {
      console.error('[productsCache] fetchOnlineExclusiveProducts failed:', e);
      return [];
    } finally {
      _oeInFlight = null;
    }
  })();

  return _oeInFlight;
}

/**
 * Fetches active special offers and dynamic promotions from /api/specialOffers.
 * Returns { success: true, discounts: [...], buy_x_get_y: [...], promotions: [...] }
 * Cached for the lifetime of the browser tab.
 */
let _soCache = null;
let _soInFlight = null;

export async function fetchSpecialOffers() {
  if (_soCache) return _soCache;
  if (_soInFlight) return _soInFlight;

  _soInFlight = (async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/specialOffers`
      );
      const data = await res.json();
      _soCache = {
        discounts: Array.isArray(data?.discounts) ? data.discounts : [],
        buy_x_get_y: Array.isArray(data?.buy_x_get_y) ? data.buy_x_get_y : [],
        promotions: Array.isArray(data?.promotions) ? data.promotions : [],
      };
      return _soCache;
    } catch (e) {
      console.error('[productsCache] fetchSpecialOffers failed:', e);
      return { discounts: [], buy_x_get_y: [], promotions: [] };
    } finally {
      _soInFlight = null;
    }
  })();

  return _soInFlight;
}

/**
 * Fetches active discount promotions only.
 * Returns Array of discount promotions.
 */
export async function fetchDiscountOffers() {
  const data = await fetchSpecialOffers();
  return data?.discounts ?? [];
}

/**
 * Fetches active Buy X Get Y / BOGO promotions only.
 * Returns Array of Buy X Get Y promotions.
 */
export async function fetchBuyXGetYOffers() {
  const data = await fetchSpecialOffers();
  return data?.buy_x_get_y ?? [];
}


