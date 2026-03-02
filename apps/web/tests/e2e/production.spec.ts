/**
 * E2E tests that exercise the deployed app (production or local) using the demo account.
 * Run against production: BASE_URL=https://tiny-invoice.<your-subdomain>.workers.dev pnpm test:e2e
 * Run against local: pnpm run db:ready && pnpm test:e2e (starts dev server).
 * Production requires the remote D1 seed to have been run (CI "Run D1 seed" step).
 */
import { test, expect } from '@playwright/test'

const DEMO_EMAIL = 'demo@tinyinvoice.com'
const DEMO_PASSWORD = 'demo1234'

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  const emailInput = page.getByRole('textbox', { name: /email/i }).or(page.locator('input[type="email"]')).first()
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 })
  await emailInput.fill(DEMO_EMAIL)
  await page.locator('input[type="password"]').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

test.describe('Demo account flow', () => {
  test('login with demo credentials and see dashboard', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('dashboard shows demo stats and recent invoices', async ({ page }) => {
    await loginAsDemo(page)

    await expect(page.getByText(/revenue|outstanding|invoices/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/INV-/)).toBeVisible({ timeout: 5_000 })
  })

  test('clients page lists demo clients', async ({ page }) => {
    await loginAsDemo(page)

    await page.getByRole('link', { name: /clients/i }).click()
    await expect(page).toHaveURL(/\/clients/)
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
    await expect(page.getByText('Acme Corp')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Startup Inc')).toBeVisible()
    await expect(page.getByText('Jane Doe')).toBeVisible()
  })

  test('invoices page lists demo invoices with mixed statuses', async ({ page }) => {
    await loginAsDemo(page)

    await page.getByRole('link', { name: /invoices/i }).click()
    await expect(page).toHaveURL(/\/invoices/)
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible()
    await expect(page.getByText('INV-001')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('INV-006')).toBeVisible()
    await expect(page.getByText(/paid|sent|draft|overdue/i)).toBeVisible()
  })

  test('settings page shows demo business info', async ({ page }) => {
    await loginAsDemo(page)

    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
    await expect(page.getByText('Demo Freelance Co')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/123 Main St/)).toBeVisible()
  })

  test('can open an invoice detail', async ({ page }) => {
    await loginAsDemo(page)

    await page.getByRole('link', { name: /invoices/i }).click()
    await expect(page).toHaveURL(/\/invoices/)
    await page.getByRole('link', { name: 'View' }).first().click()
    await expect(page).toHaveURL(/\/invoices\/[^/]+/)
    await expect(page.getByText('INV-001')).toBeVisible()
    await expect(page.getByText(/Web development|homepage/i)).toBeVisible({ timeout: 5_000 })
  })
})
