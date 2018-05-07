const { app, server, request, expect } = require('../common/test-utils');

const API_GET_SESSION_URL = '/api/get-session';
const API_START_DISCLOSURE_SESSION_URL = '/api/start-disclosure-session';
const API_DISCLOSURE_STATUS_URL = '/api/disclosure-status';

describe('Disclosure session', () => {
  let cookie;
  let irmaSessionId;

  before(() =>
    request(app)
      .get(API_GET_SESSION_URL)
      .expect(200)
      .expect((res) => {
        cookie = res.headers['set-cookie'];
      }),
  );

  after(() =>
    server.close(),
  );

  it('returns qr content when starting a disclosure-session', () =>
    request(app)
      .post(API_START_DISCLOSURE_SESSION_URL)
      .set('cookie', cookie)
      .send({
        content: [
          {
            label: 'Address',
            attributes: ['pbdf.pbdf.idin.address'],
          }, {
            label: 'City',
            attributes: ['pbdf.pbdf.idin.city'],
          },
        ],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('irmaSessionId');
        expect(res.body).to.have.property('qrContent');
        irmaSessionId = res.body.irmaSessionId;
      }),
  );

  it('has an endpoint to check disclosure status', () =>
    request(app)
      .get(`${API_DISCLOSURE_STATUS_URL}?irmaSessionId=${irmaSessionId}`)
      .set('cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('disclosureStatus').and.to.equal('PENDING');
        expect(res.body).to.have.property('serverStatus').and.to.equal('INITIALIZED');
      }),
  );

  // TODO add nock to stub IRMA API SERVER
  // see https://github.com/node-nock/nock
  const addressAttributeType = 'pbdf.pbdf.idin.address';
  const cityAttributeType = 'pbdf.pbdf.idin.city';

  xit('adds the disclosed attributes to the users\' session', () =>
    request(app)
      .get(API_GET_SESSION_URL)
      .set('cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('sessionId');
        expect(res.body).to.have.property('attributes');
        expect(res.body.attributes).to.have.property(addressAttributeType);
        expect(res.body.attributes).to.have.property(cityAttributeType);
      }),
  );
});
