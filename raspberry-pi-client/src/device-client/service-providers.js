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
    logger.info(`Adding authorized service provider ${serviceProvider}`);
    this.db.add(JSON.stringify(serviceProvider));
  }


  remove(serviceProvider) {
    logger.info(`Removing authorized service ${serviceProvider}}`);
    this.db.delete(JSON.stringify(serviceProvider));
  }


  /*
   * Get all authorized service providers
   * @function all
   *
   * @returns {array} Authorized service providers
   */
  all() {
    return Array.from(this.db).map(JSON.parse);
  }
};
