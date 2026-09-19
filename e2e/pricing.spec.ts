import { expect, test } from "@playwright/test"

import { goToStep, openDialog, selectOption } from "./helpers"

test.describe("net / gross / VAT recalculation", () => {
  test("editing net derives gross with brutto = netto × (1 + VAT / 100)", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await dialog.getByLabel("Cena netto").fill("100")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("123.00")

    await dialog.getByLabel("Cena netto").fill("12.5")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("15.38")
  })

  test("editing gross derives net", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await dialog.getByLabel("Cena brutto").fill("246")
    await expect(dialog.getByLabel("Cena netto")).toHaveValue("200.00")
  })

  test("changing the VAT rate re-derives gross from net", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await dialog.getByLabel("Cena netto").fill("200")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("246.00")

    await selectOption(dialog, "Stawka VAT", "8%")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("216.00")
    await expect(dialog.getByLabel("Cena netto")).toHaveValue("200")

    await selectOption(dialog, "Stawka VAT", "0%")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("200.00")
  })

  test("clearing net clears the derived gross", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await dialog.getByLabel("Cena netto").fill("100")
    await dialog.getByLabel("Cena netto").fill("")
    await expect(dialog.getByLabel("Cena brutto")).toHaveValue("")
  })
})
