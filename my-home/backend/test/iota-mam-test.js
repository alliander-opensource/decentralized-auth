const mam = require('../src/modules/iota-mam');
const { expect, generateSeedForTestingPurposes } = require('../src/common/test-utils');

describe('MAM', () => {
  const mamSeed = generateSeedForTestingPurposes();

  it('should initialize the MAM library', () => {
    mam.init(mamSeed);

    const mamState = mam.getMamState();

    expect(mamState).to.have.property('subscribed');
    expect(mamState).to.have.property('channel').and.to.have.property('side_key');
    expect(mamState).to.have.property('seed');
    expect(mamState.seed).to.equal(mamSeed);
  });

  const message1 = { type: 'BANANA' };
  const message2 = { type: 'APPLE' };

  let testRoot1 = '';
  let testRoot2 = '';

  it('should be able to attach a message and get the root', () =>
    mam.attach(message1)
      .then((root) => {
        testRoot1 = root;
        return root;
      })
      .then(root =>

        expect(root).to.have.lengthOf(81)));

  it('should be able to attach another message and get the root', () =>
    mam.attach(message2)
      .then((root) => {
        testRoot2 = root;
        return root;
      })
      .then((root) => {
        expect(root).to.have.lengthOf(81);
        expect(root).to.not.equal(testRoot1);
      }));

  it('should be able to fetch the two messages', () =>
    mam.fetch(testRoot1)
      .then((res) => {
        expect(res.nextRoot).to.have.lengthOf(81);
        expect(res.messages).to.be.an('array');
        expect(res.messages[0]).to.deep.equal(message1);
        expect(res.messages[1]).to.deep.equal(message2);
      }));

  it('should be able to fetch from the second root', () =>
    mam.fetch(testRoot2)
      .then((res) => {
        expect(res.nextRoot).to.have.lengthOf(81);
        expect(res.messages).to.be.an('array');
        expect(res.messages[0]).to.deep.equal(message2);
      }));
});
