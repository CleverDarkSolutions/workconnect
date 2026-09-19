import { describe, expect, it } from "vitest"

import { formatPrice, formatProductCount, formatStock } from "@/lib/format"

describe("format helpers", () => {
  it("formats prices with a decimal comma and the currency", () => {
    expect(formatPrice(9999, "PLN")).toBe("9999,00 PLN")
    expect(formatPrice(179.5, "EUR")).toBe("179,50 EUR")
  })

  it("shows a dash for untracked stock", () => {
    expect(formatStock(null)).toBe("—")
    expect(formatStock(0)).toBe("0")
  })

  it("pluralizes product counts in Polish", () => {
    expect(formatProductCount(1)).toBe("1 produkt")
    expect(formatProductCount(3)).toBe("3 produkty")
    expect(formatProductCount(7)).toBe("7 produktów")
    expect(formatProductCount(22)).toBe("22 produkty")
  })
})
