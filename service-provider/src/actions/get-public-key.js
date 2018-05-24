const ntru = require('./../modules/ntru');
const config = require('./../config');
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
    const { sessionId } = req.params;
    logger.info(`Getting public key for session id ${sessionId}`);

    const keyPairs = config.ntruKeyPairs;
    if (typeof keyPairs[sessionId] === 'undefined') {
      return res
        .status(500)
        .send({
          success: false,
          message: 'no key pair in session, call api/init first',
        });
    }
    const publicKey = ntru.toTrytes(keyPairs[sessionId].public);
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
