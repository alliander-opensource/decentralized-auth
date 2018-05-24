const config = {
  port: process.env.SP_PORT ? process.env.SP_PORT : 5000,
  cookieSecret: process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : 'StRoNGs3crE7',
  cookieName: 'wattt-session',
  cookieSettings: {
    httpOnly: true,
    maxAge: 30000000000, // almost a year
    signed: true,
    secure: false, // TODO: NOTE: must be set to true and be used with HTTPS only!
  },
  baseUrl: process.env.SP_BASE_URL ? process.env.SP_BASE_URL : 'http://localhost:5000',
  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
};

module.exports = config;
