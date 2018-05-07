const diva = require('diva-irma-js');
const logger = require('../../logger')(module);
const Device = require('../../database/models/Device');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const { sessionId } = req;
  diva
    .getAttributes(sessionId)
    .then(attributes => ({
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    }))
    .then(owner => Device.query().where('owner', '=', owner))
    .then(devices => res.json(devices))
    .catch((err) => {
      logger.error(`error in get-all-devices: ${err}`);
      return res.end('Something went wrong.');
    });
};
