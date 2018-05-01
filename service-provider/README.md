# Service provider

Example of a service provider.

## Installation

Retrieve the mam.client.js:

```
npm install
```

mam.web.js expect iota-bindings-emscripten.wasm to be in /lib directory so move the file one level lower:

```
mv node_modules/mam.client.js/lib/mam.web.js node_modules/mam.client.js/
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
