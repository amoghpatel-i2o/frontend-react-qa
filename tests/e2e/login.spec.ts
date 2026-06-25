import { test, expect } from '@playwright/test';

/**
 * Login / Auth Flow Tests
 * These tests run WITHOUT the saved auth session (they test login itself).
 * Playwright config excludes storageState for the 'setup' project.
 */

test.describe('Keycloak Login Flow', () => {

  test.use({ storageState: { cookies: [], origins: [] } }); // Clear any saved session

  test('should redirect to Keycloak login page', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to Keycloak auth
    await expect(page).toHaveURL(/qa\.i2oretail\.com\/auth/);

    // Keycloak login form should be visible
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#kc-login')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/qa\.i2oretail\.com\/auth/);

    await page.locator('#username').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('#kc-login').click();

    // Keycloak shows an error message
    await expect(page.locator('.alert-error, #input-error, [class*="error"]'))
      .toBeVisible({ timeout: 5000 });
  });

  test('should login successfully and land on app', async ({ page }) => {
    const username = process.env.QA_USERNAME!;
    const password = process.env.QA_PASSWORD!;

    await page.goto('/');
    await page.waitForURL(/qa\.i2oretail\.com\/auth/);

    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#kc-login').click();

    // Should redirect back to app
    await page.waitForURL(/qa4\.i2oretail\.com/, { timeout: 15000 });

    // Sidebar should load — confirming successful auth
    await expect(page.locator('text=Price Monitor')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Content Monitor')).toBeVisible();
  });

  test('should persist session on page refresh', async ({ page }) => {
    const username = process.env.QA_USERNAME!;
    const password = process.env.QA_PASSWORD!;

    await page.goto('/');
    await page.waitForURL(/qa\.i2oretail\.com\/auth/);
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#kc-login').click();
    await page.waitForURL(/qa4\.i2oretail\.com/, { timeout: 15000 });

    // Refresh the page
    await page.reload();

    // Should stay logged in — not redirected to Keycloak
    await expect(page).toHaveURL(/qa4\.i2oretail\.com/);
    await expect(page.locator('text=Price Monitor')).toBeVisible({ timeout: 10000 });
  });

});
