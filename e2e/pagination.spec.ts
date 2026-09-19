import { expect, test } from "@playwright/test"

import { visibleText } from "./helpers"

test.describe("URL-synced pagination", () => {
  test("stores the page in the URL and survives a reload", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Strona 1 z 2 · 7 produktów")).toBeVisible()
    await expect(visibleText(page, 'MacBook Pro 14"')).toBeVisible()

    await page.getByRole("button", { name: "Dalej" }).click()
    await expect(page).toHaveURL(/\?page=2$/)
    await expect(page.getByText("Strona 2 z 2 · 7 produktów")).toBeVisible()
    await expect(visibleText(page, "Dyson V15 Detect")).toBeVisible()
    await expect(visibleText(page, 'MacBook Pro 14"')).toBeHidden()

    await page.reload()
    await expect(page.getByText("Strona 2 z 2 · 7 produktów")).toBeVisible()
    await expect(page.getByRole("button", { name: "Strona 2" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("button", { name: "Dalej" })).toBeDisabled()

    await page.getByRole("button", { name: "Wstecz" }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Strona 1 z 2 · 7 produktów")).toBeVisible()
  })

  test("opens directly on a deep-linked page and clamps an out-of-range one", async ({ page }) => {
    await page.goto("/?page=2")
    await expect(page.getByText("Strona 2 z 2 · 7 produktów")).toBeVisible()

    await page.goto("/?page=99")
    await expect(page.getByText("Strona 2 z 2 · 7 produktów")).toBeVisible()
  })
})
