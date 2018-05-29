/**
 * Wrapper around ntrujs NTRUEncrypt. Provides convenience
 * methods to work with the IOTA Tangle.
 *
 * - Create an NTRU key pair based on an IOTA seed.
 * - Convert a public key to trytes so it can be send over IOTA.
 * - Encrypt to trytes using tryte encoded public key.
 * - Decrypt trytes.
 *
 * @module ntru
 */


const { TextEncoder } = require('util');
const NTRU = require('ntrujs');
const iota = require('./iota');


/**
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


/**
 * Creates an NTRU key pair based on a seed.
 *
 * @function createKeyPair
 * @param {string} seed IOTA seed to generate key pair with
 * @returns {Object} Key pair with private and public keys
 */
function createKeyPair(seed) {
  const bytes = toBytes(seed);
  const keyPair = NTRU.createKeyWithSeed(bytes);

  return keyPair;
}


/**
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


/**
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


/**
 * Decrypts trytes with NTRU encoded cipher text with private key.
 *
 * @function encrypt
 * @param {string} trytes Trytes to decrypt
 * @param {Buffer} privateKey Private key
 * @returns {string} Plain text string
 */
function decrypt(trytes, privateKey) {
  const buffer = fromTrytes(trytes);
  const decrypted = NTRU.decrypt(buffer, privateKey);

  return decrypted.toString();
}


/**
 * Encrypts string with public key.
 *
 * @function encrypt
 * @param {string} str String to encrypt
 * @param {string} publicKey Tryte encoded public key
 * @returns {string} Tryte encoded NTRU encrypted MAM data
 */
function encrypt(str, publicKey) {
  if (str.length > 106) {
    throw new Error(`Cannot encrypt string ${str} because it is longer than 106 characters`);
  }

  const publicKeyBuffer = fromTrytes(publicKey);
  const plainText = Buffer.from(str, 'utf8');
  const encrypted = NTRU.encrypt(plainText, publicKeyBuffer);
  const encryptedTrytes = toTrytes(encrypted);

  return encryptedTrytes;
}


// Need to call `NTRU.createKey` before creating a key pair or encrypting or
// decrypting, otherwise it does not work. See
// https://github.com/IDWMaster/ntrujs/issues/6.

NTRU.createKey();

module.exports = {
  toBytes,
  createKeyPair,
  toTrytes,
  fromTrytes,
  encrypt,
  decrypt,
};
