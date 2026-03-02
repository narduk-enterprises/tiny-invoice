import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000'
const isProduction = baseURL !== 'http://localhost:3000'

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: process.env.CI ? undefined : 1,
  reporter: 'html',
  timeout: isProduction ? 30_000 : 15_000,
  expect: { timeout: 5_000 },
  use: {
    trace: 'on-first-retry',
    actionTimeout: isProduction ? 10_000 : 3_000,
    navigationTimeout: isProduction ? 15_000 : 5_000,
  },
  ...(isProduction
    ? {}
    : {
        webServer: {
          command: 'pnpm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 30_000,
        },
      }),
  projects: [
    {
      name: isProduction ? 'production' : 'web',
      testDir: 'apps/web/tests/e2e',
      use: { ...devices['Desktop Chrome'], baseURL },
    },
  ],
})
