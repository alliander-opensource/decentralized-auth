const { expect } = require('../src/common/test-utils');

const { toDevices, toPolicies } = require('../src/modules/projections');

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


describe('Get policies', () => {
  it('should build projection of policy events', () => {
    const mamMessages = {
      messages: [
        { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'DUMMY' },
        { },
        { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
        { type: 'AUTHORIZATION_REVOKED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZED', policy: { serviceProvider: 3, device: { iotaAddress: 3 } } },
      ],
    };

    const policies = toPolicies(mamMessages);

    expect(policies).to.deep.equal([
      { serviceProvider: 2, device: { iotaAddress: 2 } },
      { serviceProvider: 3, device: { iotaAddress: 3 } },
    ]);
  });

  it('should clear policies related to a device when a device is deleted', () => {
    const mamMessages = {
      messages: [
        { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
        { type: 'DEVICE_DELETED', device: { iotaAddress: 1 } },
      ],
    };

    const policies = toPolicies(mamMessages);

    expect(policies).to.deep.equal([{ serviceProvider: 2, device: { iotaAddress: 2 } }]);
  });

  it('should clear policies related to a device when a device is added', () => {
    const mamMessages = {
      messages: [
        { type: 'AUTHORIZED', policy: { serviceProvider: 1, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 1 } } },
        { type: 'AUTHORIZED', policy: { serviceProvider: 2, device: { iotaAddress: 2 } } },
        { type: 'DEVICE_ADDED', device: { iotaAddress: 1 } },
      ],
    };

    const policies = toPolicies(mamMessages);

    expect(policies).to.deep.equal([{ serviceProvider: 2, device: { iotaAddress: 2 } }]);
  });
});
