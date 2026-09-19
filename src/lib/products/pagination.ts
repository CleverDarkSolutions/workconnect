export function getPageCount(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize))
}

/** Keeps a page number coming from the URL inside the valid range. */
export function clampPage(page: number, pageCount: number): number {
  if (!Number.isInteger(page)) return 1
  return Math.min(Math.max(page, 1), pageCount)
}

export function getPageItems<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
