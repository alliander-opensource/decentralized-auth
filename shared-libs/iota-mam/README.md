# @decentralized-auth/iota

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/alliander/decentralized-auth/master/decentralized-auth/shared-libs/iota/LICENSE)

Wrapper class for the IOTA client that provides some convenience methods for use in the decentralized-auth project.

## Usage

```
const generateSeed = require('@decentralized-auth/gen-seed');
const IotaClient = require('@decentralized-auth/iota');
const MamClient = require('@decentralized-auth/iota-mam');

// Instantiate a logger that has an info and error method
const consoleLogger = new (function () {
  this.info = console.log;
  this.error = console.log;
})();

const iota = new IotaClient({
  provider: 'http://node01.testnet.iotatoken.nl:16265',
  securityLevel: 2,
  depth: 5,
  minWeightMagnitude: 10,
}, consoleLogger);

const seed = await generateSeed();
const mode = 'restricted';
const sideKey = 'BANANA';
const mam = new MamClient(seed, iotaClient, mode, sideKey);

const message = 'HELLO';
const root = await mam.attach(message);

const res = await mam.fetch(root, 'restricted', sideKey);
console.log(res.messages[0]) // => 'HELLO'
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

<a name="module_iota-mam"></a>

## iota-mam
Wrapper for the IOTA MAM client that provides some convenience methods.


* [iota-mam](#module_iota-mam)
    * [~MamClient](#module_iota-mam..MamClient)
        * [`new MamClient(seed, iotaClient, mamMode, sideKey)`](#new_module_iota-mam..MamClient_new)
    * [`~init(iota, seed, mode, sideKey)`](#module_iota-mam..init) ⇒ <code>Object</code>
    * [`~changeSideKey(sideKey)`](#module_iota-mam..changeSideKey) ⇒ <code>undefined</code>
    * [`~attach(packet)`](#module_iota-mam..attach) ⇒ <code>Promise</code>
    * [`~fetch(root, mode, sideKey)`](#module_iota-mam..fetch) ⇒ <code>Promise</code>
    * [`~fetch(root, mode, sideKey)`](#module_iota-mam..fetch) ⇒ <code>Promise</code>


* * *

<a name="module_iota-mam..MamClient"></a>

### iota-mam~MamClient
**Kind**: inner class of [<code>iota-mam</code>](#module_iota-mam)  

* * *

<a name="new_module_iota-mam..MamClient_new"></a>

#### `new MamClient(seed, iotaClient, mamMode, sideKey)`
Constructor for a MamClient.


| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | IOTA seed of the device client |
| iotaClient | <code>object</code> | Instantiated @decentralized-auth/iota-client with logger |
| mamMode | <code>string</code> | MAM mode, either 'public' or 'private' or 'restricted' |
| sideKey | <code>string</code> | Optional side key (when mode is 'restricted') |


* * *

<a name="module_iota-mam..init"></a>

### `iota-mam~init(iota, seed, mode, sideKey)` ⇒ <code>Object</code>
Initialize MAM (mode private or mode restricted if sideKey is provided).

**Kind**: inner method of [<code>iota-mam</code>](#module_iota-mam)  
**Returns**: <code>Object</code> - MAM state  

| Param | Type | Description |
| --- | --- | --- |
| iota | <code>Object</code> | Instance of iota.lib.js |
| seed | <code>string</code> | Seed to initialize MAM with |
| mode | <code>string</code> | Mode to initialize MAM with ('public', 'private' or restricted') |
| sideKey | <code>string</code> | Optional side key to initialize MAM with (restricted) |


* * *

<a name="module_iota-mam..changeSideKey"></a>

### `iota-mam~changeSideKey(sideKey)` ⇒ <code>undefined</code>
Sets or changes the MAM side key.

**Kind**: inner method of [<code>iota-mam</code>](#module_iota-mam)  

| Param | Type | Description |
| --- | --- | --- |
| sideKey | <code>string</code> | Side key |


* * *

<a name="module_iota-mam..attach"></a>

### `iota-mam~attach(packet)` ⇒ <code>Promise</code>
Attach MAM messages.

**Kind**: inner method of [<code>iota-mam</code>](#module_iota-mam)  
**Returns**: <code>Promise</code> - Containing the root  

| Param | Type | Description |
| --- | --- | --- |
| packet | <code>JSON</code> | JSON packet to attach. |


* * *

<a name="module_iota-mam..fetch"></a>

### `iota-mam~fetch(root, mode, sideKey)` ⇒ <code>Promise</code>
Fetch MAM messages.
NOTE: Expects JSON messages only.

**Kind**: inner method of [<code>iota-mam</code>](#module_iota-mam)  
**Returns**: <code>Promise</code> - Contains the root and the messages  

| Param | Type | Description |
| --- | --- | --- |
| root | <code>string</code> | Root from where to fetch |
| mode | <code>string</code> | Either 'public', 'private' or 'restricted' |
| sideKey | <code>string</code> | Optional side key |


* * *

<a name="module_iota-mam..fetch"></a>

### `iota-mam~fetch(root, mode, sideKey)` ⇒ <code>Promise</code>
Fetch a single MAM message.
NOTE: Expects JSON MAM message only.

**Kind**: inner method of [<code>iota-mam</code>](#module_iota-mam)  
**Returns**: <code>Promise</code> - Contains the root and the parsed message or null  

| Param | Type | Description |
| --- | --- | --- |
| root | <code>string</code> | Root from where to fetch |
| mode | <code>string</code> | Either 'public' or 'private' or 'restricted' |
| sideKey | <code>string</code> | Optional side key (when mode is 'restricted') |


* * *

