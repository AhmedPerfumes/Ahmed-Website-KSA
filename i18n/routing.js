import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],
 
  // Used when no locale matches.
  // No cookie (fresh browser session) → Arabic.
  // Cookie NEXT_LOCALE=en (set when user switches language) → English until browser closes.
  defaultLocale: 'ar',

  // Read/write NEXT_LOCALE as a session cookie (no maxAge = clears on browser close)
  localeCookie: {
    name: 'NEXT_LOCALE',
    sameSite: 'lax',
    // maxAge intentionally omitted → session cookie
  },
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);