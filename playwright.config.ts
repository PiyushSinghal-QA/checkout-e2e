import { defineConfig, devices } from '@playwright/test';

// Black-box: we only know the app's URL. Defaults to a locally-started instance.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// Where to start the app from when one isn't already running (sibling repo by default).
const APP_PATH = process.env.APP_PATH || '../checkout-service';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  // Boot the checkout-service automatically (reuse one if it's already running).
  webServer: {
    command: `npm --prefix ${APP_PATH} start`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
