import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();


export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.BASE_URL || 'https://qa.i2oretail.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // Step 1: Authenticate and save session
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,       // run auth first
    },
     // Step 2: E2E tests (depend on auth)
     {
       name: 'e2e',
       testDir: './tests/e2e',
       dependencies: ['setup'],
       use: {
         ...devices['Desktop Chrome'],
         storageState: 'fixtures/.auth.json',
       },
     },
    {
      name: 'api',
      testDir: './tests/api',
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
