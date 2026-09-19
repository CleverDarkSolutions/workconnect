import type { ProductInput } from "@/lib/schemas/product-form"

export type Product = ProductInput & { id: string }

export const PRODUCTS_PER_PAGE = 5
