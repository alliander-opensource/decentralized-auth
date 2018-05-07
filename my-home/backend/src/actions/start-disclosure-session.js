const diva = require('diva-irma-js');

/**
 * Request handler for starting a new disclosure session via POST request
 * @function requestHandler
 * @param {object} req Express request object, containing an IRMA content object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const { content } = req.body;
  if (content) {
    diva
      .startDisclosureSession(req.sessionId, content)
      .then((irmaSessionData) => {
        res.setHeader('Content-type', 'application/json; charset=utf-8');
        res.json(irmaSessionData);
      })
      .catch((error) => {
        res.end(error.toString());
      });
  } else {
    res.end('content not set.');
  }
};
