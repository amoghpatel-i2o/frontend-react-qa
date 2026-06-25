import { test, expect } from '@playwright/test';
import { getHeaders, getKeycloakToken, getCurrentWeekRange, API_BASE_URL } from '../../helpers/api-client';

/**
 * API Tests — /rds/report/getGridCardData
 *
 * Powers the data grid/table on the Price Monitor screen.
 * Supports pagination (pageNo, pageSize) and sorting (sortSet).
 *
 * Payload reference:
 *   orgId: 6, queryId: 1227
 *   filterSet includes: marketplace, region, from_time, to_time
 *   emailId: agency.user@i2oretail.com
 */

test.describe('API: getGridCardData', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getKeycloakToken(request);
  });

  function buildPayload(overrides = {}) {
    const { startPeriod, endPeriod } = getCurrentWeekRange();
    return {
      orgId: parseInt(process.env.ORG_ID || '6'),
      queryId: 1227,
      filterSet: {
        filters: [
          { columnName: 'marketplace', values: [process.env.MARKETPLACE || 'Amazon'] },
          { columnName: 'region', values: [process.env.REGION || 'US'] },
          { columnName: 'from_time', filterType: 'custom', values: [`${startPeriod} 00:00:00`] },
          { columnName: 'to_time', filterType: 'custom', values: [`${endPeriod} 23:59:00`] },
        ],
      },
      startPeriod,
      endPeriod,
      timeRange: 'week',
      browsertime: process.env.TIMEZONE || 'Asia/Calcutta',
      pageNo: 1,
      pageSize: 10,
      emailId: process.env.QA_USERNAME || 'agency.user@i2oretail.com',
      sortSet: null,
      ...overrides,
    };
  }

  test('should return 200 for valid grid data request', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: buildPayload(),
    });

    expect(response.status()).toBe(200);
  });

  test('should return JSON content type', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: buildPayload(),
    });

    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('response body should be defined and be an object or array', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: buildPayload(),
    });

    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body === 'object' || Array.isArray(body)).toBeTruthy();
  });

  test('should support pagination — page 1 with pageSize 10', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: buildPayload({ pageNo: 1, pageSize: 10 }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should support pagination — page 2', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: buildPayload({ pageNo: 2, pageSize: 10 }),
    });

    // Page 2 may be empty but should still return 200
    expect(response.status()).toBe(200);
  });

  test('should return 401 when no auth token provided', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: { 'content-type': 'application/json' },
      data: buildPayload(),
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should handle missing queryId gracefully', async ({ request }) => {
    const payload = buildPayload();
    delete (payload as any).queryId;

    const response = await request.post(`${API_BASE_URL}/rds/report/getGridCardData`, {
      headers: getHeaders(token),
      data: payload,
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

});
