/**
 * Gets all devices from the MAM event store.
 *
 * @module get-all-devices
 */


const logger = require('../../logger')(module);
const sessionState = require('../../session-state');

const { toDevices } = require('./devices');


/**
 * Request handler to get all devices.
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const { sessionId } = req;
  const { mamRoot, mamClient } = sessionState[sessionId];
  mamClient.fetch(mamRoot, 'private')
    .then(({ messages }) => messages)
    .then(toDevices)
    .then(devices => res.json(devices))
    .catch((err) => {
      logger.error(`error in get-all-devices: ${err}`);
      return res.end('Something went wrong.');
    });
};
