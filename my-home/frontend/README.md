# My Home frontend

My home frontend.

Based on [diva-js-reference-3p-frontend](https://github.com/Alliander/diva-js-reference-3p-frontend).

## IRMA / DIVA

This repository contains an example/reference frontend implementation to show a nice GUI for [diva-js-reference-3p-backend](https://github.com/Alliander/diva-js-reference-3p-backend)
that uses the DIVA SDK [diva-irma-js](https://github.com/Alliander/diva-irma-js) to easily integrate [IRMA attributes](https://privacybydesign.foundation/irma-verifier/) into NodeJS based applications.

IRMA is a decentralized, attribute based Identity Management protocol that allows easy and fine-grained authentication (and based on specific attributes) authorization. Attributes are issued by trusted issuers and therefore provide easy validation of users.

## Features

This frontend in particular demonstrates
- How to pair with a device via IOTA
- How to provide consent to access data of that device

- How attribute based authentication can be integrated into a frontend application.
- How attribute based authorization can be integrated into a frontend application.
- How frontends may use and display authentication/authorization status to their users.

# DIVA middleware components

Any container component can be wrapped with the `WithSimpleDivaAuthorization` component to control identity requirements.
For example to require the `pbdf.pbdf.email.email` attribute,

```
<Route path="/my-account”
	component={ MyAccount }/>
```

becomes

```
<Route path="/my-account”
	component={ WithSimpleDivaAuthorization('pbdf.pbdf.email.email')(MyAccount) }/>
```

Note: for more complex scenarios see the `WithDivaAuthorization` higher order component.

## Running the application

- Checkout the code
- `npm install`
- `npm start`

Note: for development, use `npm run dev` to run the application in development mode with hot reloading.

## Tests

[Cypress.io](https://cypress.io) is used to perform frontend tests.
To run the tests:

- make sure the frontend is running
- `npm run test`

Note: during tests, the backend is mocked.

## IRMA

For more information about IRMA, see: https://privacybydesign.foundation/irma/

The IRMA client apps can be downloaded from their respective app stores:

- [Apple App Store](https://itunes.apple.com/nl/app/irma-authentication/id1294092994?mt=8)
- [Google Play Store](https://play.google.com/store/apps/details?id=org.irmacard.cardemu)

Other components in the IRMA ecosystem include:

- [IRMA Android app](https://github.com/credentials/irma_android_cardemu)
- [IRMA iOS app](https://github.com/credentials/irma_mobile)
- [IRMA API server](https://github.com/credentials/irma_api_server)
