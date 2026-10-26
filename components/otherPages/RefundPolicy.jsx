'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'

function RefundPolicy() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const t = useTranslations('refund')

  const items = Array.isArray(t.raw('items')) ? t.raw('items') : []
  const items2 = Array.isArray(t.raw('items2')) ? t.raw('items2') : []
  const items4 = Array.isArray(t.raw('items4')) ? t.raw('items4') : []

  return (
    <div
      className="container mt-5 pt-5 pb-5"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ textAlign: isAr ? 'right' : 'left' }}
    >
      <h4 className="fw-bold">{t('title')}</h4>
      <p className="text-muted">{t('effective_date')}</p>

      <h5 className="mt-5">
        {isAr ? '١.' : '1.'} {t('desc')}
      </h5>
      <ul className="fs-5 mt-3 mb-3 pb-3">
        {items.map((item, index) => (
          <li key={index} className="mb-2">{item}</li>
        ))}
      </ul>

      <h5 className="mt-4">
        {isAr ? '٢.' : '2.'} {t('desc2')}
      </h5>

      <h5 className="mt-4">
        {isAr ? '٣.' : '3.'} {t('desc3')}
      </h5>
      <ul className="fs-5 mt-3 mb-3 pb-3">
        {items2.map((item, index) => (
          <li key={index} className="mb-2">{item}</li>
        ))}
      </ul>

      <h5 className="mt-4">
        {isAr ? '٤.' : '4.'} {t('desc4')}
      </h5>
      <ul className="fs-5 mt-3 mb-5 pb-4">
        {items4.map((item, index) => (
          <li key={index} className="mb-2">{item}</li>
        ))}
      </ul>

      <h4 className="fw-bold mt-5">{t('title2')}</h4>
      <h5 className="mt-4">
        {isAr ? '١.' : '1.'} {t('desc5')}
      </h5>
      <h5 className="mt-3">
        {isAr ? '٢.' : '2.'} {t('desc6')}
      </h5>
      <h5 className="mt-3 mb-5 pb-5">
        {isAr ? '٣.' : '3.'} {t('desc7')}
      </h5>
    </div>
  )
}

export default RefundPolicy