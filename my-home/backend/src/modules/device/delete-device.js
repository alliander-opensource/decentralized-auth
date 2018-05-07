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
  // Code runs in home so no need for extra checks.
  if (!req.params.id) {
    throw new Error('No deviceId specified.');
  }

  diva
    .getAttributes(req.sessionId)
    .then(attributes => ({
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    }))
    .then(owner =>
      Device
        .query()
        .delete()
        .where('owner', '=', owner)
        .andWhere('id', '=', req.params.id))
    .then(numDeleted =>
      res
        .status(200)
        .send({
          success: true,
          message: 'Deleted',
          numDeleted,
          id: req.params.id,
        }))
    .catch((err) => {
      logger.error(`delete-device: ${err}`);
      return res
        .status(400)
        .send({
          success: false,
          message: 'Something went wrong',
        });
    });
};
