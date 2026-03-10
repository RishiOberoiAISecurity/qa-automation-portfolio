# QA Automation Portfolio

This repository contains a collection of automated test examples demonstrating modern **Quality Assurance engineering practices** across multiple testing frameworks. The examples simulate real-world testing scenarios commonly found in SaaS and cloud-based web applications.

The goal of this portfolio is to demonstrate the ability to design structured automated tests that validate **user workflows, backend services, and authentication behaviour** using widely adopted industry tools.

---

# Frameworks Demonstrated

This repository includes automated test implementations using three major testing frameworks.

### Playwright

Used for modern browser automation and service-level validation.

Examples include:

• End-to-end financial dashboard validation
• API response structure testing
• Authentication and session management testing

### Cypress

Used for frontend end-to-end testing with network interception and UI validation.

Examples include:

• Dashboard user flow automation
• API interception and response validation
• Protected route testing
• Invalid login handling

### Selenium WebDriver

Used for browser automation with traditional WebDriver-based test execution.

Examples include:

• Login authentication workflow
• Dashboard component validation
• Browser-driven automation testing

---

# Test Scenarios Demonstrated

### Financial Dashboard End-to-End Testing

Automated browser tests validate the loading and behaviour of a financial dashboard, including authentication, graph rendering, and dashboard widget visibility.

### API Validation Testing

Direct API tests verify service responses including status codes, JSON payload structure, response time, and error handling for unauthorized access.

### Authentication and Session Management

Tests ensure that protected routes require authentication, sessions persist correctly after refresh, and logout behaviour invalidates access to secured pages.

### User Journey Validation

End-to-end tests simulate real user behaviour including login attempts, dashboard interaction, and error handling for invalid credentials.

---

# Example Test Evidence

The repository includes screenshots showing successful execution of automated tests across different frameworks.

These demonstrate:

• Playwright test runner output
• Cypress test runner execution
• Selenium WebDriver automation output

These screenshots provide **visual proof of automated test execution** and complement the provided test scripts.

---

# Technologies Used

### Testing Frameworks

• Playwright
• Cypress
• Selenium WebDriver

### Languages

• TypeScript
• JavaScript
• Python

### Automation Techniques

• End-to-end testing
• API validation
• UI component validation
• Authentication testing
• Session management testing
• Network request interception

---

# Purpose of This Repository

This repository is intended to demonstrate practical QA automation capabilities across modern testing frameworks. The examples focus on validating realistic application behaviour such as authentication workflows, dashboard interactions, and backend API responses.

The test scenarios reflect testing approaches commonly used in modern SaaS platforms where automated testing is critical for ensuring reliable deployments and high-quality software releases.

---

# Author

Rishi Oberoi
QA Automation Engineer
Glasgow, United Kingdom

---

qa-automation-portfolio
│
├── playwright-tests
│   ├── financial-dashboard.spec.ts
│   ├── api-validation.spec.ts
│   └── auth-session.spec.ts
│
├── cypress-tests
│   └── dashboard-flow.cy.js
│
├── selenium-tests
│   └── dashboard_test.py
│
├── screenshots
│   ├── playwright-test-results.png
│   ├── playwright-api-validation-test-results.png
│   ├── playwright-auth-session-test-results.png
│   ├── cypress-dashboard-flow-test-results.png
│   └── selenium-dashboard-test-results.png
│
└── README.md
