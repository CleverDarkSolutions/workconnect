import { expect, test } from "@playwright/test"

import {
  expectStep,
  fillBasicInfo,
  goToStep,
  openDialog,
  VALID_BASIC_INFO,
  visibleText,
} from "./helpers"

test.describe("dialog lifecycle", () => {
  test("closing with Escape resets the form to an empty step 1", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    await page.getByRole("button", { name: "Dodaj produkt" }).click()
    await expectStep(dialog, "Informacje")
    await expect(dialog.getByLabel("Nazwa produktu")).toHaveValue("")
    await expect(dialog.getByLabel("SKU produktu")).toHaveValue("")
    await expect(dialog.getByRole("button", { name: VALID_BASIC_INFO.feature })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  test("closing with the X button discards a partially filled form", async ({ page }) => {
    const dialog = await openDialog(page)
    await fillBasicInfo(dialog)

    await dialog.getByRole("button", { name: "Zamknij" }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole("button", { name: "Dodaj produkt" }).click()
    await expect(dialog.getByLabel("Nazwa produktu")).toHaveValue("")
  })

  test("saving a valid product appends a row, shows a toast and resets the dialog", async ({
    page,
  }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 3)

    await dialog.getByRole("button", { name: "Zapisz produkt" }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText("Produkt został dodany")).toBeVisible()
    await expect(page.getByText("8 produktów w katalogu")).toBeVisible()

    // The new product lands at the end of the catalog — page 2.
    await page.getByRole("button", { name: "Strona 2" }).click()
    await expect(visibleText(page, VALID_BASIC_INFO.name)).toBeVisible()
    await expect(visibleText(page, VALID_BASIC_INFO.sku)).toBeVisible()
    await expect(visibleText(page, "123,00 PLN")).toBeVisible()

    await page.getByRole("button", { name: "Dodaj produkt" }).click()
    await expectStep(dialog, "Informacje")
    await expect(dialog.getByLabel("Nazwa produktu")).toHaveValue("")
  })
})
