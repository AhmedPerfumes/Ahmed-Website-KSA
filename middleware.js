// import createMiddleware from 'next-intl/middleware';
// import {routing} from './i18n/routing';

// // Minimal, locale-only middleware (no GeoIP)
// export default createMiddleware(routing);

// // Match internationalized pathnames and exclude API/static assets
// export const config = {
//   matcher: [
//     '/',
//     '/(ar|en)/:path*',
//     '/((?!api/|_next/static|_next/image|favicon.ico|assets).*)'
//   ]
// };

import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// localeDetection: true (default) — next-intl checks the NEXT_LOCALE cookie first.
// • Cookie absent (fresh session) → falls back to defaultLocale ('ar') → correct new-visit behaviour
// • Cookie = 'en' (user switched language) → stays English until browser closes (session cookie)
export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!api/|_next/static|_next/image|favicon.ico|assets).*)'
  ]
};
