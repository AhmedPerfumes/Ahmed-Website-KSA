'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

function RefundPolicy() {
  const t = useTranslations('refund')

  return (
    <div className='container mt-5 pt-5'>
      <h4>{t('title')}</h4>

      <p className='mt-5 fs-5'>{t('desc')}</p>

      <h5 className='mt-5'>{t('instructions')}</h5>

      <ul className='fs-5 mt-4 mb-5 pb-5'>
        {t.raw('items').map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default RefundPolicy