const {
  app, server, request, expect,
} = require('../common/test-utils');

const API_GET_SESSION_URL = '/api/get-session';

describe('Get session', () => {
  let cookie;
  let sessionId;

  after(() =>
    server.close());

  it('return session info and a session cookie', () =>
    request(app)
      .get(API_GET_SESSION_URL)
      .expect(200)
      .expect((res) => {
        expect(res.headers).to.have.property('set-cookie');
        expect(res.body).to.have.property('sessionId');
        expect(res.body).to.have.property('attributes');
        sessionId = res.body.sessionId;
        cookie = res.headers['set-cookie'];
      }));

  it('returns the same sessionId when passing a session cookie', () =>
    request(app)
      .get(API_GET_SESSION_URL)
      .set('cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('sessionId');
        expect(res.body).to.have.property('attributes');
        expect(res.body.sessionId).to.equal(sessionId);
      }));
});
