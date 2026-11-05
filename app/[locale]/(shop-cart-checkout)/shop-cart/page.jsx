import { redirect } from "next/navigation";

// The cart is now the slide-out cart drawer. Old links, emails and ads that point to
// /shop-cart land on the homepage with the drawer opened (CartDrawer reads ?cart=open).
// Rollback: render <CartPageClassic /> from "@/components/shopCartandCheckout/CartPageClassic".
export const metadata = { robots: { index: false, follow: true } };

export default function ShopCartRedirect({ params }) {
  const locale = params?.locale || "en";
  redirect(`/${locale}?cart=open`);
}
