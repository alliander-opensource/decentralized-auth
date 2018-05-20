# My Home backend

My Home backend that can be used for claiming an IOT-device and storing policies related to its data distribution.

Based on [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend).

## IRMA / DIVA

This repository contains an example/reference backend implementation that uses the DIVA SDK [diva-irma-js](https://github.com/Alliander/diva-irma-js) to easily integrate [IRMA attributes](https://privacybydesign.foundation/irma-verifier/) into NodeJS based applications.

For a compatible frontend example see [diva-js-reference-3p-frontend](https://github.com/Alliander/diva-js-reference-3p-frontend).

IRMA is a decentralized, attribute based Identity Management protocol that allows easy and fine-grained authentication (and based on specific attributes) authorization. Attributes are issued by trusted issuers and therefore provide easy validation of users.

## Features

This backend in particular demonstrates
- How to pair with a device via IOTA
- How to provide consent to access data of that device

- How attribute based authentication can be integrated into a backend application using [diva-irma-js](https://github.com/Alliander/diva-irma-js).
- How attribute based authorization can be integrated into a backend application using [diva-irma-js](https://github.com/Alliander/diva-irma-js).
- How to integrate DIVA session management with express application session management.

# DIVA middleware components

DIVA supplies express middleware to control identity requirements for API endpoints.
For example to require the `pbdf.pbdf.idin.address` and `pbdf.pbdf.idin.city` attributes,

```
app.use('/api/images/address.jpg', require('./actions/get-address-map'));
```

becomes

```
app.use('/api/images/address.jpg', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./actions/get-address-map'));
```

Note: for simple use cases there is also the `diva.requireAttribute()` middleware method.

## Running the application

- Checkout the code
- `npm install` (or `npm install --python=python2.6` when a gyp error appears)
- `npm start`

Note: for development, use `npm run dev` to run the application in development mode with hot reloading.

## IOTA setup

Either run local node on port 14700 by following the steps in [running your own IOTA testnet not connected to the public testnet or mainnet](https://github.com/schierlm/private-iota-testnet). Then run the testnet on port 14700:

```
java -jar target/iri-1.4.2.1.jar --testnet -p 14700
```

or set the IOTA_PROVIDER environment variable to a public testnet or mainnet node.

Generate a seed:

```
cat /dev/urandom | LC_ALL=C tr -dc 'A-Z9' | fold -w 81 | head -n 1
```

and add it to the config.seed configuration variable.

```
export SEED=<seed>
```

## Tests

Run IOTA integration tests with `npm run test:iota`. It will start the `raspberry-pi-client` in the test.

Run end-to-end tests with `npm run integration-test`.

Run all tests with `npm run test`.

## IRMA

For more information about IRMA, see: https://privacybydesign.foundation/irma/

The IRMA client apps can be downloaded from their respective app stores:

- [Apple App Store](https://itunes.apple.com/nl/app/irma-authentication/id1294092994?mt=8)
- [Google Play Store](https://play.google.com/store/apps/details?id=org.irmacard.cardemu)

Other components in the IRMA ecosystem include:

- [IRMA Android app](https://github.com/credentials/irma_android_cardemu)
- [IRMA iOS app](https://github.com/credentials/irma_mobile)
- [IRMA API server](https://github.com/credentials/irma_api_server)
