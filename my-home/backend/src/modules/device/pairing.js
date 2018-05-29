/**
 * Module for the pairing process of a device and My IOTA Home UI.
 *
 * For pairing with the raspberry-pi-client on a device the following steps are
 * taken:
 * 1. a message of type ${@link CLAIM_DEVICE_TYPE} is send to the device's
 *    address that includes our address.
 * 2. Then when a response of type "CHALLENGE" is received the challenge needs
 *    to be signed with the secret on the device.
 * 3. This signed challenge is created by signing the challenge with the secret.
 * 4. The signed challenge is send in the {@link answerChallenge} alongside the
 *    My IOTA Home's MAM root in the call with type
 *    {@link ANSWER_CHALLENGE_TYPE}.
 * 5. The device checks if this signed challenge is correct. If so, a message of
 *    type "CLAIM_RESULT" with status "OK" will be returned, and the device will
 *    starts listening to the events published on the MAM root in the answer
 *    challenge message.
 * 6. My IOTA Home will publish an event of type "DEVICE_ADDED" to the event
 *    store (MAM channel).
 *
 * @module pairing
 */


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
 * the {@link CLAIM_RESULT_TYPE}.
 *
 * @function answerChallenge
 * @param {string} seed IOTA seed of the sender
 * @param {string} sender IOTA address of the sender
 * @param {string} root IOTA MAM root of the sender (device will listen to it)
 * @param {string} deviceAddress IOTA address of the receiving device
 * @param {string} signedChallenge Signed challenge of the device
 * @returns {Promise}
 */
function answerChallenge(seed, sender, root, deviceAddress, signedChallenge) {
  logger.info(`Answering challenge of ${deviceAddress}`);

  const message = {
    type: ANSWER_CHALLENGE_TYPE,
    sender,
    root,
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
