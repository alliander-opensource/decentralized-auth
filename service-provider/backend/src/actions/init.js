const ntru = require('./../modules/ntru');
const config = require('./../config');
const generateSeed = require('./../modules/gen-seed');
const logger = require('./../logger')(module);


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {

  const { sessionId } = req.params;

  logger.info(`Init for session id ${sessionId}`);

  if (typeof config.iotaSeeds[sessionId] === 'undefined') {
    config.iotaSeeds[sessionId] = await generateSeed();
  }

  if (typeof config.ntruKeyPairs[sessionId] === 'undefined') {
    config.ntruKeyPairs[sessionId] = ntru.createKeyPair(config.iotaSeeds[sessionId]);
  }

  return res
    .status(200)
    .send({
      success: true,
      message: `Seed and key pair available for sessionId ${sessionId}`,
    });
};
