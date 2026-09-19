import { Suspense } from "react"

import { ProductsPage } from "@/components/products/products-page"

export default function HomePage() {
  return (
    // `useQueryState` reads the URL on the client, which needs a Suspense boundary during prerendering.
    <Suspense>
      <ProductsPage />
    </Suspense>
  )
}
