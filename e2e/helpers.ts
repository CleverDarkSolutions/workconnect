import { expect, type Locator, type Page } from "@playwright/test"

export async function openDialog(page: Page): Promise<Locator> {
  await page.goto("/")
  await page.getByRole("button", { name: "Dodaj produkt" }).click()
  const dialog = page.getByRole("dialog", { name: "Dodaj nowy produkt" })
  await expect(dialog).toBeVisible()
  return dialog
}

export async function expectStep(dialog: Locator, title: string) {
  await expect(dialog.locator('[aria-current="step"]')).toContainText(title)
}

export async function selectOption(dialog: Locator, label: string, option: string) {
  await dialog.getByLabel(label).click()
  await dialog.page().getByRole("option", { name: option, exact: true }).click()
}

export const VALID_BASIC_INFO = {
  name: "Testowy produkt",
  sku: "TEST123",
  manufacturer: "Sony",
  category: "RTV",
  feature: "Bluetooth",
}

export async function fillBasicInfo(dialog: Locator) {
  await dialog.getByLabel("Nazwa produktu").fill(VALID_BASIC_INFO.name)
  await dialog.getByLabel("SKU produktu").fill(VALID_BASIC_INFO.sku)
  await selectOption(dialog, "Producent", VALID_BASIC_INFO.manufacturer)
  await selectOption(dialog, "Kategoria", VALID_BASIC_INFO.category)
  await dialog.getByRole("button", { name: VALID_BASIC_INFO.feature }).click()
}

export async function fillPricing(dialog: Locator, net = "100") {
  await dialog.getByLabel("Cena netto").fill(net)
}

export async function goToStep(dialog: Locator, step: 2 | 3) {
  await fillBasicInfo(dialog)
  await dialog.getByRole("button", { name: "Dalej" }).click()
  await expectStep(dialog, "Cena")
  if (step === 2) return
  await fillPricing(dialog)
  await dialog.getByRole("button", { name: "Dalej" }).click()
  await expectStep(dialog, "Dostępność")
}

/** A validation message rendered next to a field (`FieldError` has `role="alert"`). */
export function errorMessage(dialog: Locator, text: string): Locator {
  return dialog.getByRole("alert").filter({ hasText: text })
}

/**
 * The catalog renders a table (desktop) and a card list (mobile); only one is
 * displayed, so product text is asserted on the visible copy.
 */
export function visibleText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true }).filter({ visible: true })
}
