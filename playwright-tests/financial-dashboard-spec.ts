import { test, expect, Page, APIResponse } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  readonly emailInput = () => this.page.locator('#email');
  readonly passwordInput = () => this.page.locator('#password');
  readonly submitButton = () => this.page.locator('button[type="submit"]');
  readonly errorBanner = () => this.page.locator('[data-testid="login-error"]');

  async goto() {
    await this.page.goto('https://example.com/login', { waitUntil: 'domcontentloaded' });
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  readonly dashboardHeader = () => this.page.locator('h1');
  readonly graphContainer = () => this.page.locator('[data-testid="financial-graph"]');
  readonly portfolioValueCard = () => this.page.locator('[data-testid="portfolio-value"]');
  readonly marketInsightPanel = () => this.page.locator('[data-testid="market-insights"]');
  readonly loadingSpinner = () => this.page.locator('[data-testid="loading-spinner"]');
  readonly refreshButton = () => this.page.locator('[data-testid="refresh-dashboard"]');

  async waitForDashboardToLoad() {
    await expect(this.dashboardHeader()).toContainText(/dashboard|financial overview/i);
    await expect(this.loadingSpinner()).toHaveCount(0);
    await expect(this.graphContainer()).toBeVisible();
    await expect(this.portfolioValueCard()).toBeVisible();
    await expect(this.marketInsightPanel()).toBeVisible();
  }
}

test.describe('Financial Dashboard Validation', () => {
  test('authenticated user can load dashboard, validate API responses, and interact with widgets', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    let marketDataResponse: APIResponse | null = null;
    let insightsResponse: APIResponse | null = null;

    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/login/);
      await expect(loginPage.emailInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
    });

    await test.step('Log in with valid credentials', async () => {
      await loginPage.login('testuser@example.com', 'SecurePassword123');
      await expect(page).toHaveURL(/dashboard/);
    });

    await test.step('Capture dashboard API responses', async () => {
      const [marketResponse, aiInsightsResponse] = await Promise.all([
        page.waitForResponse(response =>
          response.url().includes('/api/market-data') &&
          response.request().method() === 'GET' &&
          response.status() === 200
        ),
        page.waitForResponse(response =>
          response.url().includes('/api/ai-insights') &&
          response.request().method() === 'GET' &&
          response.status() === 200
        ),
      ]);

      marketDataResponse = marketResponse;
      insightsResponse = aiInsightsResponse;
    });

    await test.step('Validate dashboard UI components are fully rendered', async () => {
      await dashboardPage.waitForDashboardToLoad();
      await expect(dashboardPage.graphContainer()).toHaveCount(1);
      await expect(dashboardPage.portfolioValueCard()).not.toBeEmpty();
      await expect(dashboardPage.marketInsightPanel()).toContainText(/market|insight|trend/i);
    });

    await test.step('Validate market data API payload structure', async () => {
      expect(marketDataResponse).not.toBeNull();

      const marketJson = await marketDataResponse!.json();

      expect(Array.isArray(marketJson.data)).toBeTruthy();
      expect(marketJson.data.length).toBeGreaterThan(0);

      const firstItem = marketJson.data[0];
      expect(firstItem).toHaveProperty('symbol');
      expect(firstItem).toHaveProperty('price');
      expect(firstItem).toHaveProperty('timestamp');

      expect(typeof firstItem.symbol).toBe('string');
      expect(typeof firstItem.price).toBe('number');
      expect(firstItem.price).toBeGreaterThan(0);
    });

    await test.step('Validate AI insights API payload structure', async () => {
      expect(insightsResponse).not.toBeNull();

      const insightsJson = await insightsResponse!.json();

      expect(insightsJson).toHaveProperty('summary');
      expect(insightsJson).toHaveProperty('signals');
      expect(typeof insightsJson.summary).toBe('string');
      expect(insightsJson.summary.length).toBeGreaterThan(10);
      expect(Array.isArray(insightsJson.signals)).toBeTruthy();
    });

    await test.step('Verify refresh interaction reloads dashboard data correctly', async () => {
      const refreshResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/market-data') &&
        response.request().method() === 'GET' &&
        response.status() === 200
      );

      await dashboardPage.refreshButton().click();

      const refreshResponse = await refreshResponsePromise;
      const refreshedJson = await refreshResponse.json();

      expect(Array.isArray(refreshedJson.data)).toBeTruthy();
      expect(refreshedJson.data.length).toBeGreaterThan(0);
      await expect(dashboardPage.graphContainer()).toBeVisible();
    });

    await test.step('Confirm there are no critical front-end console errors', async () => {
      const consoleErrors: string[] = [];

      page.on('console', message => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      await page.reload({ waitUntil: 'networkidle' });
      await dashboardPage.waitForDashboardToLoad();

      const criticalErrors = consoleErrors.filter(error =>
        !error.includes('favicon') &&
        !error.toLowerCase().includes('warning')
      );

      expect(criticalErrors).toEqual([]);
    });
  });
});