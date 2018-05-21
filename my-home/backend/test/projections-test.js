const { expect } = require('../src/common/test-utils');

const { toDevices } = require('../src/modules/device/projections');

describe('Get all devices', () => {
  it('should build projection of device events', () => {
    const mamMessages = {
      messages: [
        { type: 'DEVICE_ADDED', device: 1 },
        { type: 'DUMMY' },
        { },
        { type: 'DEVICE_ADDED', device: 2 },
        { type: 'DEVICE_DELETED', device: 1 },
        { type: 'DEVICE_ADDED', device: 3 },
      ],
    };

    const devices = toDevices(mamMessages);

    expect(devices).to.deep.equal([2, 3]);
  });
});
