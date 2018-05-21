const { expect } = require('../src/common/test-utils');

const { toDevices, toPolicies } = require('../src/modules/device/projections');

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


describe('Get all policies', () => {
  it('should build projection of policy events', () => {
    const mamMessages = {
      messages: [
        { type: 'AUTHORIZE', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'DUMMY' },
        { },
        { type: 'AUTHORIZE', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
        { type: 'REVOKE_AUTHORIZATION', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZE', policy: { serviceProvider: 3, device: { iotaAddress: 3 } } },
        { type: 'DEVICE_DELETED', device: { iotaAddress: 3 } },
      ],
    };

    const policies = toPolicies(mamMessages);

    expect(policies).to.deep.equal([{ serviceProvider: 2, device: { iotaAddress: 2 } }]);
  });
});
