const diva = require('diva-irma-js');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const irmaSessionId = req.query.irmaSessionId;
  if (!irmaSessionId) {
    return res.json({ serverStatus: 'INVALID' });
  }
  return diva
    .getIrmaAPISessionStatus(req.sessionId, irmaSessionId)
    .then(status => res.json(status));
};
