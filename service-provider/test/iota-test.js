const { expect } = require('chai');
const iota = require('../src/modules/iota');

const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';
const addr = 'TYQFOPRBMRMFNX9DITYKIRGKZLFSQBGQSHARNPJJMWVMOGGPEXWZSBSIA9EZOFYLJFKGDLLXYZSLLMFIX';

describe('Iota', () => {
  describe('getAddress', () =>
    it('should return a new address', () => {
      const total = 1;
      iota.getAddress(seed, total)
        .then(([address]) =>

          expect(address).to.equal(addr));
    }));
});
