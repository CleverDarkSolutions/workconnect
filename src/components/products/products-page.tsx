"use client"

import { PlusIcon } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { useState } from "react"
import { toast } from "sonner"

import { ProductFormDialog } from "@/components/product-form/product-form-dialog"
import { ProductCardList } from "@/components/products/product-card-list"
import { ProductPagination } from "@/components/products/product-pagination"
import { ProductTable } from "@/components/products/product-table"
import { Button } from "@/components/ui/button"
import { formatProductCount } from "@/lib/format"
import { MOCK_PRODUCTS } from "@/lib/products/mock-products"
import { clampPage, getPageCount, getPageItems } from "@/lib/products/pagination"
import { createProductId, PRODUCTS_PER_PAGE, type Product } from "@/lib/products/product"
import type { ProductInput } from "@/lib/schemas/product-form"

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  // The page lives in the URL (`?page=2`), so a reload lands on the same page.
  const [pageParam, setPageParam] = useQueryState("page", parseAsInteger.withDefault(1))

  const pageCount = getPageCount(products.length, PRODUCTS_PER_PAGE)
  const page = clampPage(pageParam, pageCount)
  const visibleProducts = getPageItems(products, page, PRODUCTS_PER_PAGE)

  function addProduct(input: ProductInput) {
    setProducts((current) => [...current, { ...input, id: createProductId() }])
    toast.success("Produkt został dodany")
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-6 sm:px-[100px] sm:pt-12 sm:pb-14">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Produkty</h1>
          <p className="text-sm text-muted-foreground">
            {formatProductCount(products.length)} w katalogu
          </p>
        </div>
        <ProductFormDialog
          trigger={
            <Button>
              <PlusIcon />
              Dodaj produkt
            </Button>
          }
          onSubmit={addProduct}
        />
      </header>

      <section aria-label="Katalog produktów" className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden md:block">
          <ProductTable products={visibleProducts} />
        </div>
        <div className="md:hidden">
          <ProductCardList products={visibleProducts} />
        </div>
        <footer className="flex flex-col items-center gap-3 border-t bg-muted/50 px-4 py-4 sm:h-16 sm:flex-row sm:justify-between sm:py-0">
          <p className="text-xs text-muted-foreground">
            Strona {page} z {pageCount} · {formatProductCount(products.length)}
          </p>
          <ProductPagination page={page} pageCount={pageCount} onPageChange={setPageParam} />
        </footer>
      </section>
    </main>
  )
}
