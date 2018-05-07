const Converter = require('./converter');
const Kerl = require('./kerl');


/**
 * Signs a salt (challenge) with a secret using Kerl
 *
 * Based on https://github.com/iotaledger/kerl/blob/master/javascript/test/kerl.absorb-squeeze.js
 *
 * @function sign
 * @param {string} salt Salt to sign
 * @param {string} secret Key to sign with
 * @returns {string} Signed salt
 */
function sign(salt, secret) {
  const trits = Converter.trits(`${salt}${secret}`);
  const kerl = new Kerl();
  kerl.initialize();
  kerl.absorb(trits, 0, trits.length);
  const hashTrits = [];
  kerl.squeeze(hashTrits, 0, kerl.HASH_LENGTH);
  const hash = Converter.trytes(hashTrits);

  return hash;
}


module.exports.sign = sign;
