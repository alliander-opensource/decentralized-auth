const { expect } = require('chai');

const { toDevices } = require('../src/modules/device/devices');


describe('Get devices', () => {
  it('should build devices aggregate from device events', () => {
    const messages = [
      { type: 'DEVICE_ADDED', device: 1 },
      { type: 'DUMMY' },
      { },
      { type: 'DEVICE_ADDED', device: 2 },
      { type: 'DEVICE_DELETED', device: 1 },
      { type: 'DEVICE_ADDED', device: 3 },
    ];

    const devices = toDevices(messages);

    expect(devices).to.deep.equal([2, 3]);
  });
});
