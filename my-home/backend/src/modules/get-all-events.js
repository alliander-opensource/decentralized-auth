/**
 * Gets all events from the MAM event store.
 *
 * @module get-all-policies
 */


const logger = require('../logger')(module);
const sessionState = require('../session-state');

/**
 * Request handler to get all MAM events
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  const { sessionId } = req;
  const { mamRoot, mamClient } = sessionState[sessionId];
  try {
    const messages = await mamClient.fetch(mamRoot, 'private');
    logger.info(`Received MAM messages: ${JSON.stringify(messages)}`);
    return res.json({ events: messages.messages });
  } catch (err) {
    logger.error(`error in get-all-messages: ${err}`);
    return res.end('Something went wrong.');
  }
};
