import { APIRequestContext } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'https://qa2.i2oretail.com';

/**
 * Returns standard headers used by all i2o Retail API requests.
 * Bearer token is pulled from the environment (injected by GitHub Actions secrets).
 */
export function getHeaders(token: string) {
  return {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'authorization': `Bearer ${token}`,
    'origin': process.env.BASE_URL || 'https://qa4.i2oretail.com',
    'referer': `${process.env.BASE_URL || 'https://qa4.i2oretail.com'}/`,
  };
}

/**
 * Fetches a fresh Bearer token from Keycloak using Resource Owner Password Grant.
 * Used by API tests (no browser needed).
 */
export async function getKeycloakToken(request: APIRequestContext): Promise<string> {
  const keycloakUrl = process.env.KEYCLOAK_URL || 'https://qa.i2oretail.com';
  const realm = process.env.KEYCLOAK_REALM || 'i2o-realm';
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'i2o-client';
  const username = process.env.QA_USERNAME!;
  const password = process.env.QA_PASSWORD!;

  const tokenUrl = `${keycloakUrl}/auth/realms/${realm}/protocol/openid-connect/token`;

  const response = await request.post(tokenUrl, {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      grant_type: 'password',
      client_id: clientId,
      username,
      password,
      scope: 'openid',
    },
  });

  if (!response.ok()) {
    throw new Error(`Keycloak token fetch failed: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

/**
 * Builds a date range for the current week (Mon–today) in YYYY-MM-DD format.
 * Used as default date range in API tests.
 */
export function getCurrentWeekRange(): { startPeriod: string; endPeriod: string } {
  const today = new Date();
  const day = today.getDay(); // 0 = Sun
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startPeriod: fmt(monday), endPeriod: fmt(today) };
}

export { API_BASE_URL };
