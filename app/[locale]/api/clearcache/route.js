import { revalidateTag } from "next/cache";

export async function GET(request) {
  // Revalidate multiple tags
  revalidateTag("products");
  revalidateTag("blogs");
  revalidateTag("blogSEO");
  revalidateTag("categories");
  revalidateTag("categorySEO");
  revalidateTag("subCategories");
  revalidateTag("subcategorySEO");
  revalidateTag("giftSets");
  revalidateTag("productSEO");

  return Response.json({ revalidated: true });
}