/**
 * Class to keep the state of the authorized service providers on this device.
 * @module service-providers
 */


const logger = require('../logger')(module);


/*
 * Holds the authorized service providers
 * Service provider should be of format:
 * ```
 * {
 *   iotaAddress: <string of 81 trytes>,
 *   publicKeyTrytes: <string trytes>,
 *   url: <string>
 * }
 * ```
 */
module.exports = class ServiceProviders {
  constructor() {
    this.db = new Set(); // mutable set
  }

  add(serviceProvider) {
    logger.info(`Adding authorized service provider ${serviceProvider.url}`);
    this.db.add(JSON.stringify(serviceProvider));
  }


  remove(serviceProvider) {
    logger.info(`Removing authorized service ${serviceProvider.url}}`);
    this.db.delete(JSON.stringify(serviceProvider));
  }

  clear() {
    logger.info('Removing all authorized services providers');
    this.db.clear();
  }


  /*
   * Get all authorized service providers
   * @function getAll
   *
   * @returns {array} Authorized service providers
   */
  getAll() {
    return Array.from(this.db).map(JSON.parse);
  }
};
