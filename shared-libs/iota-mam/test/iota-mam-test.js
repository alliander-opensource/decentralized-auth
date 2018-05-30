const { expect } = require('chai');
const MamClient = require('../src/iota-mam');
const generateSeed = require('@decentralized-auth/gen-seed');
const IotaClient = require('@decentralized-auth/iota');

const logger = new (function () { // eslint-disable-line func-names
  this.info = console.log; // eslint-disable-line no-console
  this.error = console.log; // eslint-disable-line no-console
})();

const iotaClient = new IotaClient({
  provider: 'http://node01.testnet.iotatoken.nl:16265',
  securityLevel: 2,
  depth: 5,
  minWeightMagnitude: 10,
}, logger);

describe('MAM', () => {
  let mamSeed;
  let mamSeed2;

  before('initialize seeds', async () => {
    mamSeed = await generateSeed();
    mamSeed2 = await generateSeed();
  });

  const sideKey = 'SWEETPOTATO';

  let mam = null;
  let mam2 = null;

  it('should initialize the MAM library', () => {
    mam = new MamClient(mamSeed, iotaClient, 'restricted', sideKey);

    const mamState = mam.getMamState();

    expect(mamState).to.have.property('subscribed');
    expect(mamState).to.have.property('channel').and.to.have.property('side_key');
    expect(mamState).to.have.property('seed');
    expect(mamState.seed).to.equal(mamSeed);
    expect(mamState.channel.side_key).to.equal(sideKey);
  });

  it('should initialize a second MAM public library instance without side key', () => {
    mam2 = new MamClient(mamSeed2, iotaClient, 'private');

    const mamState = mam2.getMamState();

    expect(mamState).to.have.property('subscribed');
    expect(mamState).to.have.property('channel').and.to.have.property('mode').and.to.equal('private');
    expect(mamState).to.have.property('seed');
    expect(mamState.seed).to.equal(mamSeed2);
    expect(mamState.channel.side_key).to.equal(null);
  });

  const message1 = { type: 'BANANA' };
  const message2 = { type: 'PEAR' };

  let testRoot1 = '';
  let testRoot2 = '';

  it('should be able to attach a message and get the root', async () => {
    const root = await mam.attach(message1);
    testRoot1 = root;

    expect(root).to.have.lengthOf(81);
  });

  it('should be able to attach another message and get the root', async () => {
    const root = await mam.attach(message2);
    testRoot2 = root;

    expect(root).to.have.lengthOf(81);
    expect(root).to.not.equal(testRoot1);
  });

  it('should be able to fetch the two messages', async () => {
    const res = await mam.fetch(testRoot1, 'restricted', sideKey);

    expect(res.nextRoot).to.have.lengthOf(81);
    expect(res.messages).to.be.an('array');
    expect(res.messages[0]).to.deep.equal(message1);
    expect(res.messages[1]).to.deep.equal(message2);
  });

  it('should be able to fetch from the second root', async () => {
    const res = await mam.fetch(testRoot2, 'restricted', sideKey);

    expect(res.nextRoot).to.have.lengthOf(81);
    expect(res.messages).to.be.an('array');
    expect(res.messages[0]).to.deep.equal(message2);
  });

  let testRoot3 = '';

  it('should be able to attach a public message using second lib and get the root', async () => {
    const root = await mam2.attach(message1);
    testRoot3 = root;

    expect(root).to.have.lengthOf(81);
  });

  it('should be able to fetch from the root using the second lib', async () => {
    const res = await mam2.fetch(testRoot3, 'private');

    expect(res.nextRoot).to.have.lengthOf(81);
    expect(res.messages).to.be.an('array');
    expect(res.messages[0]).to.deep.equal(message1);
  });
});
