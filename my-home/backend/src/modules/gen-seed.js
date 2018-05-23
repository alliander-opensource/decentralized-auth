const { exec } = require('child_process');

// Returns a promise with a securely generated seed
module.exports = function generateSeed() {
  return new Promise((resolve, reject) => {
    exec('cat /dev/urandom | LC_ALL=C tr -dc "A-Z9" | fold -w 81 | head -n 1', (err, out) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(out.trim());
    });
  });
};
