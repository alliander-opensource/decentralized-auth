const config = {
  // Server
  port: process.env.PORT ? process.env.PORT : 4000,

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

  // Smart meter related
  smartMeterVersion: 2.2, // DSRM 2.2, 4.0, 4.2, or 5.0
  p1SerialPort: process.env.P1_SERIAL_PORT ? process.env.P1_SERIAL_PORT : '/dev/ttyUSB0',

  // IOTA
  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://localhost:14700',
  iotaMinWeightMagnitude: 10, // 14 for mainnet
  iotaDepth: 5,
  iotaSecurityLevel: 2,
};

module.exports = config;
