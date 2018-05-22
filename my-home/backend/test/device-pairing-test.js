const { exec } = require('child_process');
const iota = require('../src/modules/iota');
const ntru = require('../src/modules/ntru');
const pairing = require('../src/modules/device/pairing');
const signing = require('../src/modules/iota/kerl/signing');
const { expect, generateSeedForTestingPurposes } = require('../src/common/test-utils');
const PromiseRetryer = require('promise-retryer')(Promise);


describe('Pairing of a device using a Device Client started with npm start', () => {
  const myHouseSeed = generateSeedForTestingPurposes();
  const deviceSeed = generateSeedForTestingPurposes();
  const deviceSecret = 'APPLE';

  // We will need to wait on the Device to have processed the messages we send
  const WAIT_TIME_MS = 5000;
  const MAX_RETRIES = 50;


  let myHouseAddress;
  const myHouseRoot = '';
  let deviceAddress;

  before(async () => {
    [myHouseAddress] = await iota.getAddress(myHouseSeed, 1);
    [deviceAddress] = await iota.getAddress(deviceSeed, 1);

    // Start the device client
    exec(`cd ../../raspberry-pi-client; SEED=${deviceSeed} npm start`, (err, out, code) => {
      if (err) {
        process.stderr.write(err);
        throw new Error(err);
      }
      process.stdout.write(out);
      process.exit(code);
    });
  });

  describe('myHouse.claimDevice', () => {
    it('should send a claim message to a device', async () => {
      const transactions = await pairing.claimDevice(
        myHouseSeed,
        myHouseAddress,
        deviceAddress,
      );

      expect(transactions).to.be.an('array');
    });
  });

  describe('myHouse.answerChallenge', () => {
    let testChallenge;

    it('should be able to retrieve a challenge', async () => {
      const message = await PromiseRetryer.run({
        delay: WAIT_TIME_MS,
        maxRetries: MAX_RETRIES,
        promise: () => iota.getLastMessage({ addresses: [myHouseAddress] }),
        validate: msg =>
          new Promise((resolve, reject) => {
            if (!!msg && msg.type === 'CHALLENGE') {
              return resolve(msg);
            }
            return reject(new Error('Response was not a challenge'));
          }),
      });
      testChallenge = message.challenge;

      expect(message).to.have.property('challenge');
    });

    let testSignedChallenge = '';

    it('should be able to sign a challenge', () => {
      const signedChallenge = signing.sign(testChallenge, deviceSecret);
      const DIGEST_LENGTH = 81;

      expect(signedChallenge).to.have.lengthOf(DIGEST_LENGTH);

      testSignedChallenge = signedChallenge;
    });

    it('should be able to answer a challenge', async () => {
      const transactions = await pairing.answerChallenge(
        myHouseSeed,
        myHouseAddress,
        myHouseRoot,
        deviceAddress,
        testSignedChallenge,
      );

      expect(transactions).to.be.an('array');
    });
  });

  describe('myHouse.retrieveClaim', () => {
    it('should be able to retrieve the successful claim result', async () => {
      const claim = await PromiseRetryer.run({
        delay: WAIT_TIME_MS,
        maxRetries: MAX_RETRIES,
        promise: () => iota.getLastMessage({ addresses: [myHouseAddress] }),
        validate: msg =>
          new Promise((resolve, reject) => {
            if (!!msg && msg.type === 'CLAIM_RESULT') {
              resolve(msg);
            } else {
              reject(new Error('Response was not a claim result'));
            }
          }),
      });
      if (!pairing.isSuccessfulClaim(claim, deviceAddress)) {
        throw new Error(`Claim failed with reason ${claim.reason}`);
      }

      expect(claim).to.have.property('sender');
      expect(claim).to.have.property('status');
      expect(claim.status).to.equal('OK');
    });
  });
});
