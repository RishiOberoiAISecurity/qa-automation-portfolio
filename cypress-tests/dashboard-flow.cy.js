describe('Financial Dashboard User Flow', () => {
  beforeEach(() => {
    cy.visit('https://example.com/login');
  });

  it('logs in successfully and validates dashboard widgets', () => {
    cy.intercept('GET', '**/api/market-data').as('getMarketData');
    cy.intercept('GET', '**/api/ai-insights').as('getAiInsights');

    cy.get('#email').should('be.visible').type('testuser@example.com');
    cy.get('#password').should('be.visible').type('SecurePassword123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');

    cy.wait('@getMarketData').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('data');
      expect(interception.response.body.data).to.be.an('array').and.not.be.empty;
      expect(interception.response.body.data[0]).to.have.property('symbol');
      expect(interception.response.body.data[0]).to.have.property('price');
      expect(interception.response.body.data[0]).to.have.property('timestamp');
    });

    cy.wait('@getAiInsights').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('summary');
      expect(interception.response.body).to.have.property('signals');
      expect(interception.response.body.summary).to.be.a('string').and.not.be.empty;
      expect(interception.response.body.signals).to.be.an('array');
    });

    cy.get('h1').should('be.visible').and('contain.text', 'Dashboard');
    cy.get('[data-testid="financial-graph"]').should('be.visible');
    cy.get('[data-testid="portfolio-value"]').should('be.visible').and('not.be.empty');
    cy.get('[data-testid="market-insights"]').should('be.visible');

    cy.get('[data-testid="refresh-dashboard"]').should('be.visible').click();

    cy.wait('@getMarketData').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.data).to.be.an('array').and.not.be.empty;
    });

    cy.get('[data-testid="financial-graph"]').should('be.visible');
  });

  it('blocks dashboard access for unauthenticated users', () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('https://example.com/dashboard');
    cy.url().should('include', '/login');
  });

  it('shows an error for invalid login attempts', () => {
    cy.get('#email').type('invalid-user@example.com');
    cy.get('#password').type('WrongPassword123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login');
    cy.get('[data-testid="login-error"]')
      .should('be.visible')
      .and(($el) => {
        const text = $el.text().toLowerCase();
        expect(text).to.match(/invalid|incorrect|denied/);
      });
  });
});