import { AvailabilityBadge } from "@/components/products/availability-badge"
import { formatPrice, formatStock } from "@/lib/format"
import type { Product } from "@/lib/products/product"

type ProductCardListProps = {
  products: readonly Product[]
}

/** Mobile layout of the catalog: one card per product, as in the Figma phone frame. */
export function ProductCardList({ products }: ProductCardListProps) {
  return (
    <ul className="flex flex-col gap-3 p-4">
      {products.map((product) => (
        <li key={product.id} className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-base font-medium">{product.name}</span>
              <span className="text-xs text-muted-foreground">{product.sku}</span>
            </div>
            <AvailabilityBadge isAvailable={product.isAvailable} />
          </div>
          <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Kategoria</dt>
              <dd>{product.category}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Cena brutto</dt>
              <dd className="font-medium whitespace-nowrap">
                {formatPrice(product.priceGross, product.currency)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Magazyn</dt>
              <dd>{formatStock(product.stockQuantity)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}
