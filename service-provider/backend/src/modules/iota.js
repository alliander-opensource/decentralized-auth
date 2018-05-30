/**
 * Wrapper for the IOTA client that provides some convenience methods.
 *
 * @module iota-mam
 */


const IOTA = require('iota.lib.js');

class IotaClient { // eslint-disable-line padded-blocks


  /**
   * Constructor for an IotaClient.
   * @constructor IotaClient
   * @param {object} iotaOptions with:
   *                 - {string} provider IOTA provider (host URL)
   *                 - {number} minWeightMagnitude Minimum weight magnitude for PoW
   *                 - {number} securityLevel IOTA security level
   *                 - {number} depth IOTA depth
   * @param {object} logger Should support the methods info and error
   */
  constructor({ provider, minWeightMagnitude, securityLevel, depth }, logger) {
    this.iota = new IOTA({ provider });
    this.depth = depth;
    this.securityLevel = securityLevel;
    this.mwm = minWeightMagnitude;
    this.logger = logger;
  }


  /**
   * Send a message via IOTA.
   *
   * @function send
   * @param {string} seed Our IOTA seed
   * @param {string} receiver IOTA address of receiver
   * @param {JSON} message to send
   * @returns {Promise}
   */
  send(seed, receiver, message) {
    return new Promise((resolve, reject) => {
      const trytes = this.iota.utils.toTrytes(JSON.stringify(message));
      const transfers = [{ address: receiver, value: 0, message: trytes }];

      this.iota.api.sendTransfer(seed, this.depth, this.mwm, transfers, (err, res) => {
        if (!err) {
          this.logger.info(`Send message ${JSON.stringify(message)} to ${receiver}`);
          return resolve(res);
        }
        this.logger.error(`Send error: ${err}`);
        return reject(err);
      });
    });
  }


  /**
   * Gets last received transfer message.
   * NOTE: order is not necessarily chronological, but let's assume it is.
   *
   * @function getLastMessage
   * @param {Object} searchValues List of bundle hashes, addresses, tags or
   *                              approvees (e.g., `{ hashes: ['ABCD'] }`)
   * @returns {JSON} Parsed message or `null` when no received transfers
   */
  getLastMessage(searchValues) {
    return new Promise((resolve, reject) => {
      this.iota.api.findTransactionObjects(searchValues, (err, transactions) => {
        if (err) return reject(err);
        if (!transactions || transactions.length === 0) return reject(new Error('No transactions retrieved.'));

        const sortedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp);
        const lastTransaction = sortedTransactions[0];
        const { bundle, timestamp } = lastTransaction;

        return this.iota.api.findTransactionObjects({ bundles: [bundle] }, (e, txs) => {
          if (e) return reject(e);

          // Transactions need to be sorted by currentIndex for extractJson to work
          const sortedTxs = txs.sort((a, b) => a.currentIndex - b.currentIndex);
          const message = JSON.parse(this.iota.utils.extractJson(sortedTxs));
          const messageWithTimeStamp = { ...message, timestamp };

          return resolve(messageWithTimeStamp);
        });
      });
    });
  }


  /**
   * Gets the first addresses with security level for seed starting at index 0.
   *
   * @function getAddress
   * @param {string} seed IOTA seed to generate an address for
   * @param {string} amount Amount of addresses to return
   * @returns {Promise} With result or reject with error
   */
  getAddress(seed, amount) {
    return new Promise((resolve, reject) =>
      this.iota.api.getNewAddress(
        seed,
        { index: 0, total: amount, security: this.securityLevel },
        (err, res) => (err ? reject(err) : resolve(res)),
      ));
  }


  toTrytes(text) { return this.iota.utils.toTrytes(text); }


  fromTrytes(trytes) {
    const isOdd = n => (n % 2) === 1;

    // Work around odd length trytes that cannot be converted by appending a 9
    if (isOdd(trytes.length)) {
      return this.iota.utils.fromTrytes(`${trytes}9`);
    }

    return this.iota.utils.fromTrytes(trytes);
  }
}


// For now to be backward compatible:

const config = require('../config');
const logger = require('../logger')(module);

module.exports = new IotaClient({
  provider: config.iotaProvider,
  securityLevel: config.iotaSecurityLevel,
  depth: config.iotaDepth,
  minWeightMagnitude: config.iotaMinWeightMagnitude,
}, logger);
