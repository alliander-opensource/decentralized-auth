describe('The app', function() {
  beforeEach(function() {
    // Mock the backend request with default responses
    cy.server();
    cy.route('GET', '/api/get-session', 'fixture:api/get-session/empty').as('get-session');
    cy.route('GET', '/api/deauthenticate', 'fixture:api/deauthenticate').as('deauthenticate');
    cy.visit('http://localhost:3000');
  });

  describe('The SideMenu', function() {
    it('is displayed', function () {
      cy.get('#navigation-menu');
    });
  });

  describe('The main content area', function() {
    it('is displayed', function () {
      cy.get('#main-content');
    });
  });

  describe('The UserInfoPanel', function() {
    it('is displayed', function() {
      cy.wait('@get-session');
      cy.get('#user-panel');
    });

    it('contains the session id', function() {
      cy.get('#session-id');
    });
  });

  describe('The navigation bar', function() {
    it('contains a user icon', function() {
      cy.get('#navbar-user-icon');
    });

    describe('when clicking the user icon', function() {
      it('should show a menu', function() {
        cy.get('#navbar-user-icon').click();
        cy.get('#user-menu');
      });

      it('it contains a deauthenticate button', function() {
        cy.get('#navbar-user-icon').click();
        cy.get('#deauthenticate-button');
      });

      describe('when clicking the deauthenticate button', function() {
        it('it should drop the session and retrieve a new session id', function() {
          cy.get('#navbar-user-icon').click();
          cy.route('GET', '/api/get-session', 'fixture:api/get-session/new-session').as('get-session');
          cy.get('#session-id')
            .invoke('text')
            .then(oldSessionId => {
              cy.get('#deauthenticate-button').click();
              cy.wait('@deauthenticate');
              cy.wait('@get-session');
              cy.get('#session-id')
                .invoke('text')
                .should(newSessionId => expect(newSessionId).not.to.eq(oldSessionId))
            });
        });
      });

    });

  });

});
