const DeviceClient = require('../src/device-client');
const iota = require('../src/modules/iota');
const generateSeed = require('@decentralized-auth/gen-seed');
const MamClient = require('@decentralized-auth/iota-mam');
const { expect } = require('chai');
const { delay } = require('./utils');

const CHECK_MESSAGE_INTERVAL_MS = 1000; // for quicker testing


describe('DeviceClient', () => {
  let myHouseSeed;
  let deviceSeed;

  before(async () => {
    myHouseSeed = await generateSeed();
    deviceSeed = await generateSeed();
  });

  const mode = 'private';
  const mam = new MamClient(myHouseSeed, iota, mode);

  describe('deviceClient.createKeyRotationMessage', () => {
    it('should create key rotation message', async () => {
      const authorizedServiceProviders = [
        {
          publicKeyTrytes: 'KEY1',
          iotaAddress: 'ADDRESS1',
        },
        {
          publicKeyTrytes: 'KEY2',
          iotaAddress: 'ADDRESS2',
        },
      ];
      const newSideKey = 'BANANA';
      const message = await DeviceClient.createKeyRotationMessage(
        authorizedServiceProviders,
        newSideKey,
      );

      expect(message).to.deep.equal({
        type: 'KEY_ROTATION',
        ADDRESS1: '', // encryption leads to empty string with fake public key
        ADDRESS2: '',
      });
    });
  });

  describe('adding and deleting of device', () => {
    it('should remove all authorized service providers when device is added', async () => {
      const deviceClient = new DeviceClient(
        deviceSeed,
        'SECRET',
        'SIDE_KEY',
        CHECK_MESSAGE_INTERVAL_MS,
      );
      const myHouseRoot = mam.getMamState().channel.next_root;
      const serviceProvider = { url: 'SP_URL' };

      deviceClient.root = myHouseRoot;
      deviceClient.authorizedServiceProviders.add(serviceProvider);

      expect(deviceClient.authorizedServiceProviders.getAll()).to.deep.equal([serviceProvider]);

      await mam.attach({
        type: 'DEVICE_ADDED',
      });

      await delay(CHECK_MESSAGE_INTERVAL_MS);

      // eslint-disable-next-line no-unused-expressions
      expect(deviceClient.authorizedServiceProviders.getAll()).to.be.empty;
    });

    it('should remove all authorized service providers when device is deleted', async () => {
      const deviceClient = new DeviceClient(
        deviceSeed,
        'SECRET',
        'SIDE_KEY',
        CHECK_MESSAGE_INTERVAL_MS,
      );
      const myHouseRoot = mam.getMamState().channel.next_root;
      const serviceProvider = { url: 'SP_URL' };

      deviceClient.root = myHouseRoot;
      deviceClient.authorizedServiceProviders.add(serviceProvider);

      expect(deviceClient.authorizedServiceProviders.getAll()).to.deep.equal([serviceProvider]);

      await mam.attach({
        type: 'DEVICE_DELETED',
      });

      await delay(CHECK_MESSAGE_INTERVAL_MS);

      // eslint-disable-next-line no-unused-expressions
      expect(deviceClient.authorizedServiceProviders.getAll()).to.be.empty;
    });
  });

  describe('adding and revoking of authorization', () => {
    const initialSideKey = 'SIDE_KEY';

    it('should add authorized service provider', async () => {
      const deviceClient = new DeviceClient(
        deviceSeed,
        'SECRET',
        initialSideKey,
        CHECK_MESSAGE_INTERVAL_MS,
      );
      const myHouseRoot = mam.getMamState().channel.next_root;
      const serviceProvider = { url: 'SP_URL' };
      const device = { iotaAddress: 'FOO' };

      deviceClient.root = myHouseRoot;
      await mam.attach({
        type: 'AUTHORIZED',
        policy: { serviceProvider, device },
      });

      await delay(CHECK_MESSAGE_INTERVAL_MS);

      expect(deviceClient.authorizedServiceProviders.getAll()).to.deep.equal([serviceProvider]);
    });

    it('should remove authorized service provider when authorization is revoked', async () => {
      const deviceClient = new DeviceClient(
        deviceSeed,
        'SECRET',
        initialSideKey,
        CHECK_MESSAGE_INTERVAL_MS,
      );
      const myHouseRoot = mam.getMamState().channel.next_root;
      const serviceProvider = { url: 'SP_URL' };
      const device = { iotaAddress: 'FOO' };

      deviceClient.root = myHouseRoot;
      deviceClient.authorizedServiceProviders.add(serviceProvider);

      expect(deviceClient.authorizedServiceProviders.getAll()).to.deep.equal([serviceProvider]);

      await mam.attach({
        type: 'AUTHORIZATION_REVOKED',
        policy: { serviceProvider, device },
      });

      await delay(CHECK_MESSAGE_INTERVAL_MS);

      // eslint-disable-next-line no-unused-expressions
      expect(deviceClient.authorizedServiceProviders.getAll()).to.be.empty;
    });

    it('should have changed side key when authorization is revoked', async () => {
      const deviceClient = new DeviceClient(
        deviceSeed,
        'SECRET',
        initialSideKey,
        CHECK_MESSAGE_INTERVAL_MS,
      );
      const myHouseRoot = mam.getMamState().channel.next_root;
      const serviceProvider = { url: 'SP_URL' };
      const device = { iotaAddress: 'FOO' };

      deviceClient.root = myHouseRoot;
      deviceClient.authorizedServiceProviders.add(serviceProvider);

      expect(deviceClient.mam.getMamState().channel.side_key).to.equal(initialSideKey);

      await mam.attach({
        type: 'AUTHORIZATION_REVOKED',
        policy: { serviceProvider, device },
      });

      await delay(45000); // Waiting till KEY_ROTATION MAM message is attached...

      expect(deviceClient.mam.getMamState().channel.side_key).to.not.equal(initialSideKey);
    });
  });
});
