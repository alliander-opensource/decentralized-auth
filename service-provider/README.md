# Service provider

Example of a service provider.

## Installation locally

Retrieve the mam.client.js:

```
npm install
```

mam.web.js expect iota-bindings-emscripten.wasm to be in root directory so move the file there:

```
sudo cp node_modules/mam.client.js/lib/iota-bindings-emscripten.wasm /
```

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
