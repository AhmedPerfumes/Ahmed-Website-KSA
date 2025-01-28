import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'phpstack-1403159-5212295.cloudwaysapps.com',
          },
          {
            protocol: 'https',
            hostname: 'adminksa.ahmed-perfume.com',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
          }
        ],
      },
      productionBrowserSourceMaps: true,
      basePath: '/ksa'
};

export default withNextIntl(nextConfig);
