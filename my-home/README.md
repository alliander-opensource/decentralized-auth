# My Home backend

My Home backend that can be used for claiming an IOT-device and storing policies related to its data distribution.

Based on [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend) and [diva-js-reference-3p-frontend](https://github.com/Alliander/diva-js-reference-3p-frontend).

## Features

This backend in particular demonstrates
- How to pair with a device via IOTA
- How to provide consent to access data of that device
- How to store event stream (device pairing and providing consent) on IOTA

## Running the application

- Checkout the code
- `npm install` (or `npm install --python=python2.6` when a gyp error appears)
- `cd src/frontend && npm build && cd ../..`
- `npm start`

Note: for development, use `npm run dev` to run the application in development mode with hot reloading.

## IOTA setup

Either run local node on port 14700 by following the steps in [running your own IOTA testnet not connected to the public testnet or mainnet](https://github.com/schierlm/private-iota-testnet). Then run the testnet on port 14700:

```
java -jar target/iri-1.4.2.1.jar --testnet -p 14700
```

or set the IOTA_PROVIDER environment variable to a public testnet or mainnet node.

## Tests

Run IOTA integration tests with `npm run test:iota`. It will start the `raspberry-pi-client` in the test.

Run end-to-end tests with `npm run integration-test`.

Run all tests with `npm run test`.
