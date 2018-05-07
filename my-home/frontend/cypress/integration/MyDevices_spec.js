describe('My devices page', function() {
  it('can be visited', function() {
    cy.visit('http://localhost:3000');
  });

  it('contains the home title', function() {
    cy.get('h2').contains('Home');
  });
});
