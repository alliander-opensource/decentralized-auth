/**
 * Initialize or find a session based on a secure cookie.
 *
 * @module simple-session
 */


const uuidv4 = require('uuid/v4');
const MamClient = require('@decentralized-auth/iota-mam');
const iota = require('./../modules/iota');
const config = require('./../config');
const sessionState = require('./../session-state');
const logger = require('./../logger')(module);
const generateSeed = require('@decentralized-auth/gen-seed');


const addIotaAddress = async (seed, sessionId) => {
  const [address] = await iota.getAddress(seed, 1);
  logger.info(`Storing IOTA address ${address} for session ${sessionId}`);
  sessionState[sessionId].iotaAddress = address;
};


const addMamState = (seed, sessionId) => {
  // Our MAM channel for publishing information to for the device
  // We also use it as a database (to read the event stream and build the state
  // using `projections.js`)
  logger.info(`Creating MAM client for session ${sessionId}`);
  const mam = new MamClient(seed, iota, 'private');
  sessionState[sessionId].mamClient = mam;
  const mamRoot = mam.getMamState().channel.next_root;
  logger.info(`Set MAM root to ${mamRoot} for session ${sessionId}`);
  sessionState[sessionId].mamRoot = mamRoot;
};


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

  const seed = await generateSeed();

  sessionState[sessionId] = {};

  logger.info(`Storing new IOTA seed ${seed} for session ${sessionId}`);
  sessionState[sessionId].iotaSeed = seed;

  await addIotaAddress(seed, sessionId);
  addMamState(seed, sessionId);
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
