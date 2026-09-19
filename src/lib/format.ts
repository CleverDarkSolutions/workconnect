const amountFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

const productPlural = new Intl.PluralRules("pl-PL")

/** "9999,00 PLN" — Polish decimal comma, no grouping, as in the design. */
export function formatPrice(amount: number, currency: string): string {
  return `${amountFormatter.format(amount)} ${currency}`
}

/** "—" for products without a tracked stock level. */
export function formatStock(stockQuantity: number | null): string {
  return stockQuantity === null ? "—" : String(stockQuantity)
}

const PRODUCT_FORMS: Record<Intl.LDMLPluralRule, string> = {
  zero: "produktów",
  one: "produkt",
  two: "produkty",
  few: "produkty",
  many: "produktów",
  other: "produktów",
}

/** "1 produkt", "3 produkty", "7 produktów". */
export function formatProductCount(count: number): string {
  return `${count} ${PRODUCT_FORMS[productPlural.select(count)]}`
}
