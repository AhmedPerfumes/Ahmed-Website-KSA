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
        quality: 90,            // Up from default 75 — crisper images on large screens
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
};

export default withNextIntl(nextConfig);
