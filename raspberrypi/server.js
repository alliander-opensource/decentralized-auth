const IOTA = require('iota.lib.js');
const signing = require('./iota/signing');
const logger = require('winston');
const CryptoJS = require('crypto-js');

const iota = new IOTA({
  provider: 'http://node01.testnet.iotatoken.nl:16265'
});

const deviceSeed = 'GOYM9ANDMIHYZUWUBPEVLPRSUGDZHDDVTLS9HBOGNOGLGQTPQTAZNVIWIVVXAVVSZWZJWZHSEVTPNBYWE';
const deviceAddress = 'FODEYEQHYCWYTDEDWZLPCLRDIU9RFKU9AFQSEOR9RSGEPDGQBGMYXIQCENBDGYFFS9AJK9GJJZJGEUEW9'; // address with index 0 and security 3
// const deviceAddress = iota.api.getNewAddress(deviceSeed, { index: 0, checksum: false, security: 3 });
const secret = 'BANANA';

const depth = 6;
const mwm = 10; // Minimum weight magnitude 10 works testnet, 14 for main


let signedChallenges = [];

// TODO: addresses are not rotated.


/*
 * PAIRING A DEVICE
 */

/**
 * Gets last received transfer message.
 * NOTE: order is not necessarily chronological, but let's assume it is.
 *
 * @function getLastMessage
 * @param {string} address Our IOTA address
 * @returns {JSON} Parsed message or `null` when no received transfers
 */
function getLastMessage(address) {
  return new Promise((resolve, reject) => {
    iota.api.findTransactionObjects({ addresses: [address] }, (err, transactions) => {
      if (err) reject(err);

      const { received } = iota.utils.categorizeTransfers([transactions], [address]);

      if (received.length === 0) reject(new Error('No received transfers'));

      // Assuming timestamps in order
      const lastTransaction = received[received.length - 1];
      const message = JSON.parse(iota.utils.extractJson(lastTransaction));

      resolve(message);
    });
  });
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
function send(seed, receiver, message) {
  return new Promise((resolve, reject) => {
    const trytes = iota.utils.toTrytes(JSON.stringify(message));
    const transfers = [{ address: receiver, value: 0, message: trytes }];

    iota.api.sendTransfer(seed, depth, mwm, transfers, (err, res) => {
      if (!err) {
        logger.info(`Send message ${JSON.stringify(message)} to ${receiver}`);
        resolve(res);
      } else {
        logger.error(`Send error: ${err}`);
        reject(err);
      }
    });
  });
}


/**
 * Returns a challenge to the sender.
 *
 * @function sendChallenge
 * @param {string} seed Our IOTA seed
 * @param {string} sender Our IOTA address
 * @param {string} receiver IOTA address of receiver of the challenge
 * @param {string} challenge Challenge to be returned signed with key on the box
 * @returns {Promise}
 */
function sendChallenge(seed, sender, receiver, challenge) {
  const message = { sender, challenge };
  return send(seed, receiver, message);
}


/**
 * Sends claim result (including MAM message when result was 'OK')
 *
 * @function sendClaimResult
 * @param {string} seed Our IOTA seed
 * @param {string} sender Our IOTA address
 * @param {string} receiver IOTA address of receiver of successful claim
 * @param {string} status 'OK' or 'NOK'
 * @returns {null}
 */
function sendClaimResult(seed, sender, receiver, status) {

  // TODO MAM
  // const { root, sideKey } =

  const message = status === 'OK' ?
    { sender, status, mamData: { root: 'ROOT', sideKey: 'SIDEKEY' } } :
    { sender, status };

  return send(seed, receiver, message);
}


// Source for 'random' generator:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript/47496558#47496558
function createChallenge() {
  let challenge = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  const HASH_LENGTH = 243; // kerl

  for (let i = 0; i < HASH_LENGTH - secret.length; i += 1) {
    challenge += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return challenge;
}


function storeSignedChallenge(signedChallenge) {
  signedChallenges.push(signedChallenge);
}


function removeSignedChallenge(signedChallenge) {
  signedChallenges = signedChallenges.filter(sc => sc !== signedChallenge);
}


function isValid(signedChallenge) {
  return signedChallenges.includes(signedChallenge);
}


function run() {
  logger.info('Getting last message...');

  getLastMessage(deviceAddress)
    .then(({ sender, signedChallenge }) => {
      if (signedChallenge) {

        // TODO do not call multiple times
        const status = isValid(signedChallenge) ? 'OK' : 'NOK';
        removeSignedChallenge(signedChallenge);
        return sendClaimResult(deviceSeed, deviceAddress, sender, status);
      }
      const challenge = createChallenge();
      const signed = signing.sign(challenge, secret);
      storeSignedChallenge(signed);

      return sendChallenge(deviceSeed, deviceAddress, sender, challenge);
    })
    .catch(logger.error);
}


function getAddress(seed) {
  iota.api.getNewAddress(seed, { index: 0, total: 1, security: 3 }, (err, res) => console.log(res));
}


// MAIN
setInterval(run, 10000);
