import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  readonly emailInput = () => this.page.locator('#email');
  readonly passwordInput = () => this.page.locator('#password');
  readonly submitButton = () => this.page.locator('button[type="submit"]');
  readonly errorMessage = () => this.page.locator('[data-testid="login-error"]');

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
  readonly profileMenuButton = () => this.page.locator('[data-testid="profile-menu-button"]');
  readonly logoutButton = () => this.page.locator('[data-testid="logout-button"]');

  async waitForLoad() {
    await expect(this.dashboardHeader()).toContainText(/dashboard|financial overview/i);
  }

  async logout() {
    await this.profileMenuButton().click();
    await this.logoutButton().click();
  }
}

test.describe('Authentication and Session Management', () => {
  test('valid user can log in and access protected dashboard route', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/login/);
    });

    await test.step('Authenticate with valid credentials', async () => {
      await loginPage.login('testuser@example.com', 'SecurePassword123');
      await expect(page).toHaveURL(/dashboard/);
      await dashboardPage.waitForLoad();
    });

    await test.step('Verify protected dashboard content is visible', async () => {
      await expect(dashboardPage.dashboardHeader()).toBeVisible();
    });
  });

  test('invalid login attempt shows authentication error and blocks access', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await test.step('Attempt login with invalid credentials', async () => {
      await loginPage.login('invalid-user@example.com', 'WrongPassword123');
    });

    await test.step('Verify access is denied', async () => {
      await expect(page).toHaveURL(/login/);
      await expect(loginPage.errorMessage()).toBeVisible();
      await expect(loginPage.errorMessage()).toContainText(/invalid|incorrect|denied/i);
    });
  });

  test('unauthenticated user is redirected when attempting direct access to protected route', async ({ page }) => {
    await test.step('Attempt to open protected route without session', async () => {
      await page.goto('https://example.com/dashboard', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL(/login/);
    });
  });

  test('authenticated session persists after page refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await test.step('Log in successfully', async () => {
      await loginPage.goto();
      await loginPage.login('testuser@example.com', 'SecurePassword123');
      await expect(page).toHaveURL(/dashboard/);
      await dashboardPage.waitForLoad();
    });

    await test.step('Refresh page and verify session persistence', async () => {
      await page.reload({ waitUntil: 'networkidle' });
      await expect(page).toHaveURL(/dashboard/);
      await dashboardPage.waitForLoad();
    });
  });

  test('user can log out and loses access to protected route', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await test.step('Authenticate successfully', async () => {
      await loginPage.goto();
      await loginPage.login('testuser@example.com', 'SecurePassword123');
      await expect(page).toHaveURL(/dashboard/);
      await dashboardPage.waitForLoad();
    });

    await test.step('Log out from the application', async () => {
      await dashboardPage.logout();
    });

    await test.step('Verify user is redirected to login page', async () => {
      await expect(page).toHaveURL(/login/);
    });

    await test.step('Verify protected route is no longer accessible', async () => {
      await page.goto('https://example.com/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/login/);
    });
  });
});