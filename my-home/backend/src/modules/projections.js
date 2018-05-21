const DEVICE_ADDED_TYPE = 'DEVICE_ADDED';
const DEVICE_DELETED_TYPE = 'DEVICE_DELETED';

/**
 * Builds a projection of available devices from the MAM stream.
 * @function toDevices
 * @param {array} mamMessages Raw messages from the MAM stream
 * @returns {array} Array of devices (device is object with iotaAddress and
 *                  type)
 */
function toDevices(mamMessages) {
  const { messages } = mamMessages;
  const devicesSet = messages.reduce((devices, { type, device }) => {
    // Turn the device into JSON for equality operator to work...
    switch (type) {
      case DEVICE_ADDED_TYPE:
        return devices.add(JSON.stringify(device));
      case DEVICE_DELETED_TYPE: {
        devices.delete(JSON.stringify(device)); // returns true or false
        return devices;
      }
      default:
        return devices;
    }
  }, new Set());
  const devices = Array.from(devicesSet).map(JSON.parse);
  return devices;
}

const AUTHORIZE_TYPE = 'AUTHORIZE';
const REVOKE_AUTHORIZATION_TYPE = 'REVOKE_AUTHORIZATION';


/*
 * @function toPolicies
 * @param {array} mamMessages Raw messages from the MAM stream
 * @returns {array} Array of policies (policy is object with device and
 *                  serviceProvider)
 */
function toPolicies(mamMessages) {
  const { messages } = mamMessages;
  const policiesSet = messages.reduce((policies, { type, policy, device }) => {
    // Turn the device into JSON for equality operator to work...
    switch (type) {
      case AUTHORIZE_TYPE:
        return policies.add(JSON.stringify(policy));
      case REVOKE_AUTHORIZATION_TYPE: {
        policies.delete(JSON.stringify(policy)); // returns true or false
        return policies;
      }
      case DEVICE_DELETED_TYPE: {
        // Remove policies associated with device
        policies.forEach((p) => {
          // Back to JS object, and then to string representation for comparison :'(
          if (JSON.stringify(JSON.parse(p).device) === JSON.stringify(device)) {
            policies.delete(p); // p is already stringified
          }
        });
        return policies;
      }
      default:
        return policies;
    }
  }, new Set());
  const policies = Array.from(policiesSet).map(JSON.parse);
  return policies;
}
module.exports = { toDevices, toPolicies };
