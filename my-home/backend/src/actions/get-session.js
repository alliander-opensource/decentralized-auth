const diva = require('diva-irma-js');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const sessionId = req.sessionId;
  diva
    .getAttributes(sessionId)
    .then(attributes => res.json({
      sessionId,
      attributes,
    }));
};
