/**
 * NTRU decrypt.
 *
 * @module decrypt
 */


const ntru = require('@decentralized-auth/ntru');
const sessionState = require('./../session-state');
const logger = require('./../logger')(module);


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  const { query: { trytes }, sessionId } = req;
  logger.info(`Decrypting trytes ${trytes} for session id ${sessionId}`);
  const privateKey = sessionState[sessionId].ntruKeyPairs.private;
  return res
    .status(200)
    .send({
      success: true,
      message: ntru.decrypt(trytes, privateKey),
    });
};
