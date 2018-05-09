const { TextEncoder } = require('util');
const NTRU = require('ntrujs');
const iota = require('./iota');
const logger = require('../logger')(module);


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
 * @function createKeyPair
 * @param {string} seed IOTA seed to generate key pair with
 * @returns {Object} Key pair with private and public keys
 */
function createKeyPair(seed) {
  logger.info(`Creating key pair from seed ${seed}`);

  const bytes = toBytes(seed);
  const keyPair = NTRU.createKeyWithSeed(bytes);

  // Need to call `NTRU.createKey` after `NTRU.createKeyWithSeed`, otherwise
  // encrypting and decrypting does not work. See
  // https://github.com/IDWMaster/ntrujs/issues/6.
  NTRU.createKey();

  return keyPair;
}


/*
 * Converts a Buffer to trytes.
 * First converts to base64 and then to trytes.
 *
 * @function toTrytes
 * @param {Buffer} buffer Buffer to convert
 * @returns {string} Tryte representation of buffer
 */
function toTrytes(buffer) {
  const trytes = iota.toTrytes(buffer.toString('base64'));

  return trytes;
}


/*
 * Converts a buffer that was converted to trytes by {@link toTrytes}
 * back to a buffer.
 * First converts from trytes to base64 and then to Buffer.
 *
 * @function toTrytes
 * @param {string} trytes Buffer converted to trytes
 * @returns {Buffer} Original buffer
 */
function fromTrytes(trytes) {
  const buffer = Buffer.from(iota.fromTrytes(trytes), 'base64');

  return buffer;
}

const { encrypt, decrypt } = NTRU;

module.exports = {
  toBytes,
  createKeyPair,
  toTrytes,
  fromTrytes,
  encrypt,
  decrypt,
};
