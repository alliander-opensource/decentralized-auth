/**
 * Aggregate created from MAM event stream.
 * @module devices
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
 * Creates the policies aggregate from the MAM event stream.
 * @function toPolicies
 * @param {array} messages Messages from an MAM stream
 * @returns {array} Array of policies (policy is object with device and
 *                  serviceProvider)
 */
function toPolicies(messages) {
  const policiesSet = messages.reduce((policies, { type, policy, device }) => {
    switch (type) {
      case AUTHORIZED_TYPE:
        return policies.add(policy);
      case AUTHORIZATION_REVOKED_TYPE: {
        policies.delete(policy); // returns true or false
        return policies;
      }
      case DEVICE_ADDED_TYPE:
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


module.exports = { toPolicies };
