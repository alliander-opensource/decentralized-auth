const util = require('util');
const MAM = require('./../../node_modules/mam.client.js/lib/mam.client.js');
const { iota, toTrytes, fromTrytes } = require('./iota');


module.exports = class MamClient {
  /**
   * Constructor for a MamClient.
   * @constructor MamClient
   * @param {string} seed IOTA seed of the device client
   * @param {number} iotaSecurityLevel Security level (0, 1 or 2)
   * @param {number} iotaDepth IOTA depth
   * @param {object} logger Should be able to be initialized by passing the
   *                        module (so it knows where it's logging from) and
   *                        support the methods info and error
   * @param {string} mamMode MAM mode, either 'public' or 'private' or 'restricted'
   * @param {string} sideKey Optional side key (when mode is 'restricted')
   */
  constructor(seed, iotaSecurityLevel, iotaDepth, logger, mamMode, sideKey) {
    this.mamState = null;
    this.iotaSecurityLevel = iotaSecurityLevel;
    this.iotaDepth = iotaDepth;
    this.logger = logger(module);
    this.init(seed, mamMode, sideKey);
  }

  getMamState() { return this.mamState; }
  setMamState(state) { this.mamState = state; }


  /**
   * Initialize MAM (mode private or mode restricted if sideKey is provided).
   * @function init
   * @param {string} seed Seed to initialize MAM with
   * @param {string} mode Mode to initialize MAM with ('public', 'private' or restricted')
   * @param {string} sideKey Optional side key to initialize MAM with (restricted)
   * @returns {Object} MAM state
   */
  init(seed, mode, sideKey) {
    const state = MAM.init(iota, seed, this.iotaSecurityLevel);
    if (mode === 'private') MAM.changeMode(state, mode);
    this.setMamState(state);
    if (mode === 'restricted') {
      if (typeof sideKey === 'undefined') throw new Error('Side key needed in restricted');
      MAM.changeMode(state, mode, sideKey);
    }

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
    this.logger.info(`Attaching packet ${util.inspect(packet)} to the Tangle`);

    const trytes = toTrytes(JSON.stringify(packet));
    const { state, payload, root, address } = MAM.create(
      this.getMamState(),
      trytes,
    );

    this.setMamState(state);
    return MAM.attach(payload, address, this.iotaDepth, this.iotaMinWeightMagnitude)
      .then(() => {
        this.logger.info(`Successfully attached to Tangle at address ${address} and root ${root}.`);
        return root;
      })
      .catch(this.logger.error);
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
  async fetch(root, mode, sideKey) { // eslint-disable-line class-methods-use-this
    this.logger.info(`Fetching from root ${root}`);
    const { nextRoot, messages } = await MAM.fetch(root, mode, sideKey);
    const jsonMessages = messages.map(m => JSON.parse(fromTrytes(m)));
    return { nextRoot, messages: jsonMessages };
  }


  /**
   * Fetch a single MAM message.
   * NOTE: Expects JSON MAM message only.
   * @function fetch
   * @param {string} root Root from where to fetch
   * @param {string} mode Either 'public' or 'private' or 'restricted'
   * @param {string} sideKey Optional side key (when mode is 'restricted')
   * @returns {Promise} Contains the root and the parsed message or null
   */
  async fetchSingle(root, mode, sideKey) { // eslint-disable-line class-methods-use-this
    const res = await MAM.fetchSingle(root, mode, sideKey);
    if (typeof res === 'undefined') return res; // No message
    const { nextRoot, payload } = res;
    this.logger.info(`Received nextRoot ${nextRoot} and payload ${payload}`);
    const message = JSON.parse(fromTrytes(payload));
    return { nextRoot, message };
  }
};
