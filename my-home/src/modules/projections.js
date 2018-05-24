/*
 * Creates event sourced projections based on messages from a MAM stream.
 */

const _ = require('lodash');
const HashSet = require('hash-set');

const JsonSet = HashSet(JSON.stringify); // Set with JSON.stringify comparator


// Event types
const DEVICE_ADDED_TYPE = 'DEVICE_ADDED';
const DEVICE_DELETED_TYPE = 'DEVICE_DELETED';
const AUTHORIZED_TYPE = 'AUTHORIZED';
const AUTHORIZATION_REVOKED_TYPE = 'AUTHORIZATION_REVOKED';


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
    switch (type) {
      case DEVICE_ADDED_TYPE:
        return devices.add(device);
      case DEVICE_DELETED_TYPE: {
        devices.delete(device); // returns true or false
        return devices;
      }
      default:
        return devices;
    }
  }, new JsonSet());
  const devices = Array.from(devicesSet.entries());
  return devices;
}


/*
 * @function toPolicies
 * @param {array} mamMessages Raw messages from the MAM stream
 * @returns {array} Array of policies (policy is object with device and
 *                  serviceProvider)
 */
function toPolicies(mamMessages) {
  const { messages } = mamMessages;
  const policiesSet = messages.reduce((policies, { type, policy, device }) => {
    switch (type) {
      case AUTHORIZED_TYPE:
        return policies.add(policy);
      case AUTHORIZATION_REVOKED_TYPE: {
        policies.delete(policy); // returns true or false
        return policies;
      }
      case DEVICE_DELETED_TYPE: {
        // Remove policies associated with device
        policies.forEach((p) => {
          if (_.isEqual(p.device, device)) {
            policies.delete(p);
          }
        });
        return policies;
      }
      default:
        return policies;
    }
  }, new JsonSet());
  const policies = Array.from(policiesSet.entries());
  return policies;
}
module.exports = { toDevices, toPolicies };
