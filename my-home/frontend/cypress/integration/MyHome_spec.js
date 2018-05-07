describe('The MyHome page', function() {
  beforeEach(function() {
    // Mock the backend request with default responses
    cy.server();
    cy.route('POST', '/api/start-disclosure-session', 'fixture:api/start-disclosure-session').as('start-disclosure-session');
    cy.route('GET', '/api/disclosure-status*', 'fixture:api/disclosure-status/initialized').as('disclosure-status');
    cy.route('GET', '/api/get-session', 'fixture:api/get-session/empty').as('get-session');
    cy.visit('http://localhost:3000/my-home');
  });

  it('should start a disclosure session and poll for disclosure status', function() {
    cy.wait('@start-disclosure-session');
    cy.wait('@get-session');
    cy.get('#qr-content');
    cy.wait('@disclosure-status');
    cy.wait('@disclosure-status');
    cy.wait('@disclosure-status');
  });

  it('should show a message directing the user to his phone after scanning the qr', function() {
    cy.route('GET', '/api/disclosure-status*', 'fixture:api/disclosure-status/connected').as('disclosure-status');
    cy.wait('@disclosure-status');
    cy.get('#qr-scanned');
  });

  it('should inform the user when he cancels disclosure', function() {
    cy.route('GET', '/api/disclosure-status*', 'fixture:api/disclosure-status/cancelled').as('disclosure-status');
    cy.wait('@disclosure-status');
    cy.get('#disclosure-cancelled');
  });

  it('should inform the user when the qr code expires', function() {
    cy.route('GET', '/api/disclosure-status*', 'fixture:api/disclosure-status/expired').as('disclosure-status');
    cy.wait('@disclosure-status');
    cy.get('#qr-expired');
  });

  it('should show an error when disclosure fails', function() {
    cy.route('GET', '/api/disclosure-status*', 'fixture:api/disclosure-status/completed-invalid').as('disclosure-status');
    cy.wait('@disclosure-status');
    cy.get('#disclosure-error');
  });

});
