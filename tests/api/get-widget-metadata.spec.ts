import { test, expect } from '@playwright/test';
import { getHeaders, getKeycloakToken, API_BASE_URL } from '../../helpers/api-client';

/**
 * API Tests — /rds/widget/getWidgetMetadata
 *
 * Returns metadata (config, labels, structure) for a given screen widget.
 * Used by the Notification Panel and other dynamic UI widgets.
 *
 * Payload reference:
 *   orgId: 6
 *   uiScreenCode: "Notification Panel"
 *   platform: "Amazon"
 *   region: null
 */

test.describe('API: getWidgetMetadata', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getKeycloakToken(request);
  });

  test('should return 200 for Notification Panel metadata', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        uiScreenCode: 'Notification Panel',
        region: null,
        platform: process.env.MARKETPLACE || 'Amazon',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('should return JSON content type', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        uiScreenCode: 'Notification Panel',
        region: null,
        platform: 'Amazon',
      },
    });

    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('response body should be defined', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        uiScreenCode: 'Notification Panel',
        region: null,
        platform: 'Amazon',
      },
    });

    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body === 'object' || Array.isArray(body)).toBeTruthy();
  });

  test('should return 401 without auth token', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: { 'content-type': 'application/json' },
      data: {
        orgId: 6,
        uiScreenCode: 'Notification Panel',
        region: null,
        platform: 'Amazon',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should handle unknown uiScreenCode gracefully', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        uiScreenCode: 'NonExistentScreen_XYZ',
        region: null,
        platform: 'Amazon',
      },
    });

    // Should return empty/null data or a 4xx — not a 500
    const isAcceptable = response.status() === 200 || (response.status() >= 400 && response.status() < 500);
    expect(isAcceptable).toBeTruthy();
  });

  test('should handle null region without crashing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/widget/getWidgetMetadata`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        uiScreenCode: 'Notification Panel',
        region: null,
        platform: 'Amazon',
      },
    });

    expect(response.status()).toBe(200);
  });

});
