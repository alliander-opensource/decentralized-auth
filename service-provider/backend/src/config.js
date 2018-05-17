const config = {
  port: process.env.PORT ? process.env.PORT : 4000,
  iotaSeeds: {}, // mapping from sessionId to iota seed
  ntruKeyPairs: {}, // mapping from sessionId to NTRU key pair
  cookieSecret: process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : 'StRoNGs3crE7',
  cookieName: 'wattt-session',
  cookieSettings: {
    httpOnly: true,
    maxAge: 30000000,
    sameSite: true,
    signed: true,
    secure: false, // TODO: NOTE: must be set to true and be used with HTTPS only!
  },
  baseUrl: process.env.SP_BASE_URL ? process.env.SP_BASE_URL : 'http://localhost:5000',
  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
};

module.exports = config;
