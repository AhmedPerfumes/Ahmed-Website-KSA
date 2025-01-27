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
      {/* <h3 className="block-title mb-4 text-white">
        Sed do eiusmod tempor incididunt ut labore
      </h3>
      <p className="content">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus
        error sit voluptatem accusantium doloremque laudantium, totam rem
        aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
        beatae vitae dicta sunt explicabo.
      </p>
      <div className="row">
        <div className="col-lg-6">
          <h3 className="block-title">Why choose product?</h3>
          <ul className="list text-list">
            <li>Creat by cotton fibric with soft and smooth</li>
            <li>Simple, Configurable (e.g. size, color, etc.), bundled</li>
            <li>Downloadable/Digital Products, Virtual Products</li>
          </ul>
        </div>
        <div className="col-lg-6">
          <h3 className="block-title">Sample Number List</h3>
          <ol className="list text-list">
            <li>Create Store-specific attrittbutes on the fly</li>
            <li>Simple, Configurable (e.g. size, color, etc.), bundled</li>
            <li>Downloadable/Digital Products, Virtual Products</li>
          </ol>
        </div>
      </div>
      <h3 className="block-title mb-0">Lining</h3>
      <p className="content">100% Polyester, Main: 100% Polyester.</p> */}
      <div dangerouslySetInnerHTML={{ __html: t.raw(cleanProductName(product_name)) }}></div>
    </div>
  );
}
