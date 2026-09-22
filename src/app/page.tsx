import { ProductsPage } from "@/components/products/products-page"

/**
 * The catalog reads the `?page` search param, which opts the route out of
 * static prerendering. Rendering it per request ships the rows in the HTML
 * instead of a blank page that fills in on hydration.
 */
export const dynamic = "force-dynamic"

export default function HomePage() {
  return <ProductsPage />
}
