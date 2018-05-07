/*
 * Copy of my-house/backend/src/modules/device/pairing so that we can call it
 * from the unit test
 */
const logger = require('../src/logger')(module);
const iota = require('../src/modules/iota');


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
 * device. Result can be read via {@link retrieveClaim}.
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

  const message = { type: ANSWER_CHALLENGE_TYPE, sender, signedChallenge };
  return iota.send(seed, deviceAddress, message);
}


/**
 * Creates a predicate function that returns all successful claims. A claim is
 * successful if we have received a claim result of the device and the returned
 * status is "OK"
 *
 * @function successfulClaimsFilter
 * @param {string} deviceAddress Address of the device to check claims from.
 * @returns {function} that takes an {object} Transfer.
 */
function successfulClaimsFilter(deviceAddress) {
  return function isSuccessfulClaim(transfer) {
    const transferData = JSON.parse(iota.extractJson([transfer]));
    if (!transferData) return false;
    return transferData.sender === deviceAddress && transferData.status === 'OK';
  };
}


/**
 * Retrieves the result of a previous claim of a device. Claim result messages
 * contain sender (the address of the device), the status ('OK' or 'NOK') and
 * the mamInfo (sideKey and root) for setting up a data stream.
 *
 * @function retrieveClaim
 * @param {string} address IOTA address of the sender
 * @param {string} deviceAddress IOTA address of the receiving device
 * @returns {Promise} With last successful claim, "NOK" or reject "NO RESULT"
 */
function retrieveClaim(address, deviceAddress) {
  logger.info(`Retrieving claim result for ${deviceAddress}`);
  return new Promise((resolve, reject) => {
    iota.iota.api.findTransactionObjects({ addresses: [address] }, (err, transactions) => {
      if (err) return reject(err);
      if (!transactions || transactions.length === 0) return reject(new Error('No transactions'));

      const successfulClaims = transactions.filter(successfulClaimsFilter(deviceAddress));

      if (successfulClaims.length === 0) return reject(new Error('No successful claims'));

      const parsedClaim = JSON.parse(iota.extractJson([successfulClaims[0]]));

      return resolve(parsedClaim);
    });
  });
}


module.exports = {
  claimDevice,
  answerChallenge,
  retrieveClaim,
  CLAIM_DEVICE_TYPE,
  ANSWER_CHALLENGE_TYPE,
};
