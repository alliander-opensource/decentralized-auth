// Insecure way to generate a seed or address
// SOURCE: https://www.reddit.com/r/Iota/comments/7sc62r/seed_generator_in_javascript
function generateAddressForTestingPurposes() { // eslint-disable-line no-unused-vars
  const length = 81;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  const randomValues = new Uint32Array(length);
  const result = new Array(length);

  window.crypto.getRandomValues(randomValues);

  let cursor = 0;
  for (let i = 0; i < randomValues.length; i += 1) {
    cursor += randomValues[i];
    result[i] = chars[cursor % chars.length];
  }

  return result.join('');
}
