const util = require('util');
const MAM = require('./../../node_modules/mam.client.js/lib/mam.client.js');
const { iota, toTrytes, fromTrytes } = require('./iota');
const config = require('../config');
const logger = require('../logger')(module);


module.exports = class MamClient {
  constructor(seed) {
    this.mamState = null;
    this.mode = 'private';
    this.init(seed);
  }

  getMamState() { return this.mamState; }
  setMamState(state) { this.mamState = state; }


  /**
   * Initialize MAM (mode private or mode restricted if sideKey is provided).
   * @function init
   * @param {string} seed Seed to initialize MAM with
   * @returns {Object} MAM state
   */
  init(seed) {
    const state = MAM.init(iota, seed, config.iotaSecurityLevel);
    const mode = 'private';
    MAM.changeMode(state, mode);
    this.setMamState(state);

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
        logger.info(`Successfully attached to Tangle at address ${address} and root ${root}.`);
        return root;
      })
      .catch(logger.error);
  }


  /**
   * Fetch MAM messages.
   * NOTE: Expects JSON messages only.
   * @function fetch
   * @param {string} root Root from where to fetch
   * @returns {Promise} Contains the nextRoot and the messages
   */
  async fetch(root) {
    logger.info(`Fetching from root ${root}`);
    const { nextRoot, messages } = await MAM.fetch(root, this.mode);
    const jsonMessages = messages.map(m => JSON.parse(fromTrytes(m)));
    return { nextRoot, messages: jsonMessages };
  }
};
