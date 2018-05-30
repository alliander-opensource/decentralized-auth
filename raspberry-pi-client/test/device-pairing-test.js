const iota = require('../src/modules/iota');
const pairingMock = require('./pairing-mock');

const DeviceClient = require('../src/device-client');
const signing = require('../src/modules/iota/kerl/signing');
const { expect } = require('chai');
const generateSeed = require('@decentralized-auth/gen-seed');

describe('Pairing of a device by calling methods on DeviceClient', () => {
  let myHouseSeed;
  const myHouseRoot = 'JACKFRUIT';
  let deviceSeed;
  const deviceSecret = 'PEAR';
  const initialSideKey = 'BANANA';

  let myHouseAddress;
  let deviceClient;
  let deviceAddress;

  before(async () => {
    myHouseSeed = await generateSeed();
    deviceSeed = await generateSeed();
    [myHouseAddress] = await iota.getAddress(myHouseSeed, 1);
    [deviceAddress] = await iota.getAddress(deviceSeed, 1);

    deviceClient = new DeviceClient(
      deviceSeed,
      deviceSecret,
      initialSideKey,
    );
  });

  describe('myHouse.claimDevice', () => {
    it('should send a claim message to a device', async () => {
      const transactions = await pairingMock.claimDevice(
        myHouseSeed,
        myHouseAddress,
        deviceAddress,
      );

      expect(transactions).to.be.an('array');
    });
  });

  describe('deviceClient.getLastMessage', () =>
    it('should be able to retrieve the last message', async () => {
      const message = await iota.getLastMessage({ addresses: [deviceAddress] });

      expect(message).to.have.property('type').and.equal(pairingMock.CLAIM_DEVICE_TYPE);
      expect(message).to.have.property('sender').and.equal(myHouseAddress);
    }));

  describe('deviceClient.sendChallenge', () => {
    it('should be able to create a challenge that can be signed', () => {
      const challenge = DeviceClient.createChallenge(deviceSecret.length);
      const HASH_LENGTH = 243; // kerl internals

      expect(challenge).to.have.lengthOf(HASH_LENGTH - deviceSecret.length);
    });

    it('should be able to send a challenge', async () => {
      const transactions = await deviceClient.sendChallenge(
        deviceSeed,
        deviceAddress,
        myHouseAddress,
      );

      expect(transactions).to.be.an('array');
    });

    it('should have stored the signed challenge for later', () => {});
  });

  describe('myHouse.answerChallenge', () => {
    let testChallenge;

    it('should be able to retrieve a challenge', async () => {
      const message = await iota.getLastMessage({ addresses: [myHouseAddress] });
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
      const transactions = await pairingMock.answerChallenge(
        myHouseSeed,
        myHouseAddress,
        myHouseRoot,
        deviceAddress,
        testSignedChallenge,
      );

      expect(transactions).to.be.an('array');
    });
  });

  describe('deviceClient.sendClaimResult', () => {
    let testSender;
    let testSignedChallenge;

    it('should be able to receive a claim result', async () => {
      const message = await iota.getLastMessage({ addresses: [deviceAddress] });
      testSender = message.sender;
      testSignedChallenge = message.signedChallenge;

      expect(message).to.have.property('signedChallenge');
      expect(message).to.have.property('sender');
    });

    it('should be able to see if a signed challenge is valid', () => {
      const isValid = deviceClient.signedChallenges.isValid(testSignedChallenge);

      expect(isValid).to.be.true; // eslint-disable-line no-unused-expressions
    });

    it('should be able to send the claim result', async () => {
      const transactions = await deviceClient.processChallenge(
        deviceSeed,
        deviceAddress,
        testSender,
        myHouseRoot,
        testSignedChallenge,
      );

      expect(transactions).to.be.an('array');
    });

    it('should prevent replay attacks (only use signed challenge once)', () => {
      const isValid = deviceClient.signedChallenges.isValid(testSignedChallenge);

      expect(isValid).to.be.false; // eslint-disable-line no-unused-expressions
    });
  });

  describe('myHouse.retrieveClaim', () =>
    it('should be able to retrieve the successful claim result', async () => {
      const claim = await iota.getLastMessage({ addresses: [myHouseAddress] });
      if (!pairingMock.isSuccessfulClaim(claim, deviceAddress)) {
        throw new Error(`Claim failed with reason ${claim.reason}`);
      }

      expect(claim).to.have.property('sender');
      expect(claim).to.have.property('status');
      expect(claim.status).to.equal('OK');
    }));

  describe('deviceClient.root', () =>
    it('should have added the root to its state', () => {
      expect(deviceClient.root).to.equal(myHouseRoot);
    }));
});
