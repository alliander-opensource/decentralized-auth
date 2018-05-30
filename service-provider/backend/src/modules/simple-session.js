/**
 * Initialize or find a session based on a secure cookie.
 *
 * @module simple-session
 */


const uuidv4 = require('uuid/v4');
const ntru = require('@decentralized-auth/ntru');
const config = require('./../config');
const sessionState = require('./../session-state');
const logger = require('./../logger')(module);
const generateSeed = require('@decentralized-auth/gen-seed');

/**
 * (Re-)initializes the session. Creates a new session id and the instances used
 * in the session.
 *
 * @function deauthenticate
 * @param {object} req Express request object
 * @param {object} res Express response object
 */
async function deauthenticate(req, res) {
  const sessionId = uuidv4();

  req.sessionId = sessionId;
  res.cookie(config.cookieName, req.sessionId, config.cookieSettings);

  logger.info(`Init for session id ${sessionId}`);

  const seed = await generateSeed();
  sessionState[sessionId] = {};
  sessionState[sessionId].iotaSeed = seed;
  sessionState[sessionId].ntruKeyPair = ntru.createKeyPair(seed);
}

function simpleSessionCookieParser(req, res, next) {
  if (!req.signedCookies[config.cookieName]) {
    logger.info('Deauthenticating...');
    deauthenticate(req, res);
  } else {
    req.sessionId = req.signedCookies[config.cookieName];
  }
  next();
}

module.exports = simpleSessionCookieParser;
module.exports.deauthenticate = deauthenticate;
