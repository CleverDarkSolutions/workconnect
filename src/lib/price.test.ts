import { describe, expect, it } from "vitest"

import {
  deriveGrossInput,
  deriveNetInput,
  formatAmount,
  grossFromNet,
  netFromGross,
  parseAmount,
  roundMoney,
} from "@/lib/price"

describe("roundMoney", () => {
  it("rounds to two decimals", () => {
    expect(roundMoney(12.345)).toBe(12.35)
    expect(roundMoney(12.344)).toBe(12.34)
  })

  it("avoids binary float artifacts", () => {
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(8.675)).toBe(8.68)
  })

  it("stays finite for values that stringify in exponent notation", () => {
    expect(roundMoney(1e21) / 1e21).toBeCloseTo(1, 10)
    expect(roundMoney(1e-7)).toBe(0)
  })
})

describe("grossFromNet / netFromGross", () => {
  it("applies brutto = netto × (1 + VAT / 100)", () => {
    expect(grossFromNet(100, 23)).toBe(123)
    expect(grossFromNet(100, 8)).toBe(108)
    expect(grossFromNet(100, 0)).toBe(100)
  })

  it("inverts the formula", () => {
    expect(netFromGross(123, 23)).toBe(100)
    expect(netFromGross(9999, 23)).toBe(8129.27)
  })

  it("rounds the derived amount only", () => {
    expect(grossFromNet(0.1 + 0.2, 23)).toBe(0.37)
  })
})

describe("parseAmount", () => {
  it("accepts dot and comma decimals", () => {
    expect(parseAmount("12.5")).toBe(12.5)
    expect(parseAmount("12,50")).toBe(12.5)
    expect(parseAmount(" 7 ")).toBe(7)
  })

  it("rejects anything that is not a non-negative amount", () => {
    expect(parseAmount("")).toBeNull()
    expect(parseAmount("abc")).toBeNull()
    expect(parseAmount("-5")).toBeNull()
    expect(parseAmount("1.2.3")).toBeNull()
  })
})

describe("input derivation", () => {
  it("derives the linked input as a two-decimal string", () => {
    expect(deriveGrossInput("100", "23")).toBe("123.00")
    expect(deriveNetInput("123", "23")).toBe("100.00")
    expect(formatAmount(5)).toBe("5.00")
  })

  it("clears the linked input when the source cannot be parsed", () => {
    expect(deriveGrossInput("", "23")).toBe("")
    expect(deriveGrossInput("abc", "23")).toBe("")
    expect(deriveNetInput("10", "")).toBe("")
  })
})
