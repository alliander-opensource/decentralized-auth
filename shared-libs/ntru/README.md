# @decentralized-auth/ntru

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/alliander/decentralized-auth/master/decentralized-auth/shared-libs/ntru/LICENSE) [![npm version](https://badge.fury.io/js/%40decentralized-auth%2Fntru.svg)](https://badge.fury.io/js/%40decentralized-auth%2Fntru)

Wrapper around ntrujs NTRUEncrypt. Provides convenience methods to work with the IOTA Tangle.

- Create an NTRU key pair based on an IOTA seed.
- Convert a public key to trytes so it can be send over IOTA.
- Encrypt to trytes using tryte encoded public key.
- Decrypt trytes.

## Usage

```
const { createKeyPair, encrypt, decrypt, toTrytes } = require('@decentralized-auth/ntru');
const seed = 'MYIOTASEED';
const keyPair = createKeyPair(seed);
const plainText = Buffer.from('hello', 'utf8');
const encrypted = encrypt(plainText, toTrytes(keyPair.public));
const decrypted = decrypt(encrypted, keyPair.private).toString();
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

<a name="module_ntru"></a>

## ntru
Wrapper around ntrujs NTRUEncrypt. Provides convenience methods to work with
the IOTA Tangle.

- Create an NTRU key pair based on an IOTA seed.
- Convert a public key to trytes so it can be send over IOTA.
- Encrypt to trytes using tryte encoded public key.
- Decrypt trytes.


* [ntru](#module_ntru)
    * [`~toBytes(str)`](#module_ntru..toBytes) ⇒ <code>UintArray</code>
    * [`~createKeyPair(seed)`](#module_ntru..createKeyPair) ⇒ <code>Object</code>
    * [`~toTrytes(buffer)`](#module_ntru..toTrytes) ⇒ <code>string</code>
    * [`~toTrytes(trytes)`](#module_ntru..toTrytes) ⇒ <code>Buffer</code>
    * [`~encrypt(trytes, privateKey)`](#module_ntru..encrypt) ⇒ <code>string</code>
    * [`~encrypt(str, publicKey)`](#module_ntru..encrypt) ⇒ <code>string</code>


* * *

<a name="module_ntru..toBytes"></a>

### `ntru~toBytes(str)` ⇒ <code>UintArray</code>
Converts string to Uint8Array.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>UintArray</code> - The byte array that represents the string  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String to convert |


* * *

<a name="module_ntru..createKeyPair"></a>

### `ntru~createKeyPair(seed)` ⇒ <code>Object</code>
Creates an NTRU key pair based on a seed.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>Object</code> - Key pair with private and public keys  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | IOTA seed to generate key pair with |


* * *

<a name="module_ntru..toTrytes"></a>

### `ntru~toTrytes(buffer)` ⇒ <code>string</code>
Converts a Buffer to trytes.
First converts to base64 and then to trytes.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>string</code> - Tryte representation of buffer  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>Buffer</code> | Buffer to convert |


* * *

<a name="module_ntru..toTrytes"></a>

### `ntru~toTrytes(trytes)` ⇒ <code>Buffer</code>
Converts a buffer that was converted to trytes by [toTrytes](toTrytes)
back to a buffer.
First converts from trytes to base64 and then to Buffer.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>Buffer</code> - Original buffer  

| Param | Type | Description |
| --- | --- | --- |
| trytes | <code>string</code> | Buffer converted to trytes |


* * *

<a name="module_ntru..encrypt"></a>

### `ntru~encrypt(trytes, privateKey)` ⇒ <code>string</code>
Decrypts trytes with NTRU encoded cipher text with private key.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>string</code> - Plain text string  

| Param | Type | Description |
| --- | --- | --- |
| trytes | <code>string</code> | Trytes to decrypt |
| privateKey | <code>Buffer</code> | Private key |


* * *

<a name="module_ntru..encrypt"></a>

### `ntru~encrypt(str, publicKey)` ⇒ <code>string</code>
Encrypts string with public key.

**Kind**: inner method of [<code>ntru</code>](#module_ntru)  
**Returns**: <code>string</code> - Tryte encoded NTRU encrypted MAM data  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String to encrypt |
| publicKey | <code>string</code> | Tryte encoded public key |


* * *

