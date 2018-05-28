# My Home

Example of IOTA user interface for pairing with a energy data reader device and providing a service provider with consent to retrieve that data.

## Run

The backend can serve the static frontend:

```
cd frontend
npm run build
cd ../backend
npm i
npm start
```

For running the frontend and backend separately:
- Disable the serve-static line in backend/server.js.
- `cd frontend && npm run dev`
- `cd backend && npm run dev`

## Features

My Home in particular demonstrates
- How to pair with a device via IOTA
- How to provide consent to access data of that device
- How to revoke consent to access data of that device
- How to store event stream (device pairing and providing consent) on IOTA

## Running the application

- Checkout the code
- `npm install` (or `npm install --python=python2.6` when a gyp error appears)
- `cd frontend && npm build && cd ..`
- `npm start`

Note: for development, use `npm run dev` to run the application in development mode with hot reloading.

## IOTA setup

Either run local node on port 14700 by following the steps in [running your own IOTA testnet not connected to the public testnet or mainnet](https://github.com/schierlm/private-iota-testnet). Then run the testnet on port 14700:

```
java -jar target/iri-1.4.2.1.jar --testnet -p 14700
```

or set the IOTA_PROVIDER environment variable to a public testnet or mainnet node.

## Tests

Run unit tests with `npm run test:unit`. Note that it start the `raspberry-pi-client` in the test and passes messages over IOTA (so tests that use this are more integration tests than unit tests).

Run end-to-end tests with `npm run integration-test`.

Run all tests with `npm run test`.
