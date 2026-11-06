"use client";

import { useTranslations } from "next-intl";

// Official National Address WhatsApp service — sends "العنوان الوطني" to start the chat
export const NATIONAL_ADDRESS_WHATSAPP_URL =
  "https://wa.me/966112898888?text=%D8%A7%D9%84%D8%B9%D9%86%D9%88%D8%A7%D9%86%20%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A";

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0, verticalAlign: "-3px", marginInlineEnd: "4px" }}>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.22 4.25-9.46 9.48-9.46 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.69c0 5.22-4.25 9.47-9.47 9.47zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
  </svg>
);

/**
 * "Don't know your national address? Get it easily via WhatsApp (click here)"
 * Shown under every Short National Address field (checkout + account addresses).
 */
export default function NationalAddressWhatsApp({ style }) {
  const t = useTranslations("NationalAddressHelp");
  return (
    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", lineHeight: 1.5, color: "#555", ...style }}>
      {t.rich("text", {
        link: (chunks) => (
          <a
            href={NATIONAL_ADDRESS_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1faa53", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap", marginInlineStart: "2px" }}
          >
            <WhatsAppIcon />
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}
