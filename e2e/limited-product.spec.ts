import { expect, test } from "@playwright/test"

import { errorMessage, goToStep, openDialog } from "./helpers"

test("stock quantity is shown and required only while the product is limited", async ({ page }) => {
  const dialog = await openDialog(page)
  await goToStep(dialog, 3)
  const limited = dialog.getByRole("checkbox", { name: "Produkt limitowany" })
  const stock = dialog.getByLabel("Ilość na magazynie")

  await expect(stock).toBeHidden()

  await limited.check()
  await expect(stock).toBeVisible()
  await dialog.getByRole("button", { name: "Zapisz produkt" }).click()
  await expect(errorMessage(dialog, "Podaj ilość na magazynie")).toBeVisible()

  await stock.fill("2.5")
  await expect(errorMessage(dialog, "Podaj nieujemną liczbę całkowitą")).toBeVisible()

  // Unchecking hides the field and its error must no longer block saving.
  await limited.uncheck()
  await expect(stock).toBeHidden()
  await dialog.getByRole("button", { name: "Zapisz produkt" }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText("8 produktów w katalogu")).toBeVisible()
})
