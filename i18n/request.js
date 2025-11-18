// import {getRequestConfig} from 'next-intl/server';
// import {routing} from './routing';
 
// export default getRequestConfig(async ({requestLocale}) => {
//   // This typically corresponds to the `[locale]` segment
//   let locale = await requestLocale;
 
//   // Ensure that a valid locale is used
//   if (!locale || !routing.locales.includes(locale)) {
//     locale = routing.defaultLocale;
//   }
 
//   return {
//     locale,
//     messages: (await import(`../messages/${locale}.json`)).default
//   };
// });

import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  let activeLocale = locale;

  if (!routing.locales.includes(activeLocale)) {
    activeLocale = routing.defaultLocale; // 'ar'
  }

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});