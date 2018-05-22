const logger = require('./logger')(module);
const config = require('./config');

const iota = require('./modules/iota');
const MamClient = require('./modules/iota-mam');
const ntru = require('./modules/ntru');

const p1Reader = require('./device-client/p1');

const SignedChallenges = require('./device-client/signed-challenges');
const ServiceProviders = require('./device-client/service-providers');
const signing = require('./modules/iota/kerl/signing');

// IOTA message types
const SEND_CHALLENGE_TYPE = 'CHALLENGE';
const CLAIM_RESULT_TYPE = 'CLAIM_RESULT';
const CLAIM_DEVICE_TYPE = 'CLAIM_DEVICE';
const ANSWER_CHALLENGE_TYPE = 'ANSWER_CHALLENGE';
const MAM_DATA_TYPE = 'MAM_DATA';

// MAM message types
const AUTHORIZED_TYPE = 'AUTHORIZE';
const REVOKE_AUTHORIZATION_TYPE = 'REVOKE_AUTHORIZATION';
const DATA_MESSAGE_TYPE = 'DATA';
const KEY_ROTATION_TYPE = 'KEY_ROTATION';

const CHECK_MESSAGE_INTERVAL_MS = 10000;


module.exports = class DeviceClient {
  constructor(seed, sharedSecret, initialSideKey) {
    this.seed = seed;
    this.secret = sharedSecret; // Shared secret on Pi
    this.sideKey = initialSideKey;

    this.signedChallenges = new SignedChallenges();
    this.authorizedServiceProviders = new ServiceProviders();
    this.seenMessages = new Set(); // To avoid processing same message (below)

    this.mam = new MamClient(seed, initialSideKey);

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
   * Sends claim result to receiver. If signed challenge is valid, starts
   * listening to the root
   *
   * @function processChallenge
   * @param {string} seed Our IOTA seed
   * @param {string} sender Our IOTA address
   * @param {string} receiver IOTA address of receiver of successful claim
   * @param {string} root MAM Root of the sender we will start listening to
   * @param {string} signedChallenge Signed challenge send by sender
   * @param {string} status 'OK' or 'NOK'
   * @returns {null}
   */
  processChallenge(seed, sender, receiver, root, signedChallenge) {
    let message;
    if (this.signedChallenges.isValid(signedChallenge)) {
      logger.info(`Setting MAM root to ${root}`);
      this.root = root;
      message = { type: CLAIM_RESULT_TYPE, status: 'OK', sender };
    } else {
      message = { type: CLAIM_RESULT_TYPE, status: 'NOK', reason: 'Signed challenge invalid' };
    }

    // Only use signed challenge once to prevent replay attacks
    this.signedChallenges.remove(signedChallenge);

    return iota.send(seed, receiver, message);
  }


  /**
   * Send encrypted MAM data to a service provider.
   *
   * @function sendMamData
   * @param {string} address IOTA address of the service provider
   * @param {string} publicKey Public key of the service provider in trytes
   * @returns {Promise}
   */
  sendMamData(address, publicKey) {
    const { channel: { side_key, next_root } } = this.mam.getMamState();
    const mamData = {
      root: ntru.encrypt(next_root, publicKey),
      sideKey: ntru.encrypt(side_key, publicKey),
    };

    logger.info(`Provide service provider ${address} with MAM data ${mamData}`);

    const message = { type: MAM_DATA_TYPE, mamData };
    return iota.send(config.iotaSeed, address, message);
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
   *   authorizedSp1: 'Side key encrypted with authorizedSp1's key',
   *   authorizedSp2: 'Side key encrypted with authorizedSp2's key'
   * }
   * ```
   *
   * @function informUpdateSideKey
   * @param {string} authorizedServiceProviders List of remaining authorized
   *                 service providers
   * @param {string} newSideKey Our new side key we are using
   * @returns {null}
   */
  informUpdateSideKey(authorizedServiceProviders, newSideKey) {
    const keysForServiceProviders = authorizedServiceProviders.map(sp => ({
      key: sp.iotaAddress,
      val: ntru.encrypt(newSideKey, sp.publicKeyTrytes),
    })).reduce((map, obj) => {
      map[obj.key] = obj.val; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    const message = {
      type: KEY_ROTATION_TYPE,
      ...keysForServiceProviders,
    };

    return this.mam.attach(message);
  }


  /**
   * Message handler for the P1 port.
   *
   * @function handleP1Message
   * @param {string} P1 telegram
   * @returns {null}
   */
  handleP1Message(telegram) {
    const message = {
      type: DATA_MESSAGE_TYPE,
      raw: telegram,
      timestamp: Date.now(),
    };

    // 5.0 sends one message every 10 seconds, newer versions one every second
    if (config.smartMeterVersion === 5.0) {
      // Only handle 1 in 60 messages for now, because otherwise we get too much
      // PoW on the node and it crashes
      if (Math.floor(Math.random() * 60) === 0) {
        this.mam.attach(message);
      }
    } else {
      this.mam.attach(message);
    }
  }


  /**
   * Retrieves one message from this device's address and dispatches it to the
   * appropriate message handler.
   *
   * @function processIotaMessage
   * @param {string} address The address to fetch the message from
   * @returns {null}
   */
  processIotaMessage(address) {
    logger.info(`Getting last message from address ${address}...`);

    iota.getLastMessage({ addresses: [address] })
      .then((msg) => {
        if (!msg) {
          logger.info('No messages');
          return null;
        }

        // To avoid processing the same last message over and over we keep track
        // of already processed messages (note: stringified versions so set
        // operations that use equals (like set.has()) work as intended)
        if (this.seenMessages.has(JSON.stringify(msg))) {
          logger.info('No new IOTA messages');
          return null;
        }
        this.seenMessages.add(JSON.stringify(msg));

        logger.info(`Received new IOTA message of type ${msg.type}`);
        switch (msg.type) {
          case CLAIM_DEVICE_TYPE: {
            return this.sendChallenge(
              this.seed,
              address,
              msg.sender,
            );
          }
          case ANSWER_CHALLENGE_TYPE: {
            return this.processChallenge(
              this.seed,
              address,
              msg.sender,
              msg.root,
              msg.signedChallenge,
            );
          }
          default: {
            throw new Error(`Unknown IOTA message type: ${msg.type}`);
          }
        }
      })
      // NOTE: Winston logger seems to swallow JavaScript errors
      .catch(console.log); // eslint-disable-line no-console
  }


  static formatTrytes(trytes) { return `${trytes.slice(0, 10)}...`; }


  /**
   * Retrieves and processes MAM messages by dispatching the type of message to
   * its handler.
   *
   * @function processMamMessage
   * @returns {undefined}
   */
  async processMamMessage() {
    const mode = 'public';
    const IS_PAIRED = (typeof this.root !== 'undefined');
    if (!IS_PAIRED) {
      logger.info('IOTA MAM: No root received (device not paired)');
      return;
    }
    logger.info(`IOTA MAM: Fetching from root ${DeviceClient.formatTrytes(this.root)}`);
    try {
      const res = await this.mam.fetchSingle(this.root, mode);
      if (typeof res === 'undefined') {
        // no message, you can try again later, keep root
        logger.info('No new MAM message');
        return;
      }
      const { nextRoot, message } = res;
      switch (message.type) {
        case AUTHORIZED_TYPE: {
          const { policy: serviceProvider } = message;
          logger.info(`Authorizing service provider ${JSON.stringify(serviceProvider)}`);
          this.authorizedServiceProviders.add(serviceProvider);
          this.sendMamData(serviceProvider.iotaAddress, serviceProvider.publicKeyTrytes);
          break;
        }
        case REVOKE_AUTHORIZATION_TYPE: {
          const sideKeys = ['HUMMUS', 'SWEETPOTATO', 'FRIES'];
          const randomIndex = Math.floor(Math.random() * sideKeys.length);
          const newSideKey = sideKeys[randomIndex];
          this.authorizedServiceProviders.remove(message.serviceProvider);
          this.informUpdateSideKey(
            this.authorizedServiceProviders,
            newSideKey,
          )
            .then(() => this.mam.changeSideKey(newSideKey))
            .catch(err => logger.error(`changeSideKey failed: ${err}`));
          break;
        }
        default: {
          logger.info(`Unknown MAM msg type: ${message.type}`);
        }
      }
      logger.info(`IOTA MAM: Setting root to ${DeviceClient.formatTrytes(nextRoot)}`);
      this.root = nextRoot;
    } catch (err) {
      logger.error(`In processMamMessage: ${err}`);
    }
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

    setInterval(() => this.processIotaMessage(address), intervalMs);
    setInterval(() => this.processMamMessage(), intervalMs);
  }
};
