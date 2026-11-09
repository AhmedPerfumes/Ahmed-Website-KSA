import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  experimental: {
    // Reduces barrel-file overhead for these packages — smaller initial JS chunks
    optimizePackageImports: ['swiper', 'he', 'react-bootstrap', 'bootstrap'],
  },
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h — product images rarely change
    // Full range including large/4K/retina — prevents upscaling on 2560-3840px displays
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840],
    // Extended so product card thumbnails don't upscale on large monitors
    imageSizes: [16, 32, 64, 128, 256, 384, 512, 768],
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      {
        protocol: 'https',
        hostname: 'phpstack-1403159-5212295.cloudwaysapps.com',
      },
      {
        protocol: 'https',
        hostname: 'adminksa.ahmedalmaghribi.com',
      },
      {
        protocol: 'https',
        hostname: 'ae.ahmedalmaghribi.com',
      },
      {
        protocol: 'https',
        hostname: 'admin.ahmedalmaghribi.com',
      },
      {
        protocol: 'https',
        hostname: 'ksa.ahmedalmaghribi.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  productionBrowserSourceMaps: false,

  // ── Cloudflare CDN Cache-Control Headers ───────────────────────────────────
  // These headers tell Cloudflare how long to cache each asset type at the edge.
  // Without these, Cloudflare may not cache assets at all.
  async headers() {
    return [
      {
        // ── Static public assets (images, fonts, SVGs, GIFs) ──────────────
        // Safe to cache 1 year — if you change a file, rename it or bust the
        // cache manually in Cloudflare dashboard (Caching → Purge Everything).
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // ── Videos ────────────────────────────────────────────────────────
        // Overrides the broader /assets rule above with a shorter TTL.
        // 30 days (not immutable) — allows re-serving if you replace a video
        // file with the same name without a full cache purge.
        source: '/assets/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, s-maxage=2592000',
          },
        ],
      },
      {
        // ── Next.js built JS/CSS chunks ───────────────────────────────────
        // Hashed filenames (e.g. main-abc123.js) are always unique per build,
        // so caching forever is completely safe — a new deploy = new hash.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // ── Next.js Image Optimizer (/_next/image) ────────────────────────
        // Next.js generates its own Cache-Control for /_next/image and
        // overrides the Cache-Control key above. So we use the Cloudflare-
        // specific header which Cloudflare reads independently — this cannot
        // be overridden by Next.js and forces 7-day edge caching even with
        // query parameters (?url=...&w=...&q=...).
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
          {
            // Cloudflare-specific header — takes priority over Cache-Control
            // at the edge. Fixes DYNAMIC / MISS status for /_next/image.
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'public, max-age=604800',
          },
        ],
      },
      // Preconnect to admin image CDN for faster first-image load on EWD quiz
      {
        source: '/:path*',
        headers: [
          { key: 'Link', value: '<https://adminksa.ahmedalmaghribi.com>; rel=preconnect; crossorigin' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/:locale(en|ar)/maplibre/:path*',
        destination: '/maplibre/:path*',
      },

    ];
  },
  // basePath: '/ksa'

  // ── 301 Redirects ──────────────────────────────────────────────────────────
  // Consolidates extrait-de-parfum products that were mistakenly indexed
  // under the /online-exclusive/online-exclusive/ path instead of the
  // canonical /online-exclusive/extrait-de-parfum/ path.
  // One wildcard rule covers all 14 slugs (and any future additions).
  // // async redirects() {
  // //   const extraitSlugs = [
  // //     'azure-royal',
  // //     'blu-oud',
  // //     'blue-by-ahmed',
  // //     'endless',
  // //     'exotic',
  // //     'hayana',
  // //     'joud-100ml',
  // //     'lush-noir-75ml',
  // //     'meillure-80ml',
  // //     'oud-couture-100ml',
  // //     'ruby',
  // //     'sapphire',
  // //     'xtasy',
  // //     'zeleny',
  // //   ];

  //   return extraitSlugs.flatMap((slug) => [
  //     // AR
  //     {
  //       source: `/ar/shop/online-exclusive/online-exclusive/${slug}`,
  //       destination: `/ar/shop/online-exclusive/extrait-de-parfum/${slug}`,
  //       permanent: true,
  //     },
  //     // EN (mirrors — keeps parity if EN URLs are ever crawled)
  //     {
  //       source: `/en/shop/online-exclusive/online-exclusive/${slug}`,
  //       destination: `/en/shop/online-exclusive/extrait-de-parfum/${slug}`,
  //       permanent: true,
  //     },
  //   ]);
  // },
};

export default withNextIntl(nextConfig);
