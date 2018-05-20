const logger = require('../../logger')(module);

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  // Code runs in home so no need for extra checks.
  if (!req.params.id) {
    throw new Error('No deviceId specified.');
  }

  Promise.resolve() // TODO: delete device somehow
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
