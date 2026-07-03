import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],
 
  // Used when no locale matches
  // • Fresh visit (no cookie) → Arabic
  // • Cookie = 'en' (user switched) → English until browser closes
  defaultLocale: 'ar',

  // Tell middleware to read/write the NEXT_LOCALE cookie for locale persistence.
  // No maxAge = session cookie → cleared when browser closes (new visit = Arabic again).
  localeCookie: {
    name: 'NEXT_LOCALE',
    sameSite: 'lax',
    // maxAge intentionally omitted → session cookie (cleared on browser close)
  },
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);