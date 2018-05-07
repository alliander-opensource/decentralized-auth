const diva = require('diva-irma-js');
const config = require('./../config');
const request = require('superagent');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const sessionId = req.sessionId;
  diva.getAttributes(sessionId)
    .then((attributes) => {
      const street = attributes['pbdf.pbdf.idin.address'][0].replace(' ', '%20');
      const city = attributes['pbdf.pbdf.idin.city'][0];
      const url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/CanvasLight/Netherlands%20${city}%20${street}/1`;
      request
        .get(url)
        .query({
          format: 'jpeg',
          key: config.bingMapsApiKey,
        })
        .end((err, imageResponse) => {
          if (err) {
            return res.sendStatus(500);
          }

          res.setHeader('Content-type', 'image/jpeg');
          res.setHeader('Content-Disposition', 'inline; filename="address.jpg"'); // Note: to force display in browser
          return res.end(imageResponse.body);
        });
    });
};
