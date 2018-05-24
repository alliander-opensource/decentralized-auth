# My Home backend

My Home backend that can be used for claiming an energy data reader device (see raspberry-pi-client) and retrieving policies related to the device's data distribution.

Based on [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend).

## Install dependencies

```
npm install
```

## Run

```
npm start
```

With hot code reloading:

```
npm run dev
```

## Tests

Run integration test with

```
npm run integration-test
```

Run unit tests with

```
npm run test:unit
```

Note that IOTA and MAM unit tests also call the IOTA network.

Run one test group using mocha grep, e.g. to run NTRU tests:

```
mocha -g NTRU
```
