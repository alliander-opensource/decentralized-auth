/**
 * Class to keep the state of the signed challenges on this device.
 * When a signed challenge is used it needs to be removed to prevent replay
 * attacks.
 * @module service-providers
 */


const logger = require('../logger')(module);


module.exports = class SignedChallenges {
  constructor() {
    this.db = new Set(); // mutable set
  }

  add(signedChallenge) {
    logger.info(`Storing signed challenge ${signedChallenge}`);
    this.db.add(signedChallenge);
  }


  remove(signedChallenge) {
    logger.info(`Removing signed challenge ${signedChallenge}`);
    this.db.delete(signedChallenge);
  }


  isValid(signedChallenge) {
    return this.db.has(signedChallenge);
  }
};
