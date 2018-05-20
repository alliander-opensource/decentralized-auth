const util = require('util');
const MAM = require('./../../node_modules/mam.client.js/lib/mam.client.js');
const { iota, toTrytes, fromTrytes } = require('./iota');
const config = require('../config');
const logger = require('../logger')(module);


// Mutable field to share the mamState

module.exports = class MamClient {

  constructor(seed, sideKey) {
    this.mamState = null;
    this.init(seed, sideKey);
  }

  getMamState() { return this.mamState; }
  setMamState(state) { this.mamState = state; }


  /**
   * Sets or changes the MAM side key.
   * @function changeSideKey
   * @param {string} sideKey Side key
   * @returns {undefined}
   */
  changeSideKey(sideKey) {
    const mode = 'restricted';
    MAM.changeMode(this.getMamState(), mode, sideKey);
  }


  /**
   * Initialize MAM.
   * @function init
   * @param {string} seed Seed to initialize MAM with
   * @param {string} sideKey Optional side key to initialize MAM with (restricted)
   * @returns {Object} MAM state
   */
  init(seed, sideKey) {
    const state = MAM.init(iota, seed, config.iotaSecurityLevel);
    this.setMamState(state);
    if (sideKey) this.changeSideKey(sideKey);

    // Initial create to have a next_root on the MAM state...
    MAM.create(this.getMamState(), { type: 'INITIALIZE' });

    return this.getMamState();
  }


  /**
   * Attach MAM messages.
   * @function attach
   * @param {JSON} packet JSON packet to attach.
   * @returns {Promise} Containing the root
   */
  attach(packet) {
    logger.info(`Attaching packet ${util.inspect(packet)} to the Tangle`);

    const trytes = toTrytes(JSON.stringify(packet));
    const { state, payload, root, address } = MAM.create(
      this.getMamState(),
      trytes,
    );

    this.setMamState(state);
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
   * @param {string} mode Either 'public', 'private' or 'restricted'
   * @param {string} sideKey Optional side key
   * @returns {Promise} Contains the root and the messages
   */
  static fetch(root, mode, sideKey) {
    return MAM.fetch(root, mode, sideKey)
      .then(({ nextRoot, messages }) => {
        const jsonMessages = messages.map(m => JSON.parse(fromTrytes(m)));
        return {
          nextRoot,
          messages: jsonMessages,
        };
      });
  }
};
