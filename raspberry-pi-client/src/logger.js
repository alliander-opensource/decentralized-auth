/**
 * Creates the logger.
 * Winston logger provides information from which module it is logging.
 *
 * Require as:
 * ```
 * require('../../logger')(module);
 * ```
 * so that logger can determine from which module it is logging.
 *
 * @module logger
 */


const winston = require('winston');

const getLabel = (callingModule) => {
  const parts = callingModule.filename.split('/');
  const folderName = parts[parts.length - 2];
  const fileName = parts.pop();
  return `${folderName}/${fileName}`;
};

const consoleFormat = winston.format.printf(info =>
  `[${info.label}] ${info.level}: ${info.message}`);

const logger = callingModule => winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: getLabel(callingModule) }),
        consoleFormat,
      ),
    }),
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use: require('../../logger')(module);
// So that logger can determine from which module it is logging
module.exports = logger;
