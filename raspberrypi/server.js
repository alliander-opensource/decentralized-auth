const IOTA = require('iota.lib.js');

const iota = new IOTA({
  provider: 'http://localhost:14700'
});

const deviceSeed = 'GOYM9ANDMIHYZUWUBPEVLPRSUGDZHDDVTLS9HBOGNOGLGQTPQTAZNVIWIVVXAVVSZWZJWZHSEVTPNBYWE';
const deviceAddress = 'FODEYEQHYCWYTDEDWZLPCLRDIU9RFKU9AFQSEOR9RSGEPDGQBGMYXIQCENBDGYFFS9AJK9GJJZJGEUEW9'; // address with index 0 and security 3
const deviceSecret = 'SECRET';

const depth = 6;
const mwm = 3; // Minimum weight magnitude 3 works on local testnet if configured like that, 14 for main


// TODO: addresses are not rotated.


/*
 * PAIRING A DEVICE
 */


/**
 * Gets last received transfer message.
 * NOTE: order is not necessarily chronological, but let's assume it is.
 *
 * @function getLastMessge
 * @param {string} seed Our IOTA seed
 * @param {string} address Our IOTA address
 * @returns {JSON} Parsed message or `null` when no received transfers
 */
function getLastMessage(seed, address) {
  return new Promise((resolve, reject) => {
    const options = { security: 3 };

    iota.api.getTransfers(seed, options, (err, transfers) => {
      if (err) reject(err);

      const { received } = iota.utils.categorizeTransfers(transfers, [address]);

      if (received.length === 0) reject(new Error('No received transfers'));

      const latestTransfer = received[received.length - 1];
      const message = JSON.parse(iota.utils.extractJson(latestTransfer));

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
 * @returns {null}
 */
function send(seed, receiver, message) {
  const trytes = iota.utils.toTrytes(JSON.stringify(message));
  const transfers = [{ address: receiver, value: 0, message: trytes }];

  iota.api.sendTransfer(seed, depth, mwm, transfers, (err) => {
    if (err) {
      console.log(`Send error: ${err}`);
    } else {
      console.log(`Send message ${JSON.stringify(message)} to ${receiver}`);
    }
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
 * @returns {null}
 */
function sendChallenge(seed, sender, receiver, challenge) {
  const message = { sender, challenge };
  send(seed, receiver, message);
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
  const message = status === 'OK' ?
    { sender, status, mamData: { root: 'ROOT', sideKey: 'SIDEKEY' } } :
    { sender, status };

  send(seed, receiver, message);
}


function isValid(signedChallenge) {
  return signedChallenge === 'XSECRET';
}


getLastMessage(deviceSeed, deviceAddress)
  .then(({ sender, signedChallenge }) => {
    if (signedChallenge) {
      const status = isValid(signedChallenge) ? 'OK' : 'NOK';
      sendClaimResult(deviceSeed, deviceAddress, sender, status);
    } else {
      sendChallenge(deviceSeed, deviceAddress, sender, 'SECRET');
    }
  })
  .catch(console.log);
