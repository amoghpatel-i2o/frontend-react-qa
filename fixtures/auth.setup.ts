import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth.json');

/**
 * Authenticates via Keycloak and saves browser storage state.
 * This runs once before all E2E tests and the saved session is reused,
 * so tests don't need to log in individually.
 */
setup('authenticate via Keycloak', async ({ page }) => {
  const baseURL = process.env.BASE_URL || 'https://qa4.i2oretail.com';
  const username = process.env.QA_USERNAME;
  const password = process.env.QA_PASSWORD;

  if (!username || !password) {
    throw new Error('QA_USERNAME and QA_PASSWORD must be set in .env');
  }

  // Navigate to the app — Keycloak will redirect to login
  await page.goto(baseURL);

  // Wait for Keycloak login page to load
  await page.waitForURL(/qa\.i2oretail\.com\/auth/);

  // Fill in credentials
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#kc-login').click();

  // Wait for redirect back to the app after successful login
  await page.waitForURL(baseURL + '/**', { timeout: 15000 });

  // Confirm we're logged in — sidebar should be visible
  await expect(page.locator('text=Price Monitor')).toBeVisible({ timeout: 10000 });

  // Save session (cookies + localStorage) for reuse in all E2E tests
  await page.context().storageState({ path: authFile });

  console.log('✅ Auth session saved to fixtures/.auth.json');
});
