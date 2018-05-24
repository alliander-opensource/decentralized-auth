const uuidv4 = require('uuid/v4');
const ntru = require('./../modules/ntru');
const config = require('./../config');
const sessionState = require('./../session-state');
const logger = require('./../logger')(module);
const generateSeed = require('./../modules/gen-seed');

// Initializes loads of stuff. TODO: refactor (extract methods); add docstring
async function deauthenticate(req, res) {
  const sessionId = uuidv4();

  req.sessionId = sessionId;
  res.cookie(config.cookieName, req.sessionId, config.cookieSettings);

  logger.info(`Init for session id ${sessionId}`);

  const seed = await generateSeed();
  sessionState[sessionId] = {};
  sessionState[sessionId].iotaSeed = seed;
  sessionState[sessionId].ntruKeyPair = ntru.createKeyPair(seed);
  logger.info('Deauthenticating finished');
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
