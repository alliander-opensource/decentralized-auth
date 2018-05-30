# @decentralized-auth/iota

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/alliander/decentralized-auth/master/decentralized-auth/shared-libs/iota/LICENSE)

Wrapper class for the IOTA client that provides some convenience methods for use in the decentralized-auth project.

## Usage

```
const IotaClient = require('@decentralized-auth/iota');

const iota = new IotaClient({
  provider: 'http://node01.testnet.iotatoken.nl:16265',
  securityLevel: 2,
  depth: 5,
  minWeightMagnitude: 10,
});
```

With logger:

```
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

<a name="module_iota"></a>

## iota
Wrapper for the IOTA client that provides some convenience methods.


* [iota](#module_iota)
    * [~IotaClient](#module_iota..IotaClient)
        * [`new IotaClient(iotaOptions, logger)`](#new_module_iota..IotaClient_new)
    * [`~send(seed, receiver, message)`](#module_iota..send) ⇒ <code>Promise</code>
    * [`~getLastMessage(searchValues)`](#module_iota..getLastMessage) ⇒ <code>JSON</code>
    * [`~getAddress(seed, amount)`](#module_iota..getAddress) ⇒ <code>Promise</code>
    * [`~toTrytes(text)`](#module_iota..toTrytes) ⇒ <code>string</code>
    * [`~fromTrytes(trytes)`](#module_iota..fromTrytes) ⇒ <code>string</code>


* * *

<a name="module_iota..IotaClient"></a>

### iota~IotaClient
**Kind**: inner class of [<code>iota</code>](#module_iota)  

* * *

<a name="new_module_iota..IotaClient_new"></a>

#### `new IotaClient(iotaOptions, logger)`
Constructor for an IotaClient.


| Param | Type | Description |
| --- | --- | --- |
| iotaOptions | <code>object</code> | with:                 - {string} provider IOTA provider (host URL)                 - {number} minWeightMagnitude Minimum weight magnitude for PoW                 - {number} securityLevel IOTA security level                 - {number} depth IOTA depth |
| logger | <code>object</code> | Should support the methods info and error |


* * *

<a name="module_iota..send"></a>

### `iota~send(seed, receiver, message)` ⇒ <code>Promise</code>
Send a message via IOTA.

**Kind**: inner method of [<code>iota</code>](#module_iota)  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | Our IOTA seed |
| receiver | <code>string</code> | IOTA address of receiver |
| message | <code>JSON</code> | to send |


* * *

<a name="module_iota..getLastMessage"></a>

### `iota~getLastMessage(searchValues)` ⇒ <code>JSON</code>
Gets last received transfer message.
NOTE: order is not necessarily chronological, but let's assume it is.

**Kind**: inner method of [<code>iota</code>](#module_iota)  
**Returns**: <code>JSON</code> - Parsed message or `null` when no received transfers  

| Param | Type | Description |
| --- | --- | --- |
| searchValues | <code>Object</code> | List of bundle hashes, addresses, tags or                              approvees (e.g., `{ hashes: ['ABCD'] }`) |


* * *

<a name="module_iota..getAddress"></a>

### `iota~getAddress(seed, amount)` ⇒ <code>Promise</code>
Gets the first addresses with security level for seed starting at index 0.

**Kind**: inner method of [<code>iota</code>](#module_iota)  
**Returns**: <code>Promise</code> - With result or reject with error  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | IOTA seed to generate an address for |
| amount | <code>string</code> | Amount of addresses to return |


* * *

<a name="module_iota..toTrytes"></a>

### `iota~toTrytes(text)` ⇒ <code>string</code>
Converts text to trytes.

**Kind**: inner method of [<code>iota</code>](#module_iota)  
**Returns**: <code>string</code> - Trytes  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to convert |


* * *

<a name="module_iota..fromTrytes"></a>

### `iota~fromTrytes(trytes)` ⇒ <code>string</code>
Converts trytes to string.
Also works with odd length trytes string.

**Kind**: inner method of [<code>iota</code>](#module_iota)  
**Returns**: <code>string</code> - Converted string  

| Param | Type | Description |
| --- | --- | --- |
| trytes | <code>string</code> | Trytes to convert |


* * *

