/**
 * product-category/layout.jsx
 *
 * Thin layout shell for product-category routes.
 * Header14, Footer14, and MobileFooter2 are now mounted in the ROOT
 * layout (app/[locale]/layout.jsx) so they are ALWAYS persistent across
 * every page transition.
 *
 * This file exists so that loading.jsx (skeleton) and page.jsx share
 * the same Suspense boundary — Next.js requires a layout at this level
 * for the loading.jsx convention to work correctly.
 */
export default function ProductCategoryLayout({ children }) {
  return <>{children}</>;
}
