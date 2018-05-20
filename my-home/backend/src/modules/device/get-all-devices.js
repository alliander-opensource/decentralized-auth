const logger = require('../../logger')(module);
const config = require('../../config');
const mam = require('../iota-mam');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  mam.fetch(config.mamRoot)
    .then(({ messages }) => messages.filter(m => m.type === 'DEVICE_ADDED'))
    .then(deviceMessages => deviceMessages.map(m => m.device))
    .then(devices => res.json(devices))
    .catch((err) => {
      logger.error(`error in get-all-devices: ${err}`);
      return res.end('Something went wrong.');
    });
};
