const ntru = require('./../modules/ntru');
const config = require('./../config');
const logger = require('./../logger');


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  const { query: { trytes } } = req;
  const { sessionId } = req.params;
  logger.info(`Decrypting trytes ${trytes} for session id ${sessionId}`);
  return res
    .status(200)
    .send({
      success: true,
      message: ntru.decrypt(trytes, config.ntruKeyPairs[sessionId].private),
    });
};
