# My Home backend

My Home backend that can be used for claiming an IOT-device and storing policies related to its data distribution.

Based on [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend).

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
