const { expect } = require('chai');
const iota = require('../src/modules/iota');

const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';
const addr = 'JHLL9VAGBCTCCARFSIKNNWEGHQFHQYDCWEQYTDUISHLIPQPZGOUQAJWY9VSP9BNAZNZUCFGMKPXOPFULY';

describe('Iota', () => {
  describe('getAddress', () =>
    it('should return a new address', async () => {
      const total = 1;
      const [address] = await iota.getAddress(seed, total);

      expect(address).to.equal(addr);
    }));
});
