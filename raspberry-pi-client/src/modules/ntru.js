const { TextEncoder } = require('util');
const NTRU = require('ntrujs');
const iota = require('./iota');


/*
 * Converts string to Uint8Array.
 *
 * @param {string} str String to convert
 * @return {UintArray} The byte array that represents the string
 */
function toBytes(str) {
  const utf8Encoder = new TextEncoder('utf-8');
  const bytes = utf8Encoder.encode(str);

  return bytes;
}


/*
 * Creates an NTRU key pair based on a seed.
 *
 * @function createAsymmetricKeyPair
 * @param {string} seed IOTA seed to generate key pair with
 * @returns {Object} Key pair with private and public keys
 */
function createAsymmetricKeyPair(seed) {
  const bytes = toBytes(seed);
  const keyPair = NTRU.createKeyWithSeed(bytes);

  // Need to call `NTRU.createKey` after `NTRU.createKeyWithSeed` for some
  // reason, otherwise encrypting and decrypting does not work. See
  // https://github.com/IDWMaster/ntrujs/issues/6.
  NTRU.createKey();

  return keyPair;
}


/*
 * Converts a NTRU public key to trytes.
 * First converts to base64 and then to trytes.
 *
 * @function toTrytes
 * @param {Buffer} key NTRU public key
 * @returns {string} Tryte representation of public key pair
 */
function toTrytes(key) {
  const publicKeyTrytes = iota.toTrytes(key.toString('base64'));

  return publicKeyTrytes;
}


/*
 * Converts an NTRU public key that was converted to trytes by {@link toTrytes}
 * back to an NTRU public key.
 * First converts from trytes to base64 and then to Buffer.
 *
 * @function toTrytes
 * @param {string} keyTrytes NTRU public key converted to trytes
 * @returns {Buffer} NTRU public key
 */
function fromTrytes(keyTrytes) {
  const publicKey = Buffer.from(iota.fromTrytes(keyTrytes), 'base64');

  return publicKey;
}

const { encrypt, decrypt } = NTRU;

module.exports = {
  toBytes,
  createAsymmetricKeyPair,
  toTrytes,
  fromTrytes,
  encrypt,
  decrypt,
};
