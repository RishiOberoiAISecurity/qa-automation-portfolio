import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';

type MarketDataItem = {
  symbol: string;
  price: number;
  timestamp: string;
};

type InsightsResponse = {
  summary: string;
  signals: string[];
};

test.describe('API Validation Suite', () => {
  const baseURL = 'https://example.com';

  async function validateJsonContentType(response: APIResponse) {
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  }

  async function validateResponseTime(
    requestContext: APIRequestContext,
    endpoint: string,
    maxDurationMs: number
  ) {
    const start = Date.now();
    const response = await requestContext.get(`${baseURL}${endpoint}`);
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(maxDurationMs);

    return response;
  }

  test('validate market data endpoint returns valid structure and values', async ({ request }) => {
    const response = await validateResponseTime(request, '/api/market-data', 2000);

    await test.step('Validate status and content type', async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      await validateJsonContentType(response);
    });

    await test.step('Validate market data payload structure', async () => {
      const body = await response.json();

      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBeTruthy();
      expect(body.data.length).toBeGreaterThan(0);

      const firstItem = body.data[0] as MarketDataItem;

      expect(firstItem).toHaveProperty('symbol');
      expect(firstItem).toHaveProperty('price');
      expect(firstItem).toHaveProperty('timestamp');

      expect(typeof firstItem.symbol).toBe('string');
      expect(firstItem.symbol.length).toBeGreaterThan(0);

      expect(typeof firstItem.price).toBe('number');
      expect(firstItem.price).toBeGreaterThan(0);

      expect(typeof firstItem.timestamp).toBe('string');
      expect(new Date(firstItem.timestamp).toString()).not.toBe('Invalid Date');
    });

    await test.step('Validate all market data entries contain required fields', async () => {
      const body = await response.json();

      for (const item of body.data as MarketDataItem[]) {
        expect(item.symbol).toBeTruthy();
        expect(typeof item.symbol).toBe('string');

        expect(typeof item.price).toBe('number');
        expect(item.price).toBeGreaterThan(0);

        expect(typeof item.timestamp).toBe('string');
      }
    });
  });

  test('validate AI insights endpoint returns summary and signal data', async ({ request }) => {
    const response = await validateResponseTime(request, '/api/ai-insights', 2500);

    await test.step('Validate status and content type', async () => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      await validateJsonContentType(response);
    });

    await test.step('Validate AI insights payload structure', async () => {
      const body = (await response.json()) as InsightsResponse;

      expect(body).toHaveProperty('summary');
      expect(body).toHaveProperty('signals');

      expect(typeof body.summary).toBe('string');
      expect(body.summary.length).toBeGreaterThan(20);

      expect(Array.isArray(body.signals)).toBeTruthy();
    });

    await test.step('Validate signals array contains usable values', async () => {
      const body = (await response.json()) as InsightsResponse;

      for (const signal of body.signals) {
        expect(typeof signal).toBe('string');
        expect(signal.length).toBeGreaterThan(2);
      }
    });
  });

  test('validate unauthorized endpoint access is blocked correctly', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/admin/reports`);

    await test.step('Validate unauthorized access control', async () => {
      expect([401, 403]).toContain(response.status());
    });
  });

  test('validate invalid endpoint returns correct error response', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/non-existent-endpoint`);

    await test.step('Validate not found behaviour', async () => {
      expect(response.status()).toBe(404);
    });
  });
});