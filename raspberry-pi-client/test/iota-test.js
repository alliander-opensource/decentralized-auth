const iota = require('../src/modules/iota');
const uuidv4 = require('uuid/v4');
const { expect } = require('chai');

const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';
const addr = 'TYQFOPRBMRMFNX9DITYKIRGKZLFSQBGQSHARNPJJMWVMOGGPEXWZSBSIA9EZOFYLJFKGDLLXYZSLLMFIX';

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
