const logger = require('../../logger')(module);

const Policy = require('../../database/models/Policy');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const { sessionId } = req;
  Promise.resolve() // TODO: get stuff from MAM
    .then(policies => res.json(policies))
    .catch((err) => {
      logger.error(err);
      return res.end('Something went wrong.');
    });
};
