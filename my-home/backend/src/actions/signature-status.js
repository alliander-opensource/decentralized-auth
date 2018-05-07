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
    return res.json({ serverSatus: 'INVALID' });
  }
  return diva
    .getIrmaSignatureStatus(irmaSessionId)
    .then(result => res.json(result));
};
