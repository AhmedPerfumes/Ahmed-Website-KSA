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
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 86400, // 24h — product images rarely change
        // Full range including large/4K/retina — prevents upscaling on 2560-3840px displays
        deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840],
        // Extended so product card thumbnails don't upscale on large monitors
        imageSizes: [16, 32, 64, 128, 256, 384, 512, 768],
        remotePatterns: [
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
      // basePath: '/ksa'

    // ── 301 Redirects ──────────────────────────────────────────────────────────
    // Consolidates extrait-de-parfum products that were mistakenly indexed
    // under the /online-exclusive/online-exclusive/ path instead of the
    // canonical /online-exclusive/extrait-de-parfum/ path.
    // One wildcard rule covers all 14 slugs (and any future additions).
    async redirects() {
        const extraitSlugs = [
            'azure-royal',
            'blu-oud',
            'blue-by-ahmed',
            'endless',
            'exotic',
            'hayana',
            'joud-100ml',
            'lush-noir-75ml',
            'meillure-80ml',
            'oud-couture-100ml',
            'ruby',
            'sapphire',
            'xtasy',
            'zeleny',
        ];

        return extraitSlugs.flatMap((slug) => [
            // AR
            {
                source:      `/ar/shop/online-exclusive/online-exclusive/${slug}`,
                destination: `/ar/shop/online-exclusive/extrait-de-parfum/${slug}`,
                permanent:   true,
            },
            // EN (mirrors — keeps parity if EN URLs are ever crawled)
            {
                source:      `/en/shop/online-exclusive/online-exclusive/${slug}`,
                destination: `/en/shop/online-exclusive/extrait-de-parfum/${slug}`,
                permanent:   true,
            },
        ]);
    },
};

export default withNextIntl(nextConfig);
