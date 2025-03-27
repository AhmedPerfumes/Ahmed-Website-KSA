import React from "react";
import { useTranslations } from "next-intl";

export default function Description({ product_name }) {
  const t = useTranslations();
  function cleanProductName(productName) {
    // Step 1: Remove any non-alphanumeric characters except for spaces
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, '') + ' Content';
  
    // Step 2: Words to remove
    const wordsToRemove = ['&', ' &', '& ', ' & ', 'amp', ' amp', 'amp ', ' amp ', ';', ' ;', '; ', ' ; '];
  
    // Step 3: Remove the words from the dynamic key (case insensitive)
    let cleanString = dynamicKey;
    wordsToRemove.forEach(word => {
      const regex = new RegExp(word, 'gi'); // 'gi' for global and case-insensitive replacement
      cleanString = cleanString.replace(regex, '');
    });
  
    // Step 4: Replace multiple spaces with a single space
    cleanString = cleanString.replace(/\s+/g, ' ').trim(); // Trim to remove leading/trailing spaces
  
    return cleanString;
  }
  return (
    <div className="product-single__description">
      <div dangerouslySetInnerHTML={{ __html: t.raw(cleanProductName(product_name)) }}></div>
    </div>
  );
}
