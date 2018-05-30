const util = require('util');
const config = require('./config');
const logger = require('./logger')(module);
const DeviceClient = require('./device-client');

const deviceClient = new DeviceClient(
  config.seed,
  config.secret,
  config.initialSideKey,
  config.checkMessageIntervalMs,
);

logger.info(`Started a device client ${util.inspect(deviceClient)} !`);
