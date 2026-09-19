import { expect, test } from "@playwright/test"

import { expectStep, goToStep, openDialog, VALID_BASIC_INFO } from "./helpers"

test("going back keeps the values entered on every step", async ({ page }) => {
  const dialog = await openDialog(page)
  await goToStep(dialog, 3)

  await dialog.getByRole("checkbox", { name: "Produkt limitowany" }).check()
  await dialog.getByLabel("Ilość na magazynie").fill("7")

  await dialog.getByRole("button", { name: "Wstecz" }).click()
  await expectStep(dialog, "Cena")
  await expect(dialog.getByLabel("Cena netto")).toHaveValue("100")
  await expect(dialog.getByLabel("Cena brutto")).toHaveValue("123.00")

  await dialog.getByRole("button", { name: "Wstecz" }).click()
  await expectStep(dialog, "Informacje")
  await expect(dialog.getByLabel("Nazwa produktu")).toHaveValue(VALID_BASIC_INFO.name)
  await expect(dialog.getByLabel("SKU produktu")).toHaveValue(VALID_BASIC_INFO.sku)
  await expect(dialog.getByLabel("Producent")).toHaveText(VALID_BASIC_INFO.manufacturer)
  await expect(dialog.getByLabel("Kategoria")).toHaveText(VALID_BASIC_INFO.category)
  await expect(dialog.getByRole("button", { name: VALID_BASIC_INFO.feature })).toHaveAttribute(
    "aria-pressed",
    "true"
  )

  await dialog.getByRole("button", { name: "Dalej" }).click()
  await dialog.getByRole("button", { name: "Dalej" }).click()
  await expectStep(dialog, "Dostępność")
  await expect(dialog.getByRole("checkbox", { name: "Produkt limitowany" })).toBeChecked()
  await expect(dialog.getByLabel("Ilość na magazynie")).toHaveValue("7")
})
