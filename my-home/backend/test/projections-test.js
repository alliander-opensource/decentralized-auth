const { expect } = require('chai');

const { toDevices, toPolicies } = require('../src/modules/projections');

describe('Get devices', () => {
  it('should build projection of device events', () => {
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


describe('Get policies', () => {
  it('should build projection of policy events', () => {
    const messages = [
      { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
      { type: 'DUMMY' },
      { },
      { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
      { type: 'AUTHORIZATION_REVOKED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
      { type: 'AUTHORIZED', policy: { serviceProvider: 3, device: { iotaAddress: 3 } } },
    ];

    const policies = toPolicies(messages);

    expect(policies).to.deep.equal([
      { serviceProvider: 2, device: { iotaAddress: 2 } },
      { serviceProvider: 3, device: { iotaAddress: 3 } },
    ]);
  });

  it('should clear policies related to a device when a device is deleted', () => {
    const messages = [
      { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
      { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 1 } } },
      { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
      { type: 'DEVICE_DELETED', device: { iotaAddress: 1 } },
    ];

    const policies = toPolicies(messages);

    expect(policies).to.deep.equal([{ serviceProvider: 2, device: { iotaAddress: 2 } }]);
  });

  it('should clear policies related to a device when a device is added', () => {
    const messages = [
      { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
      { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 1 } } },
      { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
      { type: 'DEVICE_ADDED', device: { iotaAddress: 1 } },
    ];

    const policies = toPolicies(messages);

    expect(policies).to.deep.equal([{ serviceProvider: 2, device: { iotaAddress: 2 } }]);
  });
});
