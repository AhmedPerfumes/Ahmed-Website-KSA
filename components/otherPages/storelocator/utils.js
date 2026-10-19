export const COUNTRY_META = {
  SA: {
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    shortName: "KSA",
    shortNameAr: "السعودية",
    flag: "🇸🇦",
    flagUrl: "https://flagcdn.com/w40/sa.png",
    dialCode: "+966",
  },
  AE: {
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    shortName: "UAE",
    shortNameAr: "الإمارات",
    flag: "🇦🇪",
    flagUrl: "https://flagcdn.com/w40/ae.png",
    dialCode: "+971",
  },
  BH: {
    name: "Bahrain",
    nameAr: "البحرين",
    shortName: "Bahrain",
    shortNameAr: "البحرين",
    flag: "🇧🇭",
    flagUrl: "https://flagcdn.com/w40/bh.png",
    dialCode: "+973",
  },
  OM: {
    name: "Oman",
    nameAr: "سلطنة عمان",
    shortName: "Oman",
    shortNameAr: "عُمان",
    flag: "🇴🇲",
    flagUrl: "https://flagcdn.com/w40/om.png",
    dialCode: "+968",
  },
  QA: {
    name: "Qatar",
    nameAr: "قطر",
    shortName: "Qatar",
    shortNameAr: "قطر",
    flag: "🇶🇦",
    flagUrl: "https://flagcdn.com/w40/qa.png",
    dialCode: "+974",
  },
  KW: {
    name: "Kuwait",
    nameAr: "الكويت",
    shortName: "Kuwait",
    shortNameAr: "الكويت",
    flag: "🇰🇼",
    flagUrl: "https://flagcdn.com/w40/kw.png",
    dialCode: "+965",
  },
};

/**
 * Returns the flagcdn image URL for a given country code (ISO 3166-1 alpha-2).
 */
export function getCountryFlagUrl(countryCode) {
  if (!countryCode) return null;
  const code = countryCode.toLowerCase().trim();
  return `https://flagcdn.com/w40/${code}.png`;
}

/**
 * Formats a phone number to an international tel: URI based on the store's country code.
 * Drops leading national trunk '0' and attaches country dialing code.
 * 
 * Example:
 * formatTelUri("06 742 0602", "AE") -> "tel:+97167420602"
 * formatTelUri("056 082 8191", "SA") -> "tel:+966560828191"
 */
export function formatTelUri(phone, countryCode) {
  if (!phone) return "";
  let clean = phone.replace(/[^\d+]/g, "");

  if (clean.startsWith("+")) {
    return `tel:${clean}`;
  }
  if (clean.startsWith("00")) {
    return `tel:+${clean.slice(2)}`;
  }

  const code = (countryCode || "").toUpperCase();
  const dialCode = COUNTRY_META[code]?.dialCode;

  if (!dialCode) {
    return `tel:${clean}`;
  }

  const dialDigits = dialCode.replace("+", "");

  // If number already contains country dialing digits (e.g. 97167420602)
  if (clean.startsWith(dialDigits)) {
    return `tel:+${clean}`;
  }

  // Drop national trunk prefix (0) if present (e.g. 06 742 0602 -> +97167420602)
  if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }

  return `tel:${dialCode}${clean}`;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
