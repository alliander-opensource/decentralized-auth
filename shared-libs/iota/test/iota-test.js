const uuidv4 = require('uuid/v4');
const { expect } = require('chai');
const IotaClient = require('../src/iota');

const logger = new (function () { // eslint-disable-line func-names
  this.info = console.log; // eslint-disable-line no-console
  this.error = console.log; // eslint-disable-line no-console
})();

const iota = new IotaClient({
  provider: 'http://node01.testnet.iotatoken.nl:16265',
  securityLevel: 2,
  depth: 5,
  minWeightMagnitude: 10,
}, logger);


const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';
const addr = 'JHLL9VAGBCTCCARFSIKNNWEGHQFHQYDCWEQYTDUISHLIPQPZGOUQAJWY9VSP9BNAZNZUCFGMKPXOPFULY';

describe('Iota', () => {
  const genMessage = () => ({ message: uuidv4() });
  const message = genMessage();

  const genLongMessage = () => ({ message: Array(2000).join('A') });
  const longMessage = genLongMessage(); // does not fit in one transaction

  let receiveAddress;

  before(async () => {
    // in the test we send from first address of seed and receive on second
    // address of seed
    [, receiveAddress] = await iota.getAddress(seed, 2);
  });

  describe('getAddress', () =>
    it('should return a new address', async () => {
      const total = 1;
      const [address] = await iota.getAddress(seed, total);

      expect(address).to.equal(addr);
    }));

  describe('send', () => {
    it('should send a transfer', async () => {
      const transactions = await iota.send(seed, receiveAddress, message);

      expect(transactions).to.be.an('array');
    });

    it('should be able to retrieve the message', async () => {
      const messageFromIota = await iota.getLastMessage({ addresses: [receiveAddress] });

      expect(messageFromIota).to.have.property('message').and.to.equal(message.message);
    });

    it('should be able to send a message that spans multiple transactions', async () => {
      const transactions = await iota.send(seed, receiveAddress, longMessage);

      expect(transactions).to.be.an('array');
    });

    it('should be able to retrieve a long message that spans multiple transactions', async () => {
      const messageFromIota = await iota.getLastMessage({ addresses: [receiveAddress] });

      expect(messageFromIota).to.have.property('message').and.to.equal(longMessage.message);
    });
  });
});
