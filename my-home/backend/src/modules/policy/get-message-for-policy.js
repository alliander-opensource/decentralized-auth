const logger = require('../../logger')(module);
const policy = require('./policy.js');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  Promise
    .resolve({
      actorId: req.body.actorId,
      action: req.body.action,
      actee: req.body.actee,
      conditions: req.body.conditions,
      goal: req.body.goal,
    })
    .then(policy.toMessage)
    .then((message) => {
      res
        .status(201)
        .send({
          success: true,
          message,
        });
    })
    .catch((err) => {
      logger.error(err);
      return res.end('Something went wrong.');
    });
};
