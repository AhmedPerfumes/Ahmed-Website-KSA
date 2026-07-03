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
        minimumCacheTTL: 300, // 5 min — reduces repeat-visit CDN round-trips
        // Trimmed to actual breakpoints used — fewer srcset entries = faster browser evaluation
        deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920],
        imageSizes: [16, 32, 64, 128, 256],
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
