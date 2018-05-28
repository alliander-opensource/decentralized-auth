const { exec } = require('child_process');
const generate = require('iota-generate-seed');


/**
 * Generates a seed by using an underlying random number generator.
 * NOTE: Windows, FreeBSD and SunOS uses a seed generated using crypto.randomBytes().
 *       This does not generate a secure seed.
 * @function generateSeed
 * @returns {Promise} A securely generated seed, unless we are on Windows,
 *                    FreeBSD or SunOS
 */
module.exports = function generateSeed() {
  return new Promise((resolve, reject) => {
    let seedCommand;
    const { platform } = process;
    switch (platform) {
      case 'darwin': {
        seedCommand = 'cat /dev/urandom | LC_ALL=C tr -dc "A-Z9" | fold -w 81 | head -n 1';
        break;
      }
      case 'linux': {
        // eslint-disable-next-line no-template-curly-in-string
        seedCommand = 'cat /dev/urandom | tr -dc A-Z9 | head -c${1:-81}';
        break;
      }
      case 'freebsd':
      case 'sunos':
      case 'win32': {
        const seed = generate();
        resolve(seed);
        return;
      }
      default:
        throw new Error(`Unknown process.platform: ${platform}`);
    }

    exec(seedCommand, (err, out) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(out.trim());
    });
  });
};
