import { describe, expect, it } from "vitest"

import { clampPage, getPageCount, getPageItems } from "@/lib/products/pagination"

describe("pagination helpers", () => {
  it("counts pages, with at least one page for an empty list", () => {
    expect(getPageCount(0, 5)).toBe(1)
    expect(getPageCount(5, 5)).toBe(1)
    expect(getPageCount(7, 5)).toBe(2)
  })

  it("clamps out-of-range and malformed URL pages", () => {
    expect(clampPage(0, 2)).toBe(1)
    expect(clampPage(9, 2)).toBe(2)
    expect(clampPage(Number.NaN, 2)).toBe(1)
    expect(clampPage(2, 2)).toBe(2)
  })

  it("slices the items of a page", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"]
    expect(getPageItems(items, 1, 5)).toEqual(["a", "b", "c", "d", "e"])
    expect(getPageItems(items, 2, 5)).toEqual(["f", "g"])
  })
})
