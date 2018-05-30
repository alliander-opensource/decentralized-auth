# @decentralized-auth/gen-seed

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/alliander/decentralized-auth/master/decentralized-auth/shared-libs/iota/LICENSE)

Generates an IOTA seed on Linux and macOS using the built in random number generator. For other OSes uses the insecure iota-generate-seed library.

## Usage

```
const generateSeed = require('@decentralized-auth/gen-seed');
const seed = await generateSeed();
```

## Test

```
npm run test
```

## Lint

```
npm run lint
```

# Documentation

Documentation generated from docstrings with [jsdoc2md](https://www.npmjs.com/package/jsdoc-to-markdown).

<a name="module_gen-seed"></a>

## gen-seed
Generates a seed on Linux and macOS using the built in random number
generator. For other OSes uses the insecure iota-generate-seed library.


* * *

<a name="module_gen-seed..generateSeed"></a>

### `gen-seed~generateSeed()` ⇒ <code>Promise</code>
Generates a seed by using an underlying random number generator.
NOTE: Windows, FreeBSD and SunOS uses a seed generated using crypto.randomBytes().
      This does not generate a secure seed.

**Kind**: inner method of [<code>gen-seed</code>](#module_gen-seed)  
**Returns**: <code>Promise</code> - A securely generated seed, unless we are on Windows,
                   FreeBSD or SunOS  

* * *

