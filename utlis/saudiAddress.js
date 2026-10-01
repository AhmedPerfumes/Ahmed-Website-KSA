/**
 * Saudi Address Pro Utility
 * Connects to Laravel backend proxy (/api/address/lookup & /api/address/search)
 */

export const isValidShortAddress = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Za-z]{4}[0-9]{4}$/.test(code.trim());
};

/**
 * Format address components into a clean street/building address line.
 */
export const formatAddressFromSaudiPro = (data, locale = 'en') => {
  if (!data) return '';
  const isAr = locale === 'ar';
  const parts = [];

  if (data.buildingNumber) {
    parts.push(`${isAr ? 'مبنى' : 'Building'} ${data.buildingNumber}`);
  }
  if (data.street) {
    parts.push(data.street);
  }
  if (data.district) {
    parts.push(data.district);
  }

  return parts.filter(Boolean).join(', ');
};

/**
 * Lookup by 8-character Saudi National Short Address code (e.g. RCTB4359).
 */
export const lookupShortAddress = async (shortAddress, locale = 'en') => {
  const code = (shortAddress || '').trim().toUpperCase();
  if (!isValidShortAddress(code)) {
    return {
      isValid: false,
      message: locale === 'ar'
        ? 'رمز العنوان الوطني غير صحيح (يجب أن يكون 4 أحرف و 4 أرقام مثل RCTB4359)'
        : 'Invalid Short National Address. Enter 4 letters followed by 4 numbers (e.g. RCTB4359).'
    };
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${apiBase}api/address/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shortAddress: code,
        language: locale === 'ar' ? 'ar' : 'en',
      }),
    });

    const data = await res.json();
    if (res.ok && (data.isValid || data.city)) {
      return {
        isValid: true,
        shortAddress: code,
        buildingNumber: data.buildingNumber || '',
        street: data.street || '',
        district: data.district || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        additionalNumber: data.additionalNumber || '',
        formattedAddress: data.formattedAddress || formatAddressFromSaudiPro(data, locale),
        raw: data,
      };
    }

    return {
      isValid: false,
      message: data.message || (locale === 'ar' ? 'لم يتم العثور على العنوان، يرجى كتابته يدوياً' : 'Address not found. Please enter details manually.'),
    };
  } catch (err) {
    console.error('Saudi address lookup error:', err);
    return {
      isValid: false,
      message: locale === 'ar'
        ? 'تعذر التحقق التلقائي، يمكنك إكمال العنوان يدوياً'
        : 'Could not verify automatically. You can fill in the address manually.',
    };
  }
};

/**
 * Search addresses by query string (autocomplete).
 */
export const searchSaudiAddress = async (query, locale = 'en', limit = 5) => {
  const q = (query || '').trim();
  if (q.length < 2) return { status: true, data: [] };

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    const lang = locale === 'ar' ? 'ar' : 'en';
    const res = await fetch(`${apiBase}api/address/search?q=${encodeURIComponent(q)}&language=${lang}&limit=${limit}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Saudi address search error:', err);
    return { status: false, data: [] };
  }
};
