const logger = require('./../../logger')(module);
const Device = require('./../../database/models/Device');
const iota = require('./../iota');
const mam = require('./../iota-mam');
const ntru = require('./../ntru');
const pairing = require('./pairing');
const signing = require('../../modules/signing');
const config = require('./../../config');
const PromiseRetryer = require('promise-retryer')(Promise);

const DELAY_MS = 10000;
const MAX_RETRIES = 25;

mam.init(config.iotaSeed, )

/**
 * Retries promise till message of {@link msgType} is received.
 * @function waitForMessage
 * @param {function} promise Function that returns a promise
 * @param {string} msgType Type of message to wait for
 * @returns {Promise} resolved with message or with error
 */
function waitForMessage(promise, msgType) {
  return PromiseRetryer.run({
    delay: DELAY_MS,
    maxRetries: MAX_RETRIES,
    promise,
    validate: msg =>
      new Promise((resolve, reject) => {
        if (!!msg && msg.type === msgType) {
          resolve(msg);
        } else {
          reject(new Error(`Response was not a ${msgType}`));
        }
      }),
  });
}


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const {
    body: {
      device,
      secret,
    },
  } = req;

  pairing.claimDevice(
    config.iotaSeed,
    config.iotaAddress,
    device.iotaAddress,
  )
    .then(() =>
      waitForMessage(
        () => iota.getLastMessage({ addresses: [config.iotaAddress] }),
        'CHALLENGE',
      ))
    .then(({ challenge }) => {
      const signedChallenge = signing.sign(challenge, secret);
      pairing.answerChallenge(
        config.iotaSeed,
        config.iotaAddress,
        ntru.toTrytes(config.ntruKeyPair.public),
        device.iotaAddress,
        signedChallenge,
      );
    })
    .then(() =>
      waitForMessage(
        () => iota.getLastMessage({ addresses: [config.iotaAddress] }),
        'CLAIM_RESULT',
      ))
    .then((claim) => {
      logger.info(`Received claim ${JSON.stringify(claim)}`);
      if (!pairing.isSuccessfulClaim(claim, device.iotaAddress)) {
        throw new Error(`Claim failed with reason ${claim.reason}`);
      }
      const decryptedClaim = pairing.decryptMamData(claim, config.ntruKeyPair.private);
      return decryptedClaim;
    })
    .then(({ mamData: { root, sideKey } }) =>
      mam.) // TODO: store somewhere
    .catch((err) => {
      logger.error(`add-device: ${err}`);
      return res
        .status(500)
        .send({
          success: false,
          message: err.toString(),
        });
    });
};
