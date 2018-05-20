const logger = require('../../logger')(module);
const iota = require('../iota');
const config = require('./../../config');

const INFORM_UPDATE_SIDE_KEY_TYPE = 'INFORM_UPDATE_SIDE_KEY';

/**
 * Informs the device to update the side key and gives the currently authorized
 * service providers
 *
 * TODO: device should know it is allowed to read the data
 *
 * @function informUpdateSideKey
 * @param {string} deviceAddress IOTA address of the device
 * @param {array} authorizedServiceProviders List of authorized service providers
 * @returns {Promise}
 */
function informUpdateSideKey(deviceAddress, authorizedServiceProviders) {
  logger.info(`Inform device ${deviceAddress} of service providers ${authorizedServiceProviders}`);

  const message = { type: INFORM_UPDATE_SIDE_KEY_TYPE, authorizedServiceProviders };
  return iota.send(config.iotaSeed, deviceAddress, message);
}


module.exports = {
  informUpdateSideKey,
};
