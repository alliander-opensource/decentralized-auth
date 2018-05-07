const iota = require('../src/modules/iota');
const uuidv4 = require('uuid/v4');
const { expect } = require('../src/common/test-utils');

const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';
const addr = 'TYQFOPRBMRMFNX9DITYKIRGKZLFSQBGQSHARNPJJMWVMOGGPEXWZSBSIA9EZOFYLJFKGDLLXYZSLLMFIX';

describe('Iota', () => {
  const genMessage = () => ({ message: uuidv4() });
  const message = genMessage();

  let receiveAddress;

  before(() =>
    // in the test we send from first address of seed and receive on second
    // address of seed
    iota.getAddress(seed, 2)
      .then(([, secondAddress]) => {
        receiveAddress = secondAddress;
      }));

  describe('getAddress', () =>
    it('should return a new address', () => {
      const total = 1;
      iota.getAddress(seed, total)
        .then(([address]) =>

          expect(address).to.equal(addr));
    }));

  describe('send', () => {
    it('should send a transfer', () =>
      iota.send(seed, receiveAddress, message)
        .then(transactions =>

          expect(transactions).to.be.an('array')));

    it('should be able to retrieve the message', () =>
      iota.getLastMessage(receiveAddress)
        .then(messageFromIota =>

          expect(messageFromIota).to.have.property('message').to.equal(message.message)));
  });

  describe('totrytes', () => {
    const msg = {
      type: 'CHALLENGE',
      sender: 'AYIMLSFNKRYATURTECBQDZDDCDSXIDHYYIOBCSGKSPA9T9LNIXTNRKJMMYVMGSMKYADLBOPDXYVKRINOX',
      challenge: 'SIRXT9YCKLZETSFMGNEIQFDYZOUPJJRATUXYNUHFEOKQMQML9OFCNKXGSCOL9IWBTKWKTPCJARCWS9PCLFYOYGPQDSVMPIWASJXHYDDYGHSRWAPVSSZXJKFAKVKUGHXTFSCVHLLCLQXKGIYSUUAVYADHLHW9ZEPTPXNEXZGTQCRCARAKZPVNZPRHFLNZZZTVCDZLXHCDNGPKUPBDCRAZBJTOIYOOS9NQGPSUQWXYBDHOCU',
    };

    it('should be able to convert a message to trytes', () =>

      expect(iota.toTrytes(JSON.stringify(msg))).to.have.lengthOf(732));
  });
});
