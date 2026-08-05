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
          body: JSON.stringify({ page: 1, limit: 120, search: '' }),
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
 * First tries a direct API call with category filter.
 * Falls back to filtering the general cache if needed.
 */
let _oeCache = null;
let _oeInFlight = null;

export async function fetchOnlineExclusiveProducts() {
  if (_oeCache) return _oeCache;
  if (_oeInFlight) return _oeInFlight;

  _oeInFlight = (async () => {
    try {
      // Try direct category-specific fetch first
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 1,
            limit: 60,
            search: '',
            category: 'Online Exclusive',
          }),
        }
      );
      const result = await res.json();
      const direct = (result?.data ?? []).filter(p => (p.product_qty ?? 0) > 0);

      if (direct.length > 0) {
        _oeCache = direct;
        return _oeCache;
      }

      // Fallback: filter from general cache
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
