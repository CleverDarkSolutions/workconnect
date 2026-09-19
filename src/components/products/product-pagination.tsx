import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

type ProductPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function ProductPagination({ page, pageCount, onPageChange }: ProductPaginationProps) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <Pagination aria-label="Paginacja" className="mx-0 w-auto justify-end">
      <PaginationContent className="gap-2">
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
            Wstecz
          </Button>
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <Button
              variant={pageNumber === page ? "default" : "ghost"}
              size="icon"
              className="rounded-md"
              aria-label={`Strona ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Dalej
            <ChevronRightIcon />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
