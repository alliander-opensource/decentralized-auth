const logger = require('../../logger')(module);
const sessionState = require('../../session-state');

const AUTHORIZATION_REVOKED_TYPE = 'AUTHORIZATION_REVOKED';

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  // TODO: Code runs in home (?) so no need for extra checks.....
  if (!req.body.policy) {
    throw new Error('No policy specified.');
  }

  const { policy } = req.body;
  const { mamClient } = sessionState[req.sessionId];

  mamClient.attach({ type: AUTHORIZATION_REVOKED_TYPE, timestamp: Date.now(), policy })
    .then(() => res
      .status(200)
      .send({
        success: true,
      }))
    .catch((err) => {
      logger.error(`revoke-policy: ${err}`);
      return res
        .status(400)
        .send({
          success: false,
          message: 'Something went wrong',
        });
    });
};