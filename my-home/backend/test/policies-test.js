const { expect } = require('chai');

const { toPolicies } = require('../src/modules/policy/policies');


describe('Get policies', () => {
  it('should build policies aggregate from policy events', () => {
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
