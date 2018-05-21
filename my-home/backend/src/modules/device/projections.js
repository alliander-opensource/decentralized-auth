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

module.exports = { toDevices };
