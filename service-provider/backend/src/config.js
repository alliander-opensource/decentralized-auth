const config = {
  port: process.env.SP_PORT ? process.env.SP_PORT : 5000,
  frontendDir: process.env.FRONTEND_DIR ? process.env.FRONTEND_DIR : '../frontend',
  cookieSecret: process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : 'StRoNGs3crE7',
  cookieName: 'wattt-session',
  cookieSettings: {
    httpOnly: true,
    maxAge: 30000000000, // almost a year
    signed: true,
    secure: false, // TODO: NOTE: must be set to true and be used with HTTPS only!
  },
  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
  iotaMinWeightMagnitude: process.env.IOTA_MIN_WEIGHT_MAGNITUDE
    ? process.env.IOTA_MIN_WEIGHT_MAGNITUDE
    : 14, // 10 for testnet
};

module.exports = config;
