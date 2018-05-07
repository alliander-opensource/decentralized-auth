const diva = require('diva-irma-js');

/**
 * Request handler for starting a new disclosure session via GET request for a single attribute
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const attribute = req.query.attribute;
  const attributeLabel = req.query.attributeLabel;
  if (attribute && attributeLabel) {
    diva
      .startDisclosureSession(req.sessionId, attribute, attributeLabel)
      .then((irmaSessionData) => {
        res.setHeader('Content-type', 'application/json; charset=utf-8');
        res.json(irmaSessionData);
      })
      .catch((error) => {
        res.end(error.toString());
      });
  } else {
    res.end('attribute or attributeLabel not set.');
  }
};
