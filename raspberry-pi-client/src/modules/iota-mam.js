const util = require('util');
const MAM = require('./../../node_modules/mam.client.js/lib/mam.node.js');
const { iota, toTrytes, fromTrytes } = require('./iota');
const config = require('../config');
const logger = require('../logger')(module);


const mode = 'restricted';


// Mutable field to share the mamState
let mamState;
function getMamState() { return mamState; }
function setMamState(state) { mamState = state; }


/**
 * Sets or changes the MAM side key.
 * @function changeSideKey
 * @param {string} sideKey Side key
 * @returns {undefined}
 */
function changeSideKey(sideKey) {
  MAM.changeMode(getMamState(), mode, sideKey);
}


/**
 * Initialize MAM.
 * @function init
 * @param {string} seed Seed and side key to initialize MAM with
 * @returns {Object} MAM state
 */
function init(seed, sideKey) {
  const state = MAM.init(iota, seed, config.iotaSecurityLevel);
  setMamState(state);
  changeSideKey(sideKey);

  // Initial create to have a next_root on the MAM state...
  MAM.create(getMamState(), { type: 'INITIALIZE' });

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
 * @param {string} sideKey Side key
 * @returns {Promise} Contains the root and the messages
 */
function fetch(root, sideKey) {
  return MAM.fetch(root, mode, sideKey)
    .then(({ nextRoot, messages }) => {
      const jsonMessages = messages.map(m => JSON.parse(fromTrytes(m)));
      return {
        nextRoot,
        messages: jsonMessages,
      };
    });
}


module.exports = {
  init,
  getMamState,
  attach,
  fetch,
};
