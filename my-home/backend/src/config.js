const iotaSeed = process.env.SEED ? process.env.SEED : 'EDIKGHUPRVZQBWYPSEXHALLOTFYYDJMJGGKEUZJJSB9NKDVJNQIFHTIQSNHPXWNNPFIEXQGDXXDUPGEAB';

const config = {
  port: process.env.PORT ? process.env.PORT : 4000,
  cookieSecret: process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : 'StRoNGs3crE7',
  cookieName: process.env.COOKIE_NAME ? process.env.COOKIE_NAME : 'diva-session',
  cookieSettings: {
    httpOnly: true,
    maxAge: 300000,
    sameSite: true,
    signed: true,
    secure: false, // TODO: NOTE: must be set to true and be used with HTTPS only!
  },
  baseUrl: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:4000',

  // Smart meter related
  smartMeterVersion: 2.2, // DSRM 2.2, 4.0, 4.2, or 5.0
  p1SerialPort: process.env.P1_SERIAL_PORT ? process.env.P1_SERIAL_PORT : '/dev/ttyUSB0',

  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
  iotaMinWeightMagnitude: 10, // 14 for mainnet
  iotaDepth: 5,
  iotaSecurityLevel: 2,
  iotaSeed,

  apiKey: process.env.IRMA_API_SERVER_KEY ? process.env.IRMA_API_SERVER_KEY : 'FILL_IN',
  irmaApiServerUrl: process.env.IRMA_API_SERVER_URL ? process.env.IRMA_API_SERVER_URL : 'http://localhost:8081/irma_api_server',
  irmaApiServerPublicKey: process.env.IRMA_API_SERVER_PUBLIC_KEY ? process.env.IRMA_API_SERVER_PUBLIC_KEY : 'FILL_IN',

  bingMapsApiKey: process.env.BING_MAPS_API_KEY ? process.env.BING_MAPS_API_KEY : '',
};

module.exports = config;
