const iota = require('../src/modules/iota');

const DeviceClient = require('../src/device-client');
const { expect, generateSeedForTestingPurposes } = require('../src/common/test-utils');

describe('Initializing a device client', () => {
  const deviceSeed = generateSeedForTestingPurposes();
  const deviceSecret = 'APPLE';
  const initialSideKey = 'BANANA';

  let deviceClient;
  let deviceAddress;

  before(() => {
    iota.getAddress(deviceSeed, 1)
      .then(([firstAddress]) => {
        deviceAddress = firstAddress;
      });
    deviceClient = new DeviceClient(
      deviceSeed,
      deviceSecret,
      initialSideKey,
    );
  });

  describe('device.init.code', () => {
    it('should have initialized MAM', () => {
      expect(deviceClient.mam).to.have.property('changeSideKey');
    });
  });

  describe('device.init', () => {
    it('should publish it\'s presence under a tag', () =>
      DeviceClient.publishPresence(deviceSeed, deviceAddress, '99999999RASPBERRYPI99999999')
        .then(transactions =>

          expect(transactions).to.be.an('array')));

    // TODO: for finding device by tag instead of remembering the address
    xit('presence should be retrievable ', () =>
      iota.getLastMessage({ tags: ['99999999RASPBERRYPI29999999'] })
        .then(msg =>

          expect(msg).to.equal('foo')));
  });
});
