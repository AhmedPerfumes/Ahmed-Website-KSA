'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

function RefundPolicy() {
  const t = useTranslations('refund')

  return (
    <div className='container mt-5 pt-5'>
      <h4>{t('title')}</h4>
      <p>{t('effective_date')}</p>
      <h5 className='mt-5'>1. {t('desc')}</h5>
       <ul className='fs-5 mt-3 mb-3 pb-3'>
        {t.raw('items').map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h5 className=''>2.	{t('desc2')}</h5>
      <h5 className='mt-3'>3.	{t('desc3')}</h5>
      <ul className='fs-5 mt-3 mb-3 pb-3'>
        {t.raw('items2').map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h5 className='mt-3'>4.	{t('desc4')}</h5>
      <ul className='fs-5 mt-3 mb-5 pb-5'>
        {t.raw('items4').map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h4>{t('title2')}</h4>
      <h5 className='mt-3'>1.	{t('desc5')}</h5>
      <h5 className='mt-3'>2.	{t('desc6')}</h5>
      <h5 className='mt-3 mb-5 pb-5'>3.	{t('desc7')}</h5>
    </div>
  )
}

export default RefundPolicy