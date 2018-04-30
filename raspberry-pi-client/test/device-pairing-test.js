const iota = require('../src/modules/iota');
const pairing = require('../src/modules/device/pairing');
const DeviceClient = require('../src/device-client');
const signing = require('../src/modules/iota/kerl/signing');
const { expect, generateSeedForTestingPurposes } = require('../src/common/test-utils');

describe('Pairing of a device by calling methods on DeviceClient', () => {
  const myHouseSeed = generateSeedForTestingPurposes();
  const deviceSeed = generateSeedForTestingPurposes();
  const deviceSecret = 'HUMMUS';
  const initialSideKey = 'SWEETPOTATO';

  let myHouseAddress;
  let deviceClient;
  let deviceAddress;

  before(() => {
    iota.getAddress(myHouseSeed, 1)
      .then(([firstAddress]) => {
        myHouseAddress = firstAddress;
      });
    iota.getAddress(deviceSeed, 1)
      .then(([firstAddress]) => {
        deviceAddress = firstAddress;
        deviceClient = new DeviceClient(
          deviceSeed,
          deviceAddress,
          deviceSecret,
          initialSideKey,
        );
      });
  });

  describe('myHouse.claimDevice', () => {
    it('should send a claim message to a device', () =>
      pairing.claimDevice(myHouseSeed, myHouseAddress, deviceAddress)
        .then(transactions =>

          expect(transactions).to.be.an('array')));
  });

  describe('deviceClient.getLastMessage', () =>
    it('should be able to retrieve the last message', () =>
      iota.getLastMessage(deviceAddress)
        .then(message =>

          expect(message).to.deep.equal({
            type: pairing.CLAIM_DEVICE_TYPE,
            sender: myHouseAddress,
          }))));

  describe('deviceClient.sendChallenge', () => {
    it('should be able to create a challenge that can be signed', () => {
      const challenge = DeviceClient.createChallenge(deviceSecret.length);
      const HASH_LENGTH = 243; // kerl internals

      expect(challenge).to.have.lengthOf(HASH_LENGTH - deviceSecret.length);
    });

    it('should be able to send a challenge', () =>
      deviceClient.sendChallenge(
        deviceSeed,
        deviceAddress,
        myHouseAddress,
      )
        .then(transactions =>

          expect(transactions).to.be.an('array')));

    it('should have stored the signed challenge for later', () => {});
  });

  describe('myHouse.answerChallenge', () => {
    let testChallenge;

    it('should be able to retrieve a challenge', () =>
      iota.getLastMessage(myHouseAddress)
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

    it('should be able to answer a challenge', () =>
      pairing.answerChallenge(
        myHouseSeed,
        myHouseAddress,
        deviceAddress,
        testSignedChallenge,
      )
        .then(transactions =>

          expect(transactions).to.be.an('array')));
  });

  describe('deviceClient.sendClaimResult', () => {
    let testSender;
    let testSignedChallenge;

    it('should be able to receive a claim result', () =>
      iota.getLastMessage(deviceAddress)
        .then((message) => {
          testSender = message.sender;
          testSignedChallenge = message.signedChallenge;
          return message;
        })
        .then((message) => {
          expect(message).to.have.property('signedChallenge');
          expect(message).to.have.property('sender');
        }));

    it('should be able to see if a signed challenge is valid', () => {
      const isValid = deviceClient.signedChallenges.isValid(testSignedChallenge);

      expect(isValid).to.be.true; // eslint-disable-line no-unused-expressions
    });

    it('should be able to send the claim result', () =>
      deviceClient.sendClaimResult(
        deviceSeed,
        deviceAddress,
        testSender,
        testSignedChallenge,
      )
        .then(transactions =>

          expect(transactions).to.be.an('array')));

    it('should prevent replay attacks (only use signed challenge once)', () => {
      const isValid = deviceClient.signedChallenges.isValid(testSignedChallenge);

      expect(isValid).to.be.false; // eslint-disable-line no-unused-expressions
    });
  });

  describe('myHouse.retrieveClaim', () => {
    it('should be able to retrieve the successful claim result', () =>
      pairing.retrieveClaim(myHouseAddress, deviceAddress)
        .then((claim) => {
          expect(claim).to.have.property('sender');
          expect(claim).to.have.property('status');
          expect(claim.status).to.equal('OK');
          expect(claim).to.have.property('mamData')
            .and.to.have.property('sideKey')
            .and.to.equal('SWEETPOTATO');
          expect(claim).to.have.property('mamData') // eslint-disable-line jasmine/new-line-before-expect
            .and.to.have.property('root')
            .and.to.have.lengthOf(81);
        }));
  });
});
