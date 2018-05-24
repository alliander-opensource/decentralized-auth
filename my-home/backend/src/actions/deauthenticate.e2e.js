const {
  app, server, request, expect,
} = require('../common/test-utils');

const API_GET_SESSION_URL = '/api/get-session';
const API_DEAUTHENTICATE_URL = '/api/deauthenticate';

describe('Deauthenticate', () => {
  let cookie;
  let sessionId;
  let newSessionId;

  before(() =>
    request(app)
      .get(API_GET_SESSION_URL)
      .expect(200)
      .expect((res) => {
        sessionId = res.body.sessionId;
        cookie = res.headers['set-cookie'];
      }));

  after(() =>
    server.close());

  it('returns a new session id and a new cookie', () =>
    request(app)
      .get(API_DEAUTHENTICATE_URL)
      .set('cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.headers).to.have.property('set-cookie');
        expect(res.body).to.have.property('sessionId');
        expect(res.body.sessionId).to.not.equal(sessionId);
        newSessionId = res.body.sessionId;
        cookie = res.headers['set-cookie'];
      }));

  it('causes get-session to return the new session id', () =>
    request(app)
      .get(API_GET_SESSION_URL)
      .set('cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('sessionId');
        expect(res.body.sessionId).to.equal(newSessionId);
      }));
});
