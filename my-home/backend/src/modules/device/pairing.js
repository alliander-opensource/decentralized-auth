const logger = require('../../logger')(module);
const iota = require('../iota');
const ntru = require('../ntru');


const CLAIM_DEVICE_TYPE = 'CLAIM_DEVICE';
const ANSWER_CHALLENGE_TYPE = 'ANSWER_CHALLENGE';


/**
 * Initiate a device claim (pairing) by sending a message to a device connected
 * with IOTA. Device will respond to the sender with a challenge to be signed
 * with the key on the device.
 *
 * @function claimDevice
 * @param {string} seed IOTA seed of the sender
 * @param {string} sender IOTA address of the sender
 * @param {string} deviceAddress IOTA address of the receiving device
 * @returns {Promise}
 */
function claimDevice(seed, sender, deviceAddress) {
  logger.info(`Initiate device claim of ${deviceAddress}`);

  const message = { type: CLAIM_DEVICE_TYPE, sender };
  return iota.send(seed, deviceAddress, message);
}


/**
 * Answer a challenge of a device with the message signed with the key on the
 * device. Result can be found via {@link iota.getLastMessage} and searching for
 * the {@link CLAIM_RESULT_TYPE}. Send public key along because when claim
 * status is OK response will contain MAM data encrypted with the public key.
 *
 * @function answerChallenge
 * @param {string} seed IOTA seed of the sender
 * @param {string} sender IOTA address of the sender
 * @param {string} publicKey Tryte encoded public key of sender
 * @param {string} deviceAddress IOTA address of the receiving device
 * @param {string} signedChallenge Signed challenge of the device
 * @returns {Promise}
 */
function answerChallenge(seed, sender, publicKey, deviceAddress, signedChallenge) {
  logger.info(`Answering challenge of ${deviceAddress}`);

  const message = {
    type: ANSWER_CHALLENGE_TYPE,
    sender,
    publicKey,
    signedChallenge,
  };
  return iota.send(seed, deviceAddress, message);
}


/**
 * A claim is successful if we have received a claim result of the device and
 * the returned status is "OK"
 *
 * @function isSuccessfulClaim
 * @param {string} claimMessage Received message
 * @param {string} deviceAddress Address of the device
 * @returns {boolean} True when successful and false when not
 */
function isSuccessfulClaim(claimMessage, deviceAddress) {
  return claimMessage.sender === deviceAddress && claimMessage.status === 'OK';
}


/**
 * Decrypts mamData in a claim with the privateKey.
 *
 * @function decryptMamData
 * @param {Object} claim Claim result where mamData field is encrypted
 * @param {Buffer} privateKey Private key to decrypt the MAM data with
 * @returns {Promise} With last successful claim, "NOK" or reject "NO RESULT"
 */
function decryptMamData(claim, privateKey) {
  logger.info(`Decrypting claim ${JSON.stringify(claim)} with private key ${privateKey}`);

  const { sideKey, root } = claim.mamData;
  const decryptedMamData = {
    sideKey: ntru.decrypt(sideKey, privateKey),
    root: ntru.decrypt(root, privateKey),
  };

  const decryptedClaim = claim;
  decryptedClaim.mamData = decryptedMamData;

  logger.info(`Decrypted claim ${JSON.stringify(decryptedClaim)}`);

  return decryptedClaim;
}


module.exports = {
  claimDevice,
  answerChallenge,
  isSuccessfulClaim,
  decryptMamData,
  CLAIM_DEVICE_TYPE,
  ANSWER_CHALLENGE_TYPE,
};
