# My Home backend

My Home backend that can be used for claiming an energy data reader device (see raspberry-pi-client) and retrieving policies related to the device's data distribution.

Based on [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend).

## Features
This backend in particular demonstrates:
- How to pair with a device running the [`raspberry-pi-client`](../../raspberry-pi-client) via IOTA
- How to provide consent to access data of that device
- How to show the MAM event stream (the shared event stream of devices, service providers and this backend)

For more information on the role of the My Home backend see [architecture](../../docs/architecture) and the [scenarios](../../docs/scenarios).

## Install dependencies

```
yarn
```

## Run

```
yarn start
```

With hot code reloading:

```
yarn run dev
```

## Tests

Run integration test with

```
yarn run integration-test
```

Run unit tests with

```
yarn run test:unit
```

Note that IOTA and MAM unit tests also call the IOTA network.

Run one test group using mocha grep, e.g. to run NTRU tests:

```
mocha -g NTRU
```
