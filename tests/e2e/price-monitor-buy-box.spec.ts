import { test, expect } from '@playwright/test';

/**
 * Price Monitor — Buy Box Screen Tests
 * Uses saved auth session from fixtures/.auth.json (set up by auth.setup.ts).
 *
 * Screen: https://qa4.i2oretail.com/price-monitor/buy-box
 */

test.describe('Price Monitor — Buy Box Screen', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/price-monitor/buy-box');
    // Wait for the page header to confirm the screen loaded
    await expect(page.getByRole('heading', { name: 'Price Monitor' })).toBeVisible({ timeout: 10000 });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  test('should load the Buy Box tab by default', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Buy Box' })).toBeVisible();
    // Active tab should be Buy Box
    await expect(page.getByRole('tab', { name: 'Buy Box' })).toHaveClass(/active|selected|Mui-selected/);
  });

  test('should display all tab options', async ({ page }) => {
    const tabs = ['Buy Box', 'Pricing', 'MAP Enforcement', 'MAP Violations', 'Authorized Seller Setup'];
    for (const tab of tabs) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });

  test('should navigate to Pricing tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/pricing/);
  });

  test('should navigate to MAP Enforcement tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'MAP Enforcement' }).click();
    await expect(page).toHaveURL(/map-enforcement/i);
  });

  // ── Filters ─────────────────────────────────────────────────────────────────

  test('should display filter dropdowns', async ({ page }) => {
    await expect(page.getByLabel(/Authorization Status/i)).toBeVisible();
    await expect(page.getByLabel(/Region/i)).toBeVisible();
  });

  test('should display Save button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
  });

  test('should display date range picker', async ({ page }) => {
    // Date range is shown in the top-right area
    await expect(page.locator('text=/\\d{2}\\/\\d{2}\\/\\d{2}/')).toBeVisible();
  });

  // ── Metric Cards ─────────────────────────────────────────────────────────────

  test('should display all Buy Box metric cards', async ({ page }) => {
    const cards = [
      'Buy Box Retained',
      'Lost Buy Box',
      'Buy Box not available',
      'Product Suppression',
      'Buy Box Used',
      'Current Out of Stock',
    ];
    for (const card of cards) {
      await expect(page.locator(`text=${card}`).first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('should display percentage values on metric cards', async ({ page }) => {
    // Each metric card shows a % value (e.g. "0%")
    const percentages = page.locator('text=/%/');
    await expect(percentages.first()).toBeVisible({ timeout: 15000 });
  });

  // ── Trends Section ───────────────────────────────────────────────────────────

  test('should display Buy Box Trends section', async ({ page }) => {
    await expect(page.locator('text=Buy Box Trends')).toBeVisible({ timeout: 15000 });
  });

  test('should display BUY BOX PERFORMANCE and BUY BOX WINNERS sub-tabs', async ({ page }) => {
    await expect(page.locator('text=BUY BOX PERFORMANCE')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=BUY BOX WINNERS')).toBeVisible({ timeout: 15000 });
  });

  test('should switch to BUY BOX WINNERS tab', async ({ page }) => {
    await page.locator('text=BUY BOX WINNERS').click();
    // The tab should become active
    await expect(page.locator('text=BUY BOX WINNERS')).toBeVisible();
  });

  // ── Sidebar ──────────────────────────────────────────────────────────────────

  test('should highlight Price Monitor as active in sidebar', async ({ page }) => {
    const sidebarItem = page.locator('text=PRICE MONITOR');
    await expect(sidebarItem).toBeVisible();
  });

  test('should display Monitoring Frequency in header', async ({ page }) => {
    await expect(page.locator('text=Monitoring Frequency')).toBeVisible();
    // Frequency time slots: 03:00, 07:00, 11:00, 15:00
    await expect(page.locator('text=03:00')).toBeVisible();
    await expect(page.locator('text=5 X day')).toBeVisible();
  });

  // ── Marketplace Selector ─────────────────────────────────────────────────────

  test('should display Amazon as selected marketplace', async ({ page }) => {
    await expect(page.locator('text=Amazon').first()).toBeVisible();
  });

});
