import { ProductsPage } from "@/components/products/products-page"

/**
 * Rendered per request rather than prerendered: the catalog depends on the
 * `?page` search param, and rendering it on the server puts the rows in the
 * HTML instead of leaving a blank page until hydration (Lighthouse mobile LCP
 * went from ~3.1 s to well under 1 s on the simulated slow connection).
 */
export const dynamic = "force-dynamic"

export default function HomePage() {
  return <ProductsPage />
}
