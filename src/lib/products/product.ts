import type { ProductInput } from "@/lib/schemas/product-form"

export type Product = ProductInput & { id: string }

export const PRODUCTS_PER_PAGE = 5

/** Unique enough for an in-memory catalog; works over plain HTTP too, unlike `crypto.randomUUID`. */
export function createProductId(): string {
  return `product-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
