/**
 * Net / gross / VAT arithmetic for the pricing step.
 *
 * Formula from the brief: brutto = netto × (1 + VAT / 100).
 * Money is rounded to 2 decimals only when a derived value is produced,
 * never while the user is still typing.
 */

const AMOUNT_PATTERN = /^\d+(?:[.,]\d+)?$/

/** Rounds half away from zero to 2 decimals without binary float artifacts (1.005 → 1.01). */
export function roundMoney(value: number): number {
  const [mantissa, exponent = "0"] = value.toString().split("e")
  const cents = Math.round(Number(`${mantissa}e${Number(exponent) + 2}`))
  return cents / 100
}

export function grossFromNet(net: number, vatRatePercent: number): number {
  return roundMoney(net * (1 + vatRatePercent / 100))
}

export function netFromGross(gross: number, vatRatePercent: number): number {
  return roundMoney(gross / (1 + vatRatePercent / 100))
}

/** Parses user input such as "12.50", "12,50" or "12"; `null` when it is not a non-negative amount. */
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
