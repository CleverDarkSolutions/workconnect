import { expect, test } from "@playwright/test"

import { errorMessage, expectStep, fillBasicInfo, goToStep, openDialog } from "./helpers"

test.describe("step gating and validation messages", () => {
  test("blocks an empty step 1 and shows an error next to every required field", async ({ page }) => {
    const dialog = await openDialog(page)

    await dialog.getByRole("button", { name: "Dalej" }).click()

    await expectStep(dialog, "Informacje")
    await expect(errorMessage(dialog, "Podaj nazwę produktu")).toBeVisible()
    await expect(errorMessage(dialog, "Podaj SKU produktu")).toBeVisible()
    await expect(errorMessage(dialog, "Wybierz producenta")).toBeVisible()
    await expect(errorMessage(dialog, "Wybierz kategorię")).toBeVisible()
    await expect(errorMessage(dialog, "Wybierz co najmniej jedną cechę")).toBeVisible()
    await expect(dialog.getByLabel("Nazwa produktu")).toHaveAttribute("aria-invalid", "true")
  })

  test("rejects a short name and a SKU with a symbol", async ({ page }) => {
    const dialog = await openDialog(page)
    await fillBasicInfo(dialog)

    await dialog.getByLabel("Nazwa produktu").fill("ab")
    await dialog.getByLabel("SKU produktu").fill("MBP-14")
    await dialog.getByRole("button", { name: "Dalej" }).click()

    await expectStep(dialog, "Informacje")
    await expect(errorMessage(dialog, "Nazwa musi mieć co najmniej 3 znaki")).toBeVisible()
    await expect(errorMessage(dialog, "SKU może zawierać tylko litery i cyfry")).toBeVisible()

    await dialog.getByLabel("SKU produktu").fill("A".repeat(25))
    await expect(errorMessage(dialog, "SKU może mieć maksymalnie 24 znaki")).toBeVisible()
  })

  test("blocks step 2 until both prices are filled in", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 2)

    await dialog.getByRole("button", { name: "Dalej" }).click()

    await expectStep(dialog, "Cena")
    await expect(errorMessage(dialog, "Podaj cenę netto")).toBeVisible()
    await expect(errorMessage(dialog, "Podaj cenę brutto")).toBeVisible()
  })

  test("rejects a minimum cart quantity greater than the maximum", async ({ page }) => {
    const dialog = await openDialog(page)
    await goToStep(dialog, 3)

    await dialog.getByLabel("Minimalna ilość").fill("20")
    await dialog.getByLabel("Maksymalna ilość").fill("10")
    await dialog.getByRole("button", { name: "Zapisz produkt" }).click()

    await expect(dialog).toBeVisible()
    await expect(errorMessage(dialog, "Minimalna ilość nie może być większa niż maksymalna")).toBeVisible()
    await expect(errorMessage(dialog, "Maksymalna ilość nie może być mniejsza niż minimalna")).toBeVisible()

    await dialog.getByLabel("Maksymalna ilość").fill("25")
    await expect(errorMessage(dialog, "Minimalna ilość nie może być większa niż maksymalna")).toBeHidden()
  })
})
