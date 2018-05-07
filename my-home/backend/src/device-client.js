const utils = require('./common/utils');
const logger = require('./logger')(module);

const iota = require('./modules/iota');
const mam = require('./modules/iota-mam');

const p1Reader = require('./device-client/p1');

const SignedChallenges = require('./device-client/signed-challenges');
const signing = require('./modules/iota/kerl/signing');

const SEND_CHALLENGE_TYPE = 'CHALLENGE';
const CLAIM_RESULT_TYPE = 'CLAIM_RESULT';
const CLAIM_DEVICE_TYPE = 'CLAIM_DEVICE';
const ANSWER_CHALLENGE_TYPE = 'ANSWER_CHALLENGE';
const INFORM_UPDATE_SIDE_KEY_TYPE = 'INFORM_UPDATE_SIDE_KEY';

const CHECK_MESSAGE_INTERVAL_MS = 5000;


module.exports = class DeviceClient {
  constructor(seed, sharedSecret, initialSideKey) {
    this.seed = seed;
    this.secret = sharedSecret; // Shared secret on Pi
    this.sideKey = initialSideKey;

    this.signedChallenges = new SignedChallenges();
    this.seenMessages = new Set(); // To avoid processing same message (below)

    this.mam = mam;
    this.mam.init(seed, initialSideKey);

    this.init(CHECK_MESSAGE_INTERVAL_MS);
  }


  // TODO: addresses are not rotated.

  /**
   * Creates a challenge (a salt to be signed with the secret) that can be
   * signed via {@link signing.sign} with a secret of length {@link secretLength}.
   *
   * @function createChallenge
   * @param {int} secretLength Length of the secret
   * @returns {string} The challenge
   */
  static createChallenge(secretLength) {
    const trytes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    const HASH_LENGTH = 243; // kerl

    const challenge = new Array(HASH_LENGTH - secretLength)
      .fill()
      .map(() => trytes.charAt(Math.floor(trytes.length * Math.random())))
      .join('');

    return challenge;
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
  sendChallenge(seed, sender, receiver) {
    const challenge = DeviceClient.createChallenge(this.secret.length);
    const message = { type: SEND_CHALLENGE_TYPE, sender, challenge };

    // Also store the challenge
    const signedChallenge = signing.sign(challenge, this.secret);
    this.signedChallenges.add(signedChallenge);

    return iota.send(seed, receiver, message);
  }


  /**
  * Sends claim result (including MAM message when result was 'OK').
  *
  * @function endClaimResult
  * @param {string} seed Our IOTA seed
  * @param {string} sender Our IOTA address
  * @param {string} receiver IOTA address of receiver of successful claim
  * @param {string} status 'OK' or 'NOK'
  * @returns {null}
  */
  sendClaimResult(seed, sender, receiver, signedChallenge) {
    const { channel: { side_key, next_root } } = mam.getMamState();

    const message = utils.merge(
      { type: CLAIM_RESULT_TYPE, sender },
      this.signedChallenges.isValid(signedChallenge) ?
        { status: 'OK', mamData: { root: next_root, sideKey: side_key } } :
        { status: 'NOK', reason: 'Signed challenge invalid' },
    );

    // Only use signed challenge once to prevent replay attacks
    this.signedChallenges.remove(signedChallenge);

    return iota.send(seed, receiver, message);
  }


  /**
   * Informs {@link authorizedServiceProviders} of the new side key. The 'key
   * rotation' message is transferred via MAM, and the new side key is encrypted
   * with the public key of the remaining authorized service providers (if any).
   *
   * Message has structure:
   * ```
   * {
   *   type: 'KEY_ROTATION,
   *   addressAuthorizedSp1: 'Side key encrypted with authorizedSp1's key',
   *   addressAuthorizedSp2: 'Side key encrypted with authorizedSp2's key'
   * }
   * ```
   *
   * @function informUpdateSideKey
   * @param {string} authorizedServiceProviders Addresses of remaining authorized
   *                 service providers
   * @param {string} newSideKey Our new side key we are using
   * @returns {null}
   */
  informUpdateSideKey(authorizedServiceProviders, newSideKey) {
    // TODO: encrypt, service provider can send key along
    const keysForServiceProviders = authorizedServiceProviders.map(sp => ({
      key: sp,
      val: newSideKey,
    })).reduce((map, obj) => {
      map[obj.key] = obj.val; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    const message = {
      type: 'KEY_ROTATION',
      ...keysForServiceProviders,
    };

    return this.mam.attach(message);
  }


  /**
   * Message handler for the P1 port
   *
   * @function handleP1Message
   * @param {string} telegram P1 telegram
   * @returns {null}
   */
  handleP1Message(telegram) {
    const message = {
      type: 'DATA',
      raw: telegram,
      timestamp: Date.now(),
    };

    this.mam.attach(message);
  }


  /**
   * Retrieves one message from this device's address and dispatches it to the
   * appropriate message handler.
   *
   * @function processMessage
   * @param {string} address The address to fetch the message from
   * @returns {null}
   */
  processMessage(address) {
    logger.info(`Getting last message from address ${address}...`);


    iota.getLastMessage(address)
      .then((msg) => {
        if (!msg) {
          logger.info('No messages');
          return null;
        }

        // To avoid processing the same last message over and over we keep track
        // of already processed messages (note: stringified versions so set
        // operations that use equals (like set.has()) work as intended)
        if (this.seenMessages.has(JSON.stringify(msg))) {
          logger.info('No new messages');
          return null;
        }
        this.seenMessages.add(JSON.stringify(msg));

        logger.info(`Received new message of type ${msg.type}`);
        switch (msg.type) {
          case CLAIM_DEVICE_TYPE:
          {
            return this.sendChallenge(
              this.seed,
              address,
              msg.sender,
            );
          }
          case ANSWER_CHALLENGE_TYPE:
          {
            return this.sendClaimResult(
              this.seed,
              address,
              msg.sender,
              msg.signedChallenge,
            );
          }
          case INFORM_UPDATE_SIDE_KEY_TYPE:
          {
            const sideKeys = ['HUMMUS', 'SWEETPOTATO', 'FRIES'];
            const randomIndex = Math.floor(Math.random() * sideKeys.length);
            const newSideKey = sideKeys[randomIndex];

            return this.informUpdateSideKey(
              msg.authorizedServiceProviders,
              newSideKey,
            )
              .then(() => this.mam.changeSideKey(newSideKey))
              .catch(err => logger.error(`change side key ${err}`));
          }
          default:
          {
            throw new Error(`Unknown message type: ${msg.type}`);
          }
        }
      })
      // NOTE: Winston logger seems to swallow JavaScript errors
      .catch(console.log); // eslint-disable-line no-console
  }


  /**
   * Start the DeviceClient (check for messages and process them).
   *
   * @function start
   * @param {int} intervalMs Interval in milliseconds in which to check for
   *                         messages.
   */
  async init(intervalMs) {
    const [address] = await iota.getAddress(this.seed, 1);
    logger.info(`Starting device client on address ${address}`);

    p1Reader.tryInitP1(telegram => this.handleP1Message(telegram));

    // Check immediately
    this.processMessage(address);
    // Keep checking periodically
    setInterval(() => this.processMessage(address), intervalMs);
  }
};
