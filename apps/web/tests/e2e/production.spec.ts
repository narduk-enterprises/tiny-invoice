/**
 * Exhaustive E2E tests for TinyInvoice (demo account + public flows).
 * Run locally: pnpm run db:ready && pnpm test:e2e
 * Run vs production: BASE_URL=https://tiny-invoice.narduk.workers.dev pnpm test:e2e
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

// ─── Public / unauthenticated ─────────────────────────────────────────────
test.describe('Public pages', () => {
  test('landing page has Get started, Log in, Try demo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /invoicing made simple/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /try demo/i })).toBeVisible()
  })

  test('Try demo link goes to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /try demo/i }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible({ timeout: 5_000 })
  })

  test('login page shows Try the demo alert and Fill demo credentials button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/try the demo/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/demo@tinyinvoice\.com/)).toBeVisible()
    await expect(page.getByRole('button', { name: /fill demo credentials/i })).toBeVisible()
  })

  test('Fill demo credentials populates form', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /fill demo credentials/i }).click()
    await expect(page.locator('input[type="email"]')).toHaveValue(DEMO_EMAIL)
    await expect(page.locator('input[type="password"]')).toHaveValue(DEMO_PASSWORD)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('bad@example.com')
    await page.locator('input[type="password"]').fill('wrong')
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('register page has form and link to login', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /register|sign up|create/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('link', { name: /log in|already have/i })).toBeVisible()
  })
})

// ─── Demo login and dashboard ─────────────────────────────────────────────
test.describe('Demo login and dashboard', () => {
  test('login with demo credentials and see dashboard', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('dashboard shows stats cards and recent invoices', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByText(/total revenue|outstanding|invoices|paid/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/INV-/)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('link', { name: /view all/i })).toBeVisible()
  })

  test('dashboard recent invoices link goes to invoices', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /view all/i }).click()
    await expect(page).toHaveURL(/\/invoices/)
  })
})

// ─── Clients ──────────────────────────────────────────────────────────────
test.describe('Clients (as demo)', () => {
  test('clients page lists demo clients', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /clients/i }).click()
    await expect(page).toHaveURL(/\/clients/)
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
    await expect(page.getByText('Acme Corp')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Startup Inc')).toBeVisible()
    await expect(page.getByText('Jane Doe')).toBeVisible()
  })

  test('Add client opens slideover with form', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /clients/i }).click()
    await expect(page).toHaveURL(/\/clients/)
    await page.getByRole('button', { name: /add client/i }).click()
    await expect(page.getByRole('heading', { name: /client/i })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByPlaceholder(/acme corp/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
  })
})

// ─── Invoices ─────────────────────────────────────────────────────────────
test.describe('Invoices (as demo)', () => {
  test('invoices page lists demo invoices with statuses', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /invoices/i }).click()
    await expect(page).toHaveURL(/\/invoices/)
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible()
    await expect(page.getByText('INV-001')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('INV-006')).toBeVisible()
    await expect(page.getByText(/paid|sent|draft|overdue/i)).toBeVisible()
  })

  test('New invoice button goes to new invoice page', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /invoices/i }).click()
    await page.getByRole('link', { name: /new invoice/i }).click()
    await expect(page).toHaveURL(/\/invoices\/new/)
    await expect(page.getByRole('heading', { name: /new invoice|create invoice/i })).toBeVisible({ timeout: 5_000 })
  })

  test('can open invoice detail and see line items', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /invoices/i }).click()
    await expect(page).toHaveURL(/\/invoices/)
    await page.getByRole('link', { name: 'View' }).first().click()
    await expect(page).toHaveURL(/\/invoices\/[^/]+/)
    await expect(page.getByText(/INV-/)).toBeVisible()
    await expect(page.getByText(/Web development|homepage|line item|description/i)).toBeVisible({ timeout: 5_000 })
  })

  test('invoice detail has back or link to list', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/invoices')
    await page.getByRole('link', { name: 'View' }).first().click()
    await expect(page).toHaveURL(/\/invoices\/[^/]+/)
    await expect(page.getByRole('link', { name: /invoices|back|all/i })).toBeVisible({ timeout: 5_000 })
  })
})

// ─── Settings ────────────────────────────────────────────────────────────
test.describe('Settings (as demo)', () => {
  test('settings page shows demo business info', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
    await expect(page.getByText('Demo Freelance Co')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/123 Main St/)).toBeVisible()
  })
})

// ─── Logout ──────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  test('logout returns to landing and nav shows Login/Register', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /logout/i }).click()
    await expect(page).toHaveURL(/\/(?:login)?$/, { timeout: 10_000 })
    await expect(page.getByRole('link', { name: /log in|login/i }).or(page.getByRole('link', { name: /register/i })).first()).toBeVisible({ timeout: 5_000 })
  })
})
