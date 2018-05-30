/**
 * Wrapper for the IOTA client that provides some convenience methods.
 *
 * @module iota
 */


const IotaClient = require('@decentralized-auth/iota');
const config = require('../config');
const logger = require('../logger')(module);

module.exports = new IotaClient({
  provider: config.iotaProvider,
  securityLevel: config.iotaSecurityLevel,
  depth: config.iotaDepth,
  minWeightMagnitude: config.iotaMinWeightMagnitude,
}, logger);
