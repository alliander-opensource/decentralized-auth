const ntru = require('./../modules/ntru');
const config = require('./../config');


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
    const keyPairs = config.ntruKeyPairs;
    if (typeof keyPairs[sessionId] === 'undefined') {
      return res
        .status(500)
        .send({
          success: false,
          message: 'no key pair in session, call api/init first',
        });
    }
    const publicKey = ntru.toTrytes(keyPairs[sessionId]);
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
