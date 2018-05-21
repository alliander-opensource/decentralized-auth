const ntru = require('../ntru');
const mam = require('./../iota-mam');
const logger = require('../../logger')(module);

const AUTHORIZE_TYPE = 'AUTHORIZE';

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  try {
    const { device, serviceProvider, goal } = req.body;
    const policy = {
      actorName: serviceProvider.iotaAddress,
      action: 'read',
      actee: `${device.type} P1 energy data`,
      goal,
      conditions: [],
      device,
      serviceProvider,
    };
    const event = { type: AUTHORIZE_TYPE, policy };
    mam.attach(event);
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
