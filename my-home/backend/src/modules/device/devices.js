/**
 * Aggregate created from MAM event stream.
 * @module devices
 */


const HashSet = require('hash-set');

const JsonSet = HashSet(JSON.stringify); // Set with JSON.stringify comparator


// Event types
const DEVICE_ADDED_TYPE = 'DEVICE_ADDED';
const DEVICE_DELETED_TYPE = 'DEVICE_DELETED';


/**
 * Creates the devices aggregate from the MAM event stream.
 * @function toDevices
 * @param {array} messages JSON messages from an MAM event stream
 * @returns {array} Array of devices (device is object with address and type)
 */
function toDevices(messages) {
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


module.exports = { toDevices };
