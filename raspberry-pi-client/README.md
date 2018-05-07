# Raspberry Pi Client

Demo for GDPR proof IOTA MAM for the Raspberry Pi. This client reads P1 data and sends it via IOTA MAM to authorized service providers.

## Requirements

- Raspberry Pi with internet connection
- Connected via a P1 cable (RJ11 to USB) to a Dutch smart meter

## Features

This client in demonstrates:
- How a device can be paired with your 'digital house' called my home via IOTA
- How the Pi can send P1 data via IOTA MAM
- How service providers can be authorized to access data
- How access can be revoked

### Pairing a device

### Send data via IOTA MAM

### Authorize access

### Revoke access

## Tests

```
npm run test
```

## Production

Get the raspberry-pi-client on your Pi:

```
ssh pi@<pi's IP>
git init
git remote add origin git@github.com:Alliander/decentralized-auth.git
git fetch
git checkout origin/master -- raspberry-pi-client
```

Install dependencies on Pi:

```
cd raspberry-pi-client
npm i
```

Generate a seed with `cat /dev/urandom | LC_ALL=C tr -dc 'A-Z9' | fold -w 81 | head -n 1` and add it into the SEED environment variable:

```
export SEED=<seed>
```

Start the client with `npm start`, e.g.:

## Running the application locally

- Checkout the code
- `npm install`
- `npm start`

Or run with specific seed:

- SEED=HWMLSSBKJOTBKVQTJE9OWPPMPZJTDUDIHMMUFIBQJCDJDPRNLAAG99J9UXZIKSQJDTUWFPSXJIZEJMTXV npm start
