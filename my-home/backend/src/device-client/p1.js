const SerialPort = require('serialport');
const logger = require('../logger')(module);
const config = require('../config');

const TRY_INIT_INTERVAL_MS = 5000;
const RASPBERRY_PI_USB_PORT = config.p1SerialPort;

/**
 * Serial port settings for various smart reader versions
 * See http://domoticx.com/p1-poort-slimme-meter-hardware/
 */
const p1Configs = {
  2.2: {
    baudrate: 9600,
    databits: 7,
    parity: 'even',
  },
  4.0: {
    baudrate: 15200,
    databits: 8,
    parity: 'none',
  },
  4.2: {
    baudrate: 15200,
    databits: 7,
    parity: 'none',
  },
  5.0: {
    baudrate: 15200,
    databits: 8,
    parity: 'none',
  },
};

const p1Config = p1Configs[config.smartMeterVersion];


/**
 * Tries to starts the P1 port reader and then sleeps.
 *
 * @function tryInitP1
 * @param {function} messageHandler What to do with the message
 * @returns {undefined}
 */
function tryInitP1(messageHandler) {
  logger.info('Try initialize P1 reader');
  try {
    logger.info(`Sleeping for ${TRY_INIT_INTERVAL_MS} milliseconds`);
    // eslint-disable-next-line no-use-before-define
    setTimeout(() => initP1(messageHandler), TRY_INIT_INTERVAL_MS);
  } catch (err) {
    logger.error(`tryInitP1 ERROR... ${err}`);
  }
}


/**
 * Starts serial port reader. Retries via {@link tryInitP1} when port is
 * disconnected or on error.
 *
 * @function tryInitP1
 * @param {function} messageHandler What to do with the message
 * @returns {undefined}
 */
function initP1(messageHandler) {
  logger.info(`Initializing P1 reader on serial port ${RASPBERRY_PI_USB_PORT}`);

  const TELEGRAM_SEPARATOR = '!';
  const serialPort = new SerialPort(RASPBERRY_PI_USB_PORT, {
    ...p1Config,
    parser: SerialPort.parsers.readline(TELEGRAM_SEPARATOR),
  });

  serialPort.on('data', telegram => messageHandler(telegram));

  serialPort.on('error', (err) => {
    logger.error(`Error when reading port ${err}`);
    tryInitP1(messageHandler);
  });

  serialPort.on('close', () => {
    logger.info('Port closed');
    tryInitP1(messageHandler);
  });
}

module.exports = { tryInitP1 };
