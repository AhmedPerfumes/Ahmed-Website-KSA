/**
 * Sanitizes strings for use in URLs and UI, removing special characters and standardizing formats.
 */

export const removeSpecialCharactersAndAmp = (str) => {
    if (!str) return "";
    // Remove the specific word "&amp;" or the character "&"
    let cleanedStr = str.replace(/&amp;/g, "").replace(/&/g, "");

    // Remove all special characters except alphanumeric, spaces, and hyphens
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, "");

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, " ").trim();

    return cleanedStr;
};

export const sanitizeUrlParam = (str) => {
    if (!str) return "";
    return removeSpecialCharactersAndAmp(str)
        .split(" ")
        .join("-")
        .toLowerCase();
};

export const capitalizeEachWord = (str) => {
    if (!str) return "";
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const formatPrice = (price, currency) => {
    if (!price || !currency) return "";
    return `${parseFloat(price).toFixed(currency.decimals || 2)}${currency.symbol}`;
};
