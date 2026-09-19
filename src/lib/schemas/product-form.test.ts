import { describe, expect, it } from "vitest"

import {
  availabilitySchema,
  basicInfoSchema,
  pricingSchema,
  productFormDefaultValues,
  productFormSchema,
  productSchema,
  type ProductFormValues,
} from "@/lib/schemas/product-form"

const validValues: ProductFormValues = {
  ...productFormDefaultValues,
  name: "MacBook Pro 14",
  sku: "MBP14M3PRO",
  manufacturer: "Apple",
  category: "Komputery",
  features: ["WiFi", "USB-C"],
  priceNet: "100",
  priceGross: "123.00",
}

/** Maps Zod issues to `{ "field.path": "message" }` for compact assertions. */
function issuesOf(result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message])
  )
}

describe("basicInfoSchema", () => {
  it("requires a name of at least 3 characters", () => {
    expect(issuesOf(basicInfoSchema.safeParse({ ...validValues, name: "" }))).toMatchObject({
      name: "Podaj nazwę produktu",
    })
    expect(issuesOf(basicInfoSchema.safeParse({ ...validValues, name: "ab" }))).toMatchObject({
      name: "Nazwa musi mieć co najmniej 3 znaki",
    })
  })

  it("restricts SKU to letters and digits, max 24 characters", () => {
    expect(issuesOf(basicInfoSchema.safeParse({ ...validValues, sku: "MBP-14" }))).toMatchObject({
      sku: "SKU może zawierać tylko litery i cyfry",
    })
    expect(issuesOf(basicInfoSchema.safeParse({ ...validValues, sku: "A".repeat(25) }))).toMatchObject({
      sku: "SKU może mieć maksymalnie 24 znaki",
    })
    expect(basicInfoSchema.safeParse({ ...validValues, sku: "A".repeat(24) }).success).toBe(true)
  })

  it("treats description as optional", () => {
    expect(basicInfoSchema.safeParse({ ...validValues, description: "" }).success).toBe(true)
  })

  it("requires a manufacturer, a category and at least one feature", () => {
    expect(
      issuesOf(
        basicInfoSchema.safeParse({ ...validValues, manufacturer: "", category: "", features: [] })
      )
    ).toEqual({
      manufacturer: "Wybierz producenta",
      category: "Wybierz kategorię",
      features: "Wybierz co najmniej jedną cechę",
    })
  })
})

describe("pricingSchema", () => {
  it("parses amounts and the VAT rate into numbers", () => {
    expect(pricingSchema.parse(validValues)).toEqual({
      priceNet: 100,
      priceGross: 123,
      vatRate: 23,
      currency: "PLN",
    })
  })

  it("stores typed amounts rounded to two decimals", () => {
    expect(pricingSchema.parse({ ...validValues, priceNet: "10.005", priceGross: "12,3" })).toMatchObject({
      priceNet: 10.01,
      priceGross: 12.3,
    })
  })

  it("reports empty and malformed amounts on the right field", () => {
    expect(
      issuesOf(pricingSchema.safeParse({ ...validValues, priceNet: "", priceGross: "12,x" }))
    ).toEqual({
      priceNet: "Podaj cenę netto",
      priceGross: "Podaj poprawną kwotę, np. 199.99",
    })
  })
})

describe("availabilitySchema", () => {
  it("ignores stock quantity for unlimited products", () => {
    expect(
      availabilitySchema.safeParse({ ...validValues, isLimited: false, stockQuantity: "" }).success
    ).toBe(true)
  })

  it("requires a non-negative integer stock quantity for limited products", () => {
    expect(
      issuesOf(availabilitySchema.safeParse({ ...validValues, isLimited: true, stockQuantity: "" }))
    ).toEqual({ stockQuantity: "Podaj ilość na magazynie" })
    expect(
      issuesOf(availabilitySchema.safeParse({ ...validValues, isLimited: true, stockQuantity: "-1" }))
    ).toEqual({ stockQuantity: "Podaj nieujemną liczbę całkowitą" })
    expect(
      issuesOf(availabilitySchema.safeParse({ ...validValues, isLimited: true, stockQuantity: "1.5" }))
    ).toEqual({ stockQuantity: "Podaj nieujemną liczbę całkowitą" })
    expect(
      availabilitySchema.safeParse({ ...validValues, isLimited: true, stockQuantity: "0" }).success
    ).toBe(true)
  })

  it("rejects a minimum cart quantity above the maximum, on both fields", () => {
    expect(
      issuesOf(
        availabilitySchema.safeParse({ ...validValues, minCartQuantity: "5", maxCartQuantity: "2" })
      )
    ).toEqual({
      minCartQuantity: "Minimalna ilość nie może być większa niż maksymalna",
      maxCartQuantity: "Maksymalna ilość nie może być mniejsza niż minimalna",
    })
    expect(
      availabilitySchema.safeParse({ ...validValues, minCartQuantity: "2", maxCartQuantity: "2" })
        .success
    ).toBe(true)
  })

  it("still reports the stock rule when a cart quantity is malformed", () => {
    expect(
      issuesOf(
        availabilitySchema.safeParse({
          ...validValues,
          isLimited: true,
          stockQuantity: "",
          minCartQuantity: "x",
        })
      )
    ).toEqual({
      minCartQuantity: "Podaj nieujemną liczbę całkowitą",
      stockQuantity: "Podaj ilość na magazynie",
    })
  })
})

describe("productFormSchema (per-step gating)", () => {
  it("only validates step 1 fields while on step 1", () => {
    const result = productFormSchema.safeParse({
      ...productFormDefaultValues,
      step: 1,
      name: "MacBook",
      sku: "MBP",
      manufacturer: "Apple",
      category: "Komputery",
      features: ["WiFi"],
    })
    expect(result.success).toBe(true)
  })

  it("validates steps 1 and 2 on step 2", () => {
    expect(issuesOf(productFormSchema.safeParse({ ...validValues, step: 2, priceNet: "" }))).toEqual({
      priceNet: "Podaj cenę netto",
    })
  })

  it("validates everything on step 3", () => {
    expect(
      issuesOf(
        productFormSchema.safeParse({
          ...validValues,
          step: 3,
          name: "",
          isLimited: true,
          stockQuantity: "",
        })
      )
    ).toEqual({
      name: "Podaj nazwę produktu",
      stockQuantity: "Podaj ilość na magazynie",
    })
  })
})

describe("productSchema", () => {
  it("produces the stored product shape", () => {
    expect(productSchema.parse({ ...validValues, isLimited: true, stockQuantity: "12" })).toEqual({
      name: "MacBook Pro 14",
      sku: "MBP14M3PRO",
      description: "",
      manufacturer: "Apple",
      category: "Komputery",
      features: ["WiFi", "USB-C"],
      priceNet: 100,
      priceGross: 123,
      vatRate: 23,
      currency: "PLN",
      isAvailable: true,
      isLimited: true,
      stockQuantity: 12,
      minCartQuantity: 1,
      maxCartQuantity: 10,
    })
  })

  it("stores no stock quantity for unlimited products", () => {
    expect(productSchema.parse({ ...validValues, stockQuantity: "999" }).stockQuantity).toBeNull()
  })
})
