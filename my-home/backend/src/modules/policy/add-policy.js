const mam = require('./../iota-mam');
const logger = require('../../logger')(module);

const AUTHORIZED_TYPE = 'AUTHORIZED';

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  try {
    const { device, serviceProvider, goal } = req.body;
    const policy = {
      serviceProvider, // actor
      action: 'read P1 energy data',
      device, // actee
      goal,
      conditions: [],
    };
    const event = { type: AUTHORIZED_TYPE, policy };
    await mam.attach(event);
    return res
      .status(200)
      .send({
        success: true,
        message: 'Created',
        policy,
      });
  } catch (err) {
    logger.error(err);
    return res
      .status(500)
      .send({
        success: false,
        message: err,
      });
  }
};
