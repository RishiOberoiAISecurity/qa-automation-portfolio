from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time


class LoginPage:
    def __init__(self, driver):
        self.driver = driver

    def email_input(self):
        return self.driver.find_element(By.ID, "email")

    def password_input(self):
        return self.driver.find_element(By.ID, "password")

    def login_button(self):
        return self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    def login(self, email, password):
        self.email_input().send_keys(email)
        self.password_input().send_keys(password)
        self.login_button().click()


class DashboardPage:
    def __init__(self, driver):
        self.driver = driver

    def dashboard_header(self):
        return WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )

    def financial_graph(self):
        return self.driver.find_element(By.CSS_SELECTOR, "[data-testid='financial-graph']")

    def portfolio_value(self):
        return self.driver.find_element(By.CSS_SELECTOR, "[data-testid='portfolio-value']")

    def market_insights(self):
        return self.driver.find_element(By.CSS_SELECTOR, "[data-testid='market-insights']")


def test_dashboard_flow():

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.maximize_window()

    try:
        driver.get("https://example.com/login")

        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)

        print("Navigated to login page")

        login_page.login("testuser@example.com", "SecurePassword123")

        WebDriverWait(driver, 10).until(
            EC.url_contains("/dashboard")
        )

        print("Login successful, dashboard loaded")

        header = dashboard_page.dashboard_header()
        assert header.is_displayed()

        graph = dashboard_page.financial_graph()
        assert graph.is_displayed()

        portfolio = dashboard_page.portfolio_value()
        assert portfolio.is_displayed()

        insights = dashboard_page.market_insights()
        assert insights.is_displayed()

        print("Dashboard widgets validated successfully")

        time.sleep(2)

    finally:
        driver.quit()


if __name__ == "__main__":
    test_dashboard_flow()