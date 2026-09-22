export const MANUFACTURERS = [
  "Apple",
  "Samsung",
  "Sony",
  "Bosch",
  "Xiaomi",
  "Dyson",
  "Lenovo",
] as const

export const CATEGORIES = [
  "Komputery",
  "Telefony",
  "RTV",
  "AGD",
  "Akcesoria",
] as const

export const PRODUCT_FEATURES = [
  "Bluetooth",
  "WiFi",
  "USB-C",
  "Wodoodporny",
  "Bezprzewodowy",
  "Ekologiczny",
  "Premium",
] as const

/** VAT rates in percent, kept as strings because they are `<Select>` values. */
export const VAT_RATES = ["23", "8", "5", "0"] as const

export const CURRENCIES = ["PLN", "EUR", "USD"] as const

export type Manufacturer = (typeof MANUFACTURERS)[number]
export type Category = (typeof CATEGORIES)[number]
export type ProductFeature = (typeof PRODUCT_FEATURES)[number]
export type VatRate = (typeof VAT_RATES)[number]
export type Currency = (typeof CURRENCIES)[number]
