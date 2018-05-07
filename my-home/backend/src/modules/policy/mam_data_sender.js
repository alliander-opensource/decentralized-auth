const logger = require('../../logger')(module);
const iota = require('../iota');
const config = require('./../../config');


const MAM_DATA_TYPE = 'MAM_DATA';
const INFORM_UPDATE_SIDE_KEY_TYPE = 'INFORM_UPDATE_SIDE_KEY';


/**
 * Send MAM data to a service provider.
 * TODO: encrypt with public key of service provider
 *
 * @function sendMamData
 * @param {string} serviceProviderAddress IOTA address of the service provider
 * @param {object} mamData MAM root and side key
 * @returns {Promise}
 */
function sendMamData(serviceProviderAddress, mamData) {
  logger.info(`Provide service provider ${serviceProviderAddress} with MAM data ${mamData}`);

  const message = { type: MAM_DATA_TYPE, mamData };
  return iota.send(config.iotaSeed, serviceProviderAddress, message);
}


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
  sendMamData,
  informUpdateSideKey,
};
