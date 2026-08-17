import { defineConfig, devices } from '@playwright/test';

const previewUrl = 'http://127.0.0.1:4323';
const isCi = Boolean((globalThis as typeof globalThis & {
  process?: { env?: { CI?: string } };
}).process?.env?.CI);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'output/playwright-results',
  fullyParallel: false,
  workers: isCi ? 1 : undefined,
  forbidOnly: true,
  retries: 0,
  reporter: [['line']],
  use: {
    baseURL: previewUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: previewUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 15'],
        browserName: 'webkit',
      },
    },
  ],
});
