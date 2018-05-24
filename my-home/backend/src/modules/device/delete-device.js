const logger = require('../../logger')(module);
const sessionState = require('../../session-state');

const DEVICE_DELETED_TYPE = 'DEVICE_DELETED';

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  // TODO: Code runs in home (?) so no need for extra checks.....
  if (!req.body.device) {
    throw new Error('No device specified.');
  }

  const { device } = req.body;
  const { mamClient } = sessionState[req.sessionId];

  mamClient.attach({ type: DEVICE_DELETED_TYPE, timestamp: Date.now(), device })
    .then(() => res
      .status(200)
      .send({
        success: true,
      }))
    .catch((err) => {
      logger.error(`delete-device: ${err}`);
      return res
        .status(400)
        .send({
          success: false,
          message: 'Something went wrong',
        });
    });
};
