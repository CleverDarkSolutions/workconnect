import { defineConfig, devices } from "@playwright/test"

/** Runs the same e2e suite against a deployed URL: `npx playwright test -c playwright.prod.config.ts`. */
const baseURL = process.env.E2E_BASE_URL ?? "https://workconnect-product-form.vercel.app"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  reporter: "list",
  use: { baseURL, locale: "pl-PL" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 14"], browserName: "chromium" } },
  ],
})
