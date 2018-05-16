const config = require('./../config');
const logger = require('../logger')(module);
const IOTA = require('iota.lib.js');

const iota = new IOTA({
  provider: config.iotaProvider,
});

const depth = config.iotaDepth;
const mwm = config.iotaMinWeightMagnitude;

/**
 * Send a message via IOTA.
 *
 * @function send
 * @param {string} seed Our IOTA seed
 * @param {string} receiver IOTA address of receiver
 * @param {JSON} message to send
 * @returns {Promise}
 */
function send(seed, receiver, message) {
  return new Promise((resolve, reject) => {
    const trytes = iota.utils.toTrytes(JSON.stringify(message));
    const transfers = [{ address: receiver, value: 0, message: trytes }];

    iota.api.sendTransfer(seed, depth, mwm, transfers, (err, res) => {
      if (!err) {
        logger.info(`Send message ${JSON.stringify(message)} to ${receiver}`);
        return resolve(res);
      }
      logger.error(`Send error: ${err}`);
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
function getLastMessage(searchValues) {
  return new Promise((resolve, reject) => {
    iota.api.findTransactionObjects(searchValues, (err, transactions) => {
      if (err) return reject(err);
      if (!transactions || transactions.length === 0) return reject(new Error('No transactions retrieved.'));

      const sortedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp);
      const lastTransaction = sortedTransactions[0];

      return iota.api.findTransactionObjects({ bundles: [lastTransaction.bundle] }, (e, txs) => {
        if (e) return reject(e);

        // Transactions need to be sorted by currentIndex for extractJson to work
        const sortedTxs = txs.sort((a, b) => a.currentIndex - b.currentIndex);
        const message = JSON.parse(iota.utils.extractJson(sortedTxs));

        const messageWithTimeStamp = { ...message, timestamp: lastTransaction.timestamp };

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
 * @param {string} securityLevel Generate addresses with this security level (1, 2 or 3)
 * @returns {Promise} With result or reject with error
 */
function getAddress(seed, amount) {
  return new Promise((resolve, reject) =>
    iota.api.getNewAddress(
      seed,
      { index: 0, total: amount, security: 3 },
      (err, res) => (err ? reject(err) : resolve(res)),
    ));
}


const { toTrytes, extractJson } = iota.utils;


function fromTrytes(trytes) {
  const isOdd = n => (n % 2) === 1;

  // Work around odd length trytes that cannot be converted by appending a 9
  if (isOdd(trytes.length)) {
    return iota.utils.fromTrytes(`${trytes}9`);
  }

  return iota.utils.fromTrytes(trytes);
}


module.exports = {
  iota,

  send,
  getLastMessage,

  getAddress,
  extractJson,
  toTrytes,
  fromTrytes,
};
