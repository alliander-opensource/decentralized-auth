const config = require('./../config');
const IOTA = require('iota.lib.js');

const iota = new IOTA({
  provider: config.iotaProvider,
});

function getAddress(seed, amount) {
  return new Promise((resolve, reject) =>
    iota.api.getNewAddress(
      seed,
      { index: 0, total: amount, security: 3 },
      (err, res) => (err ? reject(err) : resolve(res)),
    ));
}


const { toTrytes } = iota.utils;


function fromTrytes(trytes) {
  const isOdd = n => (n % 2) === 1;

  // Work around odd length trytes that cannot be converted by appending a 9
  if (isOdd(trytes.length)) {
    return iota.utils.fromTrytes(`${trytes}9`);
  }

  return iota.utils.fromTrytes(trytes);
}


module.exports = {
  iota,
  getAddress,
  toTrytes,
  fromTrytes,
};
