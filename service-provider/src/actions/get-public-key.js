const ntru = require('./../modules/ntru');
const sessionState = require('./../session-state');
const logger = require('./../logger')(module);


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  try {
    const { sessionId } = req;
    logger.info(`Getting public key for session id ${sessionId}`);

    const keyPair = sessionState[sessionId].ntruKeyPair;
    const publicKey = ntru.toTrytes(keyPair.public);
    logger.info(`Sending public key ${publicKey}`);
    return res
      .status(200)
      .send({
        success: true,
        message: publicKey,
      });
  } catch (err) {
    return res
      .status(500)
      .send({
        success: false,
        message: `Failed in get-public-key: ${err}`,
      });
  }
};
