/**
 * sitemap.js  —  Next.js App Router dynamic sitemap
 * ─────────────────────────────────────────────────────────────
 * Auto-served at GET /sitemap.xml by Next.js.
 * Dynamically generated from the live catalog (categories, products, blogs).
 * Strictly outputs canonical URLs with real lastmod timestamps.
 * Covers both 'ar' and 'en' locales with hreflang alternates.
 * Revalidates every 7 days (ISR).
 */

const BASE_URL = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://adminksa.ahmedalmaghribi.com/public/";
const LOCALES = ["ar", "en"];

// ── Helpers ────────────────────────────────────────────────────────────────

function removeSpecialCharactersAndAmp(str) {
    if (!str) return "";
    let cleaned = str.replace(/&amp;/g, "").replace(/&/g, "");
    cleaned = cleaned.replace(/[^\w\s-]/g, "");
    return cleaned.replace(/\s+/g, " ").trim();
}

function slugify(str) {
    if (!str) return "";
    return removeSpecialCharactersAndAmp(str)
        .split(" ")
        .join("-")
        .toLowerCase();
}

/** Map category / subcategory combinations matching canonical shop routes */
function resolveSubcat(catSlug, subcategory) {
    if (subcategory && subcategory.subcategory_name) {
        return slugify(subcategory.subcategory_name);
    }
    if (catSlug === "gift-sets") return "gift-sets";
    if (catSlug === "hair-mist") return "hair-mist";
    if (catSlug === "gel") return "body-gel";
    return catSlug;
}

/** Build localized entries with hreflang alternates; only emits lastmod when a genuine date is provided */
function loc(path, lastMod) {
    let validDate = null;
    if (lastMod) {
        const d = new Date(lastMod);
        if (!isNaN(d.getTime())) {
            validDate = d;
        }
    }

    return LOCALES.map((locale) => {
        const entry = {
            url: `${BASE_URL}/${locale}${path}`,
            alternates: {
                languages: {
                    "ar-SA": `${BASE_URL}/ar${path}`,
                    en: `${BASE_URL}/en${path}`,
                    "x-default": `${BASE_URL}/ar${path}`,
                },
            },
        };

        if (validDate) {
            entry.lastModified = validDate;
        }

        return entry;
    });
}

/** Authenticated API fetch that forwards the required origin header */
async function apiFetch(endpoint, body = {}) {
    const origin = BASE_URL;
    const cleanApiUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
    try {
        const res = await fetch(`${cleanApiUrl}api/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                origin: origin,
            },
            body: JSON.stringify(body),
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

// ── Static pages ────────────────────────────────────────────────────────────

const STATIC_PAGES = [
    { path: "" },
    { path: "/shop" },
    { path: "/sale" },
    { path: "/about", lastMod: "2026-06-01" },
    { path: "/contact", lastMod: "2026-06-01" },
    { path: "/store-locator", lastMod: "2026-06-01" },
    { path: "/shipping-and-delivery", lastMod: "2026-06-01" },
    { path: "/refund-policy", lastMod: "2026-10-24" },
    { path: "/privacy", lastMod: "2026-06-01" },
    { path: "/terms", lastMod: "2026-06-01" },
    { path: "/export", lastMod: "2026-06-01" },
    { path: "/lookbook", lastMod: "2026-06-01" },
    { path: "/blog" },
];

// ── Main export ────────────────────────────────────────────────────────────

export default async function sitemap() {
    const entries = [];
    const seenUrls = new Set();

    const addEntry = (path, lastMod) => {
        if (!path || seenUrls.has(path)) return;
        seenUrls.add(path);
        entries.push(...loc(path, lastMod));
    };

    // 1. Static pages
    for (const page of STATIC_PAGES) {
        const pagePath = typeof page === "string" ? page : page.path;
        const pageLastMod = typeof page === "object" ? page.lastMod : null;
        addEntry(pagePath, pageLastMod);
    }

    // 2. Live categories and subcategories (including gel, hair-mist, etc.)
    try {
        const catData = await apiFetch("productCategoriesTemp", {});
        const categories = catData?.productCategories || [];
        for (const cat of categories) {
            const catSlug = slugify(cat.name);
            if (!catSlug) continue;

            addEntry(`/product-category/${catSlug}`);

            for (const sub of cat.productSubCategories || []) {
                const subSlug = slugify(sub.name);
                if (subSlug && subSlug !== catSlug) {
                    addEntry(`/product-category/${catSlug}/${subSlug}`);
                }
            }
        }
    } catch (e) {
        console.error("sitemap: error fetching categories", e);
    }

    // 3. Live products from catalog with canonical 3-tier routes
    try {
        const prodData = await apiFetch("allProducts", { limit: 500, page: 1, search: "" });
        const products = prodData?.data || [];
        for (const product of products) {
            const catSlug = slugify(product.category_name);
            const subSlug = resolveSubcat(catSlug, product.subcategory);
            const prodSlug = slugify(product.product_name);

            if (catSlug && subSlug && prodSlug) {
                const canonicalPath = `/shop/${catSlug}/${subSlug}/${prodSlug}`;
                addEntry(canonicalPath, product.updated_at || product.created_at);
            }
        }
    } catch (e) {
        console.error("sitemap: error fetching products", e);
    }

    // 4. Live blog posts
    try {
        const blogData = await apiFetch("blogs", {});
        const blogs = blogData?.data || blogData?.blogs || [];
        for (const blog of blogs) {
            const slug = blog.permalink?.key || slugify(blog.name);
            if (slug) {
                addEntry(`/blog/${slug}`, blog.post_date || blog.created_at);
            }
        }
    } catch (e) {
        console.error("sitemap: error fetching blogs", e);
    }

    return entries;
}

// Revalidate once every hour (ISR)
export const revalidate = 604800;
