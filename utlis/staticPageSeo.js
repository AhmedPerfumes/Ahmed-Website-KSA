import { headers } from "next/headers";

function getRequestOrigin() {
  try {
    const headersList = headers();
    const host = headersList.get("host") || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN;
    const protocol = headersList.get("x-forwarded-proto") || "https";
    return `${protocol}://${host}`;
  } catch (e) {
    return process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "https://ksa.ahmedalmaghribi.com";
  }
}

export async function getStaticPageSEO(pageKey) {
  try {
    const origin = getRequestOrigin();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ksaadmin.ahmedalmaghribi.com/";
    const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;

    const response = await fetch(`${normalizedApiUrl}api/staticPageSEO`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: origin,
      },
      body: JSON.stringify({ page: pageKey }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch static page SEO for ${pageKey}:`, error);
    return null;
  }
}
