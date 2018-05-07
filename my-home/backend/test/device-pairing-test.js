const { exec } = require('child_process');
const iota = require('../src/modules/iota');
const pairing = require('../src/modules/device/pairing');
const signing = require('../src/modules/iota/kerl/signing');
const { expect, generateSeedForTestingPurposes } = require('../src/common/test-utils');
const PromiseRetryer = require('promise-retryer')(Promise);


describe('Pairing of a device using a Device Client instance', () => {
  const myHouseSeed = generateSeedForTestingPurposes();
  const deviceSeed = generateSeedForTestingPurposes();
  const deviceSecret = 'APPLE';
  const initialSideKey = 'BANANA';

  // We will need to wait on the Device to have processed the messages we send
  const WAIT_TIME_MS = 5000;
  const MAX_RETRIES = 3;

  let myHouseAddress;
  let deviceAddress;

  before(async () => {
    [myHouseAddress] = await iota.getAddress(myHouseSeed, 1);
    [deviceAddress] = await iota.getAddress(deviceSeed, 1);

    // Start the device client
    exec(`cd ../../raspberry-pi-client; SEED=${deviceSeed} \
          npm start`, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  });

  describe('myHouse.claimDevice', () => {
    it('should send a claim message to a device', () =>
      pairing.claimDevice(myHouseSeed, myHouseAddress, deviceAddress)
        .then(transactions =>

          expect(transactions).to.be.an('array')));
  });

  describe('myHouse.answerChallenge', () => {
    let testChallenge;

    it('should be able to retrieve a challenge', () =>
      PromiseRetryer.run({
        delay: WAIT_TIME_MS,
        maxRetries: MAX_RETRIES,
        promise: () => iota.getLastMessage({ addresses: [myHouseAddress] }),
        validate: msg =>
          new Promise((resolve, reject) => {
            if (!!msg && msg.type === 'CHALLENGE') {
              resolve(msg);
            } else {
              reject(new Error('Response was not a challenge'));
            }
          }),
      })
        .then((message) => {
          testChallenge = message.challenge;
          return message;
        })
        .then(message =>

          expect(message).to.have.property('challenge')));

    let testSignedChallenge = '';

    it('should be able to sign a challenge', () => {
      const signedChallenge = signing.sign(testChallenge, deviceSecret);
      const DIGEST_LENGTH = 81;

      expect(signedChallenge).to.have.lengthOf(DIGEST_LENGTH);

      testSignedChallenge = signedChallenge;
    });

    it('should be able to answer a challenge', () => {
      pairing.answerChallenge(
        myHouseSeed,
        myHouseAddress,
        deviceAddress,
        testSignedChallenge,
      )
        .then(transactions =>

          expect(transactions).to.be.an('array'));
    });
  });

  describe('myHouse.retrieveClaim', () => {
    it('should be able to retrieve the successful claim result', () =>
      PromiseRetryer.run({
        delay: WAIT_TIME_MS,
        maxRetries: MAX_RETRIES,
        promise: () => pairing.retrieveClaim(myHouseAddress, deviceAddress),
        validate: msg =>
          new Promise((resolve, reject) => {
            if (!!msg && msg.type === 'CLAIM_RESULT') {
              resolve(msg);
            } else {
              reject(new Error('Response was not a claim result'));
            }
          }),
      })
        .then((claim) => {
          expect(claim).to.have.property('sender');
          expect(claim).to.have.property('status');
          expect(claim.status).to.equal('OK');
          expect(claim).to.have.property('mamData')
            .and.to.have.property('sideKey')
            .and.to.equal(initialSideKey);
          expect(claim).to.have.property('mamData') // eslint-disable-line jasmine/new-line-before-expect
            .and.to.have.property('root')
            .and.to.have.lengthOf(81);
        }));
  });
});
