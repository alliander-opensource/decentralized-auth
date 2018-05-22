const logger = require('../../logger')(module);
const iota = require('../iota');


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
 * @param {string} root IOTA MAM root of the sender (device will listen to it)
 * @param {string} deviceAddress IOTA address of the receiving device
 * @returns {Promise}
 */
function claimDevice(seed, sender, root, deviceAddress) {
  logger.info(`Initiate device claim of ${deviceAddress}`);

  const message = { type: CLAIM_DEVICE_TYPE, root, sender };
  return iota.send(seed, deviceAddress, message);
}


/**
 * Answer a challenge of a device with the message signed with the key on the
 * device. Result can be found via {@link iota.getLastMessage} and searching for
 * the {@link CLAIM_RESULT_TYPE}.
 *
 * @function answerChallenge
 * @param {string} seed IOTA seed of the sender
 * @param {string} sender IOTA address of the sender
 * @param {string} deviceAddress IOTA address of the receiving device
 * @param {string} signedChallenge Signed challenge of the device
 * @returns {Promise}
 */
function answerChallenge(seed, sender, deviceAddress, signedChallenge) {
  logger.info(`Answering challenge of ${deviceAddress}`);

  const message = {
    type: ANSWER_CHALLENGE_TYPE,
    sender,
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


module.exports = {
  claimDevice,
  answerChallenge,
  isSuccessfulClaim,
  CLAIM_DEVICE_TYPE,
  ANSWER_CHALLENGE_TYPE,
};
