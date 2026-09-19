/**
 * Net / gross / VAT arithmetic for the pricing step.
 *
 * Formula from the brief: brutto = netto × (1 + VAT / 100). All derivations
 * run on whole cents so half-cent cases round exactly (12.50 × 1.23 = 15.375
 * → 15.38) instead of drifting through binary fractions.
 */

const AMOUNT_PATTERN = /^\d+(?:[.,]\d{1,2})?$/

/** Whole cents of an amount, resolving a third decimal half-up without float artifacts (1.005 → 101). */
export function toCents(amount: number): number {
  const [mantissa, exponent = "0"] = amount.toString().split("e")
  return Math.round(Number(`${mantissa}e${Number(exponent) + 2}`))
}

export function roundMoney(value: number): number {
  return toCents(value) / 100
}

export function grossFromNet(net: number, vatRatePercent: number): number {
  return Math.round((toCents(net) * (100 + vatRatePercent)) / 100) / 100
}

export function netFromGross(gross: number, vatRatePercent: number): number {
  return Math.round((toCents(gross) * 100) / (100 + vatRatePercent)) / 100
}

/**
 * Parses user input such as "12.50", "12,50" or "12" — at most two decimals,
 * so what is stored is exactly what was typed. `null` when it is not such an amount.
 */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim()
  if (!AMOUNT_PATTERN.test(trimmed)) return null
  return Number(trimmed.replace(",", "."))
}

/** Formats a number the way the inputs display it ("15.38"). */
export function formatAmount(value: number): string {
  return value.toFixed(2)
}

/**
 * Derives the gross input from the net input. Returns an empty string when
 * the source cannot be parsed so the derived field never shows a stale value.
 */
export function deriveGrossInput(netInput: string, vatRateInput: string): string {
  const net = parseAmount(netInput)
  const vat = parseAmount(vatRateInput)
  if (net === null || vat === null) return ""
  return formatAmount(grossFromNet(net, vat))
}

export function deriveNetInput(grossInput: string, vatRateInput: string): string {
  const gross = parseAmount(grossInput)
  const vat = parseAmount(vatRateInput)
  if (gross === null || vat === null) return ""
  return formatAmount(netFromGross(gross, vat))
}
