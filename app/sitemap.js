/**
 * sitemap.js  —  Next.js App Router built-in sitemap
 * ────────────────────────────────────────────────────
 * Auto-served at GET /sitemap.xml by Next.js.
 * Fetches live products, categories, and blogs from the API.
 * Covers both en and ar locales with hreflang alternates.
 * Revalidates every hour (ISR).
 */

const BASE_URL = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
const API_URL  = process.env.NEXT_PUBLIC_API_URL        || "https://adminksa.ahmedalmaghribi.com/public/";
const LOCALES  = ["en", "ar"];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build one entry per locale for a given path, with hreflang alternates */
function loc(path, lastMod) {
    const d = lastMod ? new Date(lastMod) : new Date();
    return LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: d,
        alternates: {
            languages: Object.fromEntries(
                LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
            ),
        },
    }));
}

async function apiFetch(endpoint, body = {}) {
    try {
        const res = await fetch(`${API_URL}api/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

// ── Static pages (both locales) ────────────────────────────────────────────

const STATIC_PAGES = [
    "",                                        // homepage
    "/shop",
    "/sale",
    "/about",
    "/contact",
    "/blogs",
    "/product-category/perfumes",
    "/product-category/dakhoon",
    "/product-category/gift-sets",
    "/product-category/concentrated-parfum",
    "/product-category/hair-mist",
    "/product-category/gel",
];

// ── Main export ────────────────────────────────────────────────────────────

export default async function sitemap() {
    const entries = [];

    // 1. Static pages
    for (const page of STATIC_PAGES) {
        entries.push(...loc(page));
    }

    // 2. Product category pages
    try {
        const catData = await apiFetch("productCategoriesTemp", {});
        const categories = catData?.categories || catData?.data || [];
        for (const cat of categories) {
            const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, "-");
            if (slug) entries.push(...loc(`/product-category/${slug}`));
        }
    } catch { /* skip on error */ }

    // 3. Individual product pages
    try {
        const prodData = await apiFetch("allProducts", { per_page: 2000 });
        const products = prodData?.data || prodData?.products || [];
        for (const product of products) {
            const slug = product.slug || product.product_id;
            if (slug) entries.push(...loc(`/shop-product-detail/${slug}`, product.updated_at));
        }
    } catch { /* skip on error */ }

    // 4. Blog posts
    try {
        const blogData = await apiFetch("blogs", {});
        const blogs = blogData?.data || blogData?.blogs || [];
        for (const blog of blogs) {
            const slug = blog.slug || blog.id;
            if (slug) entries.push(...loc(`/blogs/${slug}`, blog.updated_at));
        }
    } catch { /* skip on error */ }

    return entries;
}

// Regenerate at most once per hour
export const revalidate = 3600;
