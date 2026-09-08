'use client';

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';

export default function IntlProviderClient({
  children,
  locale,
  messages
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') {
          return;
        }

        // console.error(error);
      }}
      getMessageFallback={({ key }) => key}
    >
      {children}
    </NextIntlClientProvider>
  );
}