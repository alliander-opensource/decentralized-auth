const ntru = require('../src/modules/ntru');
const { expect } = require('../src/common/test-utils');

const seed = 'AYYUXKIAEOGGXPZIM9GGDLERZEBKVNEOGR9SPSF9ANHWSISVHKEQNTADSZFSMYFKGVVRAYFNTXEPWRLJK';

describe('NTRU', () => {
  describe('ntru.toBytes', () =>
    it('should encode string to UTF 8 byte array', () => {
      const bytes = ntru.toBytes('hello');

      expect(bytes).to.deep.equal(new Uint8Array([104, 101, 108, 108, 111]));
    }));

  describe('ntru.createKeyPair', () =>
    it('should create an asymmetric key pair based on seed, deterministically', () => {
      const keyPair1 = ntru.createKeyPair(seed);
      const keyPair2 = ntru.createKeyPair(seed);

      expect(keyPair1.public).to.have.lengthOf(1027);
      expect(keyPair1.private).to.have.lengthOf(1120);
      expect(keyPair1).to.deep.equal(keyPair2);
    }));

  describe('ntru.base64 and back', () =>
    it('convert base 64 and back', () => {
      const keyPair = ntru.createKeyPair(seed);

      const b64 = keyPair.public.toString('base64');
      const converted = Buffer.from(b64, 'base64');

      expect(converted).to.deep.equal(keyPair.public);
    }));

  describe('ntru.toTrytes', () =>
    it('should be able to convert keyPair to tryte representation', () => {
      const keyPair = ntru.createKeyPair(seed);
      const publicKeyTrytes = ntru.toTrytes(keyPair.public);

      expect(publicKeyTrytes).to.have.lengthOf(2744);
    }));

  describe('ntru.fromTrytes', () =>
    it('should be able to convert tryte representaton of keyPair to keyPair object', () => {
      const keyPair = ntru.createKeyPair(seed);
      const publicKeyTrytes = ntru.toTrytes(keyPair.public);
      const publicKeyConverted = ntru.fromTrytes(publicKeyTrytes);

      expect(publicKeyConverted).to.deep.equal(keyPair.public);
    }));

  describe('ntru.encrypt and ntru.decrypt', () => {
    it('should be able to encrypt and decrypt a message', () => {
      const keyPair = ntru.createKeyPair(seed);

      const plainText = Buffer.from('hello', 'utf8');
      const encrypted = ntru.encrypt(plainText, ntru.toTrytes(keyPair.public));
      const decrypted = ntru.decrypt(encrypted, keyPair.private);

      expect(encrypted.toString()).to.not.equal(plainText.toString());
      expect(plainText.toString()).to.equal(decrypted.toString());
    });

    it('should be able to decrypt messages up to and including length 107', () => {

      const keyPair = ntru.createKeyPair(seed);

      const plainText = Buffer.from(Array(107).join('A'), 'utf8');
      const encrypted = ntru.encrypt(plainText, ntru.toTrytes(keyPair.public));
      const decrypted = ntru.decrypt(encrypted, keyPair.private);

      expect(decrypted.toString()).to.equal(plainText.toString());
    });

    it('fails on string longer than 107', () => {
      const keyPair = ntru.createKeyPair(seed);

      const plainText = Buffer.from(Array(108).join('A'), 'utf8');
      const encrypted = ntru.encrypt(plainText, ntru.toTrytes(keyPair.public));
      const decrypted = ntru.decrypt(encrypted, keyPair.private); // all \u0000

      expect(decrypted[0]).to.equal('\u0000');
    });
  });
});
