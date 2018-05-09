# Service provider

Example of service provider that retrieves P1 energy data from a Raspberry Pi. The owner of the Pi has given consent to this service provider in My Home. My Home then provided the service provider with the side key and root of the restricted MAM channel where the device is publishing its energy data to. These initial MAM data is received via an MAM_DATA message on the service provider's IOTA address. The data is encrypted with the public key of the service provider, so that although IOTA messages are public, only the service provider can decrypt it. Since an MAM message contains the next root for further messages it can keep retrieving future data after the initial key exchange. Sometimes a message of type 'KEY_ROTATION' is received on the MAM stream. This means one of the service providers that has access to the stream had its access revoked and a new side key will be used on the restricted MAM channel. This KEY_ROTATION message contains the new side key encrypted with the public key of authorized service providers (they can see if they are still authorized by decrypting with their own key).

This is mostly plain JavaScript. The code stores its state in a cookie (its own address) and input fields (the device's received root and side key).

For creating and storing a key pair, receiving our public key, and encrypting and decrypting the MAM data the backend is used.

## Installation locally

Retrieve the mam.client.js:

```
npm install
```

mam.web.js expect iota-bindings-emscripten.wasm to be in root directory so move the file there:

```
sudo cp node_modules/mam.client.js/lib/iota-bindings-emscripten.wasm /
```

Open index.html

## Installation on VPS

Get the code on your server:

```
git init
git remote add origin git@github.com:Alliander/decentralized-auth.git
git fetch
git checkout origin/master -- service-provider
```

Install Node and npm:

```
sudo apt-get install nodejs npm
```

Get the JavaScript dependencies:

```
npm install
```

Move wasm file to root of site (mam.web.js expects it to be there):

```
cp node_modules/mam.client.js/lib/iota-bindings-emscripten.wasm .
```

## Features

- Request consent at My Home to receive data
- Listener that checks if a new authorization policy is available
  * Being authorized means knowing the root and side key of the Raspberry Pi's MAM stream
- Graph Raspberry Pi's data that is made available via MAM periodically
- Handle revocation of consent

### Request consent at My Home to receive data

### Listener that checks if a new authorization policy is available

### Graph Raspberry Pi's data that is made available via MAM periodically

### Handle revocation of consent
