const util = require('util');
const MAM = require('./../../node_modules/mam.client.js/lib/mam.client.js');
const { iota, getAddress, toTrytes, fromTrytes } = require('./iota');
const config = require('../config');
const logger = require('../logger')(module);


const mode = 'public';


// Mutable field to share the mamState
let mamState;
function getMamState() { return mamState; }
function setMamState(state) { mamState = state; }


/**
 * Initialize MAM.
 * @function init
 * @param {string} seed Seed to initialize MAM with
 * @returns {Object} MAM state
 */
function init(seed) {
  const state = MAM.init(iota, seed, config.iotaSecurityLevel);
  setMamState(state);

  this.attach({ type: 'INITIALIZED' });

  return getMamState();
}


/**
 * Attach MAM messages.
 * @function attach
 * @param {JSON} packet JSON packet to attach.
 * @returns {Promise} Containing the root
 */
function attach(packet) {
  logger.info(`Attaching packet ${util.inspect(packet)} to the Tangle`);

  const trytes = toTrytes(JSON.stringify(packet));
  const { state, payload, root, address } = MAM.create(
    getMamState(),
    trytes,
  );

  setMamState(state);
  return MAM.attach(payload, address, config.iotaDepth, config.iotaMinWeightMagnitude)
    .then(() => {
      logger.info(`Successfully attached to tangle at address ${address} and root ${root}.`);
      return root;
    })
    .catch(logger.error);
}


/**
 * Fetch MAM messages.
 * NOTE: Expects JSON messages only.
 * @function fetch
 * @param {string} root Root from where to fetch
 * @returns {Promise} Contains the root and the messages
 */
async function fetch(root) {
  logger.info(`Fetching from root ${root}`);
  const { nextRoot, messages } = await MAM.fetch(root, mode);
  const jsonMessages = messages.map(m => JSON.parse(fromTrytes(m)));
  return { nextRoot, messages: jsonMessages };
}

module.exports = {
  init,
  getMamState,
  attach,
  fetch,
};
