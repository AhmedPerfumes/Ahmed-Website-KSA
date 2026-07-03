/**
 * ProductSchema — JSON-LD Structured Data
 *
 * Injects Product schema for Google rich results.
 * Server-rendered by default (no "use client" directive).
 *
 * Schema includes:
 *   - Product (name, image, description, sku, brand)
 *   - Offer (price, currency, availability, shipping)
 *   - AggregateRating (if reviews exist)
 *
 * API fields:
 *   product_name, product_id, price, discount,
 *   images, product_qty, description, average_rating, review_count
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getEffectivePrice = (product) => {
  const now = new Date();
  const d = product?.discount;
  if (d && new Date(d.start_date) <= now && new Date(d.end_date) >= now) {
    if (d.discount_type === "percent") {
      return (product.price - (product.price * d.value) / 100).toFixed(2);
    }
    if (d.discount_type === "amount" && d.final_price) {
      return parseFloat(d.final_price).toFixed(2);
    }
  }
  return parseFloat(product?.price || 0).toFixed(2);
};

const ProductSchema = ({ product, canonicalUrl, reviews = [] }) => {
  if (!product?.product_id) return null;

  const images = product?.images
    ? typeof product.images === "string"
      ? JSON.parse(product.images)
      : product.images
    : [];

  const imageUrls = images.map((img) => `${API_URL}storage/${img}`);

  const effectivePrice = getEffectivePrice(product);
  const inStock = product.product_qty > 0;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + (r.star || 0), 0) / reviews.length).toFixed(1)
    : product?.average_rating || null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    image: imageUrls,
    description: product.description || `${product.product_name} — A luxury fragrance by Ahmed Al Maghribi Perfumes.`,
    sku: String(product.product_id),
    brand: {
      "@type": "Brand",
      name: "Ahmed Al Maghribi Perfumes",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl || "",
      priceCurrency: "SAR",
      price: effectivePrice,
      priceValidUntil: product?.discount?.end_date
        ? new Date(product.discount.end_date).toISOString().split("T")[0]
        : undefined,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Ahmed Al Maghribi Perfumes",
      },
    },
    ...(avgRating && reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: String(reviews.length),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: String(r.star),
              bestRating: "5",
            },
            author: {
              "@type": "Person",
              name: r.customer_name || "Verified Buyer",
            },
            reviewBody: r.comment,
            datePublished: r.created_at?.split("T")[0] || undefined,
          })),
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ProductSchema;
