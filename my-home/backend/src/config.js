const config = {
  // Server
  port: process.env.PORT ? process.env.PORT : 4000,

  frontendDir: process.env.FRONTEND_DIR ? process.env.FRONTEND_DIR : '../frontend/build',

  // Session cookie
  cookieSecret: process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : 'StRoNGs3crE7',
  cookieName: process.env.COOKIE_NAME ? process.env.COOKIE_NAME : 'my-iota-home-session',
  cookieSettings: {
    httpOnly: true,
    maxAge: 30000000000, // almost a year
    sameSite: false,
    signed: true,
    secure: false, // TODO: NOTE: must be set to true and be used with HTTPS only!
  },

  // IOTA
  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
  iotaMinWeightMagnitude: process.env.IOTA_MIN_WEIGHT_MAGNITUDE
    ? process.env.IOTA_MIN_WEIGHT_MAGNITUDE
    : 14, // 10 for testnet
  iotaDepth: 5,
  iotaSecurityLevel: 2,
};

module.exports = config;
