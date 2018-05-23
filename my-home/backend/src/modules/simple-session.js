const uuidv4 = require('uuid/v4');
const MamClient = require('./../modules/iota-mam');
const iota = require('./../modules/iota');
const config = require('./../config');
const logger = require('./../logger')(module);
const generateSeed = require('./../modules/gen-seed');

// Initializes loads of stuff. TODO: refactor (extract methods); add docstring
async function deauthenticate(req, res) {
  const sessionId = uuidv4();

  req.sessionId = sessionId;
  res.cookie(config.cookieName, req.sessionId, config.cookieSettings);

  const seed = await generateSeed();
  logger.info(`Storing new IOTA seed ${seed} for session ${sessionId}`);
  config.iotaSeeds[sessionId] = seed;

  const setIotaAddress = async () => {
    const [address] = await iota.getAddress(seed, 1);
    logger.info(`Storing IOTA address ${address} for session ${sessionId}`);
    config.iotaAddresses[sessionId] = address;
  };

  await setIotaAddress();

  // Our MAM channel for publishing information to for the device
  // We also use it as a database (to read the event stream and build the state
  // using `projections.js`)
  logger.info(`Creating MAM client for session ${sessionId}`);
  const mam = new MamClient(seed);
  config.mamClients[sessionId] = mam;
  const mamRoot = mam.getMamState().channel.next_root;
  logger.info(`Set MAM root to ${mamRoot} for session ${sessionId}`);
  config.mamRoots[sessionId] = mamRoot;

  logger.info(`IOTA seeds is: ${JSON.stringify(config.iotaSeeds)}`);
}

function simpleSessionCookieParser(req, res, next) {
  if (!req.signedCookies[config.cookieName]) {
    deauthenticate(req, res);
  } else {
    req.sessionId = req.signedCookies[config.cookieName];
  }
  next();
}

module.exports = simpleSessionCookieParser;
module.exports.deauthenticate = deauthenticate;
