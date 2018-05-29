const simpleSession = require('./../modules/simple-session');


/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  // Create a new sessionId, IOTA seed/address and MAM instance
  simpleSession.deauthenticate(req, res);

  return res.json({
    sessionId: req.sessionId,
  });
};
