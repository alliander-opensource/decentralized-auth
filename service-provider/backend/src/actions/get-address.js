const iota = require('./../modules/iota');
const ntru = require('./../modules/ntru');
const config = require('./../config');
const generateSeed = require('./../modules/gen-seed');


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  const { sessionId } = req;

  if (typeof config.iotaSeeds[sessionId] === 'undefined') {
    return res
      .status(500)
      .send({
        success: false,
        message: 'No seed generated. Call api/init first.',
      });
  }

  const [address] = await iota.getAddress(seed, 1);
  return res
    .status(200)
    .send({
      success: true,
      message: address,
    });
};
