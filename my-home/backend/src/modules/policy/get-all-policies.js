const diva = require('diva-irma-js');
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
  diva
    .getAttributes(sessionId)
    .then(attributes => ({
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    }))
    .then(owner => Policy.query().where('owner', '=', owner))
    .then(policies => res.json(policies))
    .catch((err) => {
      logger.error(err);
      return res.end('Something went wrong.');
    });
};
