const DeviceClient = require('../src/device-client');
const { expect } = require('chai');

describe('DeviceClient', () => {
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
});
