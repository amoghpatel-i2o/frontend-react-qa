import { test, expect } from '@playwright/test';
import { getHeaders, getKeycloakToken, getCurrentWeekRange, API_BASE_URL } from '../../helpers/api-client';

/**
 * API Tests — /rds/widget/getCardData
 *
 * This endpoint powers the Buy Box metric cards on the Price Monitor screen:
 *   Buy Box Retained, Lost Buy Box, Buy Box not available, etc.
 *
 * Payload reference:
 *   orgId: 6
 *   queryId: 1285
 *   filterSet: { marketplace: Amazon, region: US }
 *   timeRange: week
 */

test.describe('API: getCardData', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getKeycloakToken(request);
  });

  test('should return 200 for valid Buy Box card data request', async ({ request }) => {
    const { startPeriod, endPeriod } = getCurrentWeekRange();

    const response = await request.post(`${API_BASE_URL}/rds/widget/getCardData`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        filterSet: {
          filters: [
            { columnName: 'marketplace', values: [process.env.MARKETPLACE || 'Amazon'] },
            { columnName: 'region', values: [process.env.REGION || 'US'] },
          ],
        },
        queryArray: [{ queryId: 1285, data: [] }],
        startPeriod,
        endPeriod,
        timeRange: 'week',
        browsertime: process.env.TIMEZONE || 'Asia/Calcutta',
        toggle: 'false',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('should return JSON content type', async ({ request }) => {
    const { startPeriod, endPeriod } = getCurrentWeekRange();

    const response = await request.post(`${API_BASE_URL}/rds/widget/getCardData`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        filterSet: {
          filters: [
            { columnName: 'marketplace', values: ['Amazon'] },
            { columnName: 'region', values: ['US'] },
          ],
        },
        queryArray: [{ queryId: 1285, data: [] }],
        startPeriod,
        endPeriod,
        timeRange: 'week',
        browsertime: 'Asia/Calcutta',
        toggle: 'false',
      },
    });

    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should return array or object in response body', async ({ request }) => {
    const { startPeriod, endPeriod } = getCurrentWeekRange();

    const response = await request.post(`${API_BASE_URL}/rds/widget/getCardData`, {
      headers: getHeaders(token),
      data: {
        orgId: parseInt(process.env.ORG_ID || '6'),
        filterSet: {
          filters: [
            { columnName: 'marketplace', values: ['Amazon'] },
            { columnName: 'region', values: ['US'] },
          ],
        },
        queryArray: [{ queryId: 1285, data: [] }],
        startPeriod,
        endPeriod,
        timeRange: 'week',
        browsertime: 'Asia/Calcutta',
        toggle: 'false',
      },
    });

    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body === 'object' || Array.isArray(body)).toBeTruthy();
  });

  test('should return 401 when no auth token is provided', async ({ request }) => {
    const { startPeriod, endPeriod } = getCurrentWeekRange();

    const response = await request.post(`${API_BASE_URL}/rds/widget/getCardData`, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      data: {
        orgId: 6,
        filterSet: { filters: [] },
        queryArray: [{ queryId: 1285, data: [] }],
        startPeriod,
        endPeriod,
        timeRange: 'week',
        browsertime: 'Asia/Calcutta',
        toggle: 'false',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should handle missing orgId gracefully', async ({ request }) => {
    const { startPeriod, endPeriod } = getCurrentWeekRange();

    const response = await request.post(`${API_BASE_URL}/rds/widget/getCardData`, {
      headers: getHeaders(token),
      data: {
        // orgId intentionally omitted
        filterSet: { filters: [] },
        queryArray: [{ queryId: 1285, data: [] }],
        startPeriod,
        endPeriod,
        timeRange: 'week',
        browsertime: 'Asia/Calcutta',
        toggle: 'false',
      },
    });

    // Should return a 4xx error, not a 500
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

});
