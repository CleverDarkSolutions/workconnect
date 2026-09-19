import { z } from "zod"

import { parseAmount } from "@/lib/price"
import {
  CATEGORIES,
  CURRENCIES,
  MANUFACTURERS,
  PRODUCT_FEATURES,
  VAT_RATES,
} from "@/lib/products/product-options"

export const FORM_STEPS = [1, 2, 3] as const
export type FormStep = (typeof FORM_STEPS)[number]

/**
 * Raw shape of the form state — exactly what the inputs hold. Numeric inputs
 * are strings here; the step schemas below parse them into numbers.
 */
const formValuesSchema = z.object({
  step: z.literal(FORM_STEPS),
  name: z.string(),
  sku: z.string(),
  description: z.string(),
  manufacturer: z.string(),
  category: z.string(),
  features: z.array(z.string()),
  priceNet: z.string(),
  priceGross: z.string(),
  vatRate: z.string(),
  currency: z.string(),
  isAvailable: z.boolean(),
  isLimited: z.boolean(),
  stockQuantity: z.string(),
  minCartQuantity: z.string(),
  maxCartQuantity: z.string(),
})

export type ProductFormValues = z.infer<typeof formValuesSchema>

export const productFormDefaultValues: ProductFormValues = {
  step: 1,
  name: "",
  sku: "",
  description: "",
  manufacturer: "",
  category: "",
  features: [],
  priceNet: "",
  priceGross: "",
  vatRate: "23",
  currency: "PLN",
  isAvailable: true,
  isLimited: false,
  stockQuantity: "",
  minCartQuantity: "1",
  maxCartQuantity: "10",
}

/** Upper bounds keep every stored number inside exact double precision. */
export const MAX_AMOUNT = 999_999_999.99
export const MAX_QUANTITY = 999_999_999

const INTEGER_PATTERN = /^\d+$/

/** `<Select>` value that must be one of the predefined options ("" means nothing chosen). */
const requiredChoice = <const T extends readonly [string, ...string[]]>(
  options: T,
  message: string
) => z.string().pipe(z.enum(options, { error: message }))

type Parsed<T> = { value: T } | { message: string }

/** Parses a typed amount ("199.99", "199,99"), or explains why it is not acceptable. */
function parseAmountInput(input: string, requiredMessage: string): Parsed<number> {
  if (input.trim() === "") return { message: requiredMessage }
  const amount = parseAmount(input)
  if (amount === null) return { message: "Podaj poprawną kwotę, np. 199.99" }
  if (amount > MAX_AMOUNT) return { message: "Kwota jest zbyt duża" }
  return { value: amount }
}

/** Parses a typed quantity (non-negative integer), or explains why it is not acceptable. */
function parseQuantityInput(input: string, requiredMessage: string): Parsed<number> {
  const trimmed = input.trim()
  if (trimmed === "") return { message: requiredMessage }
  if (!INTEGER_PATTERN.test(trimmed)) return { message: "Podaj nieujemną liczbę całkowitą" }
  const quantity = Number(trimmed)
  if (quantity > MAX_QUANTITY) return { message: "Wartość jest zbyt duża" }
  return { value: quantity }
}

const numberField = (parse: (input: string) => Parsed<number>) =>
  z.string().transform((input, ctx) => {
    const parsed = parse(input)
    if ("message" in parsed) {
      ctx.addIssue({ code: "custom", message: parsed.message })
      return z.NEVER
    }
    return parsed.value
  })

const amountField = (requiredMessage: string) =>
  numberField((input) => parseAmountInput(input, requiredMessage))

const integerField = (requiredMessage: string) =>
  numberField((input) => parseQuantityInput(input, requiredMessage))

// ---------------------------------------------------------------------------
// Step 1 — Informacje podstawowe
// ---------------------------------------------------------------------------

const SKU_PATTERN = /^[a-zA-Z0-9]+$/
const SKU_MAX_LENGTH = 24

