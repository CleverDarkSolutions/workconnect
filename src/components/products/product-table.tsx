import { AvailabilityBadge } from "@/components/products/availability-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice, formatStock } from "@/lib/format"
import type { Product } from "@/lib/products/product"

type ProductTableProps = {
  products: readonly Product[]
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[29%]">Nazwa</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Kategoria</TableHead>
          <TableHead>Cena Brutto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Magazyn</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="truncate font-medium" title={product.name}>
              {product.name}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{product.sku}</TableCell>
            <TableCell className="text-muted-foreground">{product.category}</TableCell>
            <TableCell className="font-medium">
              {formatPrice(product.priceGross, product.currency)}
            </TableCell>
            <TableCell>
              <AvailabilityBadge isAvailable={product.isAvailable} />
            </TableCell>
            <TableCell>{formatStock(product.stockQuantity)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
