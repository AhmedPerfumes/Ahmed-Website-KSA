/**
 * productsCache.js
 * Module-level singleton cache for the allProducts API call.
 * Prevents BestSellers, SpecialOffers, and OnlineExclusive from each
 * independently calling the same endpoint on mount — which was causing
 * 3× the API round-trips and ~600ms extra TBT on mobile.
 *
 * Usage:
 *   import { fetchAllProducts } from '@/utlis/productsCache';
 *   const products = await fetchAllProducts();
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
          body: JSON.stringify({ page: 1, limit: 60, search: '' }),
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