export const basicInfoSchema = z.object({
  name: z.string().trim().min(3, {
    error: (issue) =>
      issue.input === "" ? "Podaj nazwę produktu" : "Nazwa musi mieć co najmniej 3 znaki",
  }),
  // One message at a time, in order of what the user most likely needs to hear.
  sku: z
    .string()
    .trim()
    .superRefine((sku, ctx) => {
      if (sku === "") {
        ctx.addIssue({ code: "custom", message: "Podaj SKU produktu" })
      } else if (sku.length > SKU_MAX_LENGTH) {
        ctx.addIssue({ code: "custom", message: "SKU może mieć maksymalnie 24 znaki" })
      } else if (!SKU_PATTERN.test(sku)) {
        ctx.addIssue({ code: "custom", message: "SKU może zawierać tylko litery i cyfry" })
      }
    }),
  description: z.string().trim(),
  manufacturer: requiredChoice(MANUFACTURERS, "Wybierz producenta"),
  category: requiredChoice(CATEGORIES, "Wybierz kategorię"),
  features: z
    .array(z.string().pipe(z.enum(PRODUCT_FEATURES)))
    .min(1, "Wybierz co najmniej jedną cechę"),
})

// ---------------------------------------------------------------------------
// Step 2 — Cena
// ---------------------------------------------------------------------------

export const pricingSchema = z.object({
  priceNet: amountField("Podaj cenę netto"),
  priceGross: amountField("Podaj cenę brutto"),
  vatRate: requiredChoice(VAT_RATES, "Wybierz stawkę VAT").transform(Number),
  currency: requiredChoice(CURRENCIES, "Wybierz walutę"),
})

// ---------------------------------------------------------------------------
// Step 3 — Dostępność i stany magazynowe
// ---------------------------------------------------------------------------

const availabilityFields = z.object({
  isAvailable: z.boolean(),
  isLimited: z.boolean(),
  /** Only meaningful while `isLimited` is checked — see `availabilityRules`. */
  stockQuantity: z.string(),
  minCartQuantity: integerField("Podaj minimalną ilość"),
  maxCartQuantity: integerField("Podaj maksymalną ilość"),
})

/**
 * Cross-field rules: stock is required only for limited products, min ≤ max.
 *
 * Runs even when a sibling field failed (`RUN_ALWAYS`) so every step-3 error
 * shows up on the first "Zapisz" click; a failed number field is then not a
 * number yet, hence the `typeof` guards.
 */
function availabilityRules(
  values: z.output<typeof availabilityFields>,
  ctx: z.RefinementCtx
) {
  if (values.isLimited) {
    const stock = parseQuantityInput(values.stockQuantity, "Podaj ilość na magazynie")
    if ("message" in stock) {
      ctx.addIssue({ code: "custom", path: ["stockQuantity"], message: stock.message })
    }
  }

  if (
    typeof values.minCartQuantity === "number" &&
    typeof values.maxCartQuantity === "number" &&
    values.minCartQuantity > values.maxCartQuantity
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["minCartQuantity"],
      message: "Minimalna ilość nie może być większa niż maksymalna",
    })
    ctx.addIssue({
      code: "custom",
      path: ["maxCartQuantity"],
      message: "Maksymalna ilość nie może być mniejsza niż minimalna",
    })
  }
}

const RUN_ALWAYS = { when: () => true }

export const availabilitySchema = availabilityFields.superRefine(
  availabilityRules,
  RUN_ALWAYS
)

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/**
 * Validator wired into TanStack Form. Discriminated on `step`, so only the
 * fields of the current step (and the steps before it) are checked — that is
 * what gates "Dalej". Every variant keeps the full input shape so the schema
 * types as `StandardSchemaV1<ProductFormValues>` without casts.
 */
export const productFormSchema = z.discriminatedUnion("step", [
  formValuesSchema.extend({ step: z.literal(1), ...basicInfoSchema.shape }),
  formValuesSchema.extend({
    step: z.literal(2),
    ...basicInfoSchema.shape,
    ...pricingSchema.shape,
  }),
  formValuesSchema
    .extend({
      step: z.literal(3),
      ...basicInfoSchema.shape,
      ...pricingSchema.shape,
      ...availabilitySchema.shape,
    })
    .superRefine(availabilityRules, RUN_ALWAYS),
])

/** Turns validated form values into the product stored in the table. */
export const productSchema = z
  .object({
    ...basicInfoSchema.shape,
    ...pricingSchema.shape,
    ...availabilitySchema.shape,
  })
  .superRefine(availabilityRules, RUN_ALWAYS)
  .transform(({ stockQuantity, ...product }) => ({
    ...product,
    stockQuantity: product.isLimited ? Number(stockQuantity.trim()) : null,
  }))

export type ProductInput = z.output<typeof productSchema>
