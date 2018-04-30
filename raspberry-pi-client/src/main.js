const util = require('util');
const config = require('./config');
const logger = require('./logger')(module);
const DeviceClient = require('./device-client');

const dc = new DeviceClient(
  config.seed,
  config.secret,
  config.initialSideKey,
);
logger.info(`Started a device client ${util.inspect(dc)} !`);

module.exports = { dc };
