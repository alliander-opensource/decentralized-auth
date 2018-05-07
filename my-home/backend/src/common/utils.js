const util = require('util');
const logger = require('../logger')(module);

/**
 * Merges two associative arrays
 *
 * @function merge
 * @param {Object} map1 Associative array or null
 * @param {Object} map2 Associative array or null
 * @returns {Object} Merged associate array
 */
function merge(map1, map2) {
  return Object.assign({}, map1, map2);
}


/**
 * Pretty prints all data in object
 *
 * @function pprint
 * @param {Object} data Data to be printed
 * @returns {undefined}
 */
function pprint(data) {
  logger.info(util.inspect(data));
}

module.exports = {
  merge,
  pprint,
};
