const diva = require('diva-irma-js');
const logger = require('./../../logger')(module);
const Device = require('./../../database/models/Device');
const iota = require('./../iota');
const ntru = require('./../ntru');
const pairing = require('./pairing');
const signing = require('../../modules/signing');
const config = require('./../../config');
const PromiseRetryer = require('promise-retryer')(Promise);

const DELAY_MS = 10000;
const MAX_RETRIES = 25;

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
      transactionHash,
      device,
      secret,
    },
    sessionId,
  } = req;

  diva
    .getAttributes(sessionId)
    .then(attributes => ({
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    }))
    .then((owner) => {
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
          Device.query().insert({
            id: transactionHash,
            device,
            iotaAddress: device.iotaAddress,
            type: device.type,
            mamRoot: root,
            mamSideKey: sideKey,
            owner,
          }))
        .then(dbResult => (
          res
            .set({ Location: `${res.req.baseUrl}/${device.id}` })
            .status(201)
            .send({
              success: true,
              message: 'Created',
              id: dbResult.id,
            })))
        .catch((err) => {
          logger.error(`add-device: ${err}`);
          return res
            .status(500)
            .send({
              success: false,
              message: 'error_db_insert',
            });
        });
    })
    .catch((err) => {
      logger.error(`get IRMA attributes: ${err}`);
      return res
        .status(500)
        .send({
          success: false,
          message: 'error_get_irma_attributes',
        });
    });
};
