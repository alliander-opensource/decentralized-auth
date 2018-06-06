const config = {
  // Smart meter related
  smartMeterVersion: parseFloat(process.env.SMARTER_METER_VERSION)
    ? parseFloat(process.env.SMARTER_METER_VERSION)
    : 2.2, // DSRM 2.2, 4.0, 4.2, or 5.0
  p1SerialPort: process.env.P1_SERIAL_PORT ? process.env.P1_SERIAL_PORT : '/dev/ttyUSB0',

  iotaProvider: process.env.IOTA_PROVIDER ? process.env.IOTA_PROVIDER : 'http://node02.iotatoken.nl:14265',
  iotaMinWeightMagnitude: 14, // 10 for testnet
  iotaDepth: 6,
  iotaSecurityLevel: 2,

  // How often to check for MAM and IOTA message?
  checkMessageIntervalMs: 10000,

  seed: process.env.SEED ? process.env.SEED : 'TLQPEYBND9AFCHFDLCWSVQU9ISCDTBKUQSLXEEUXFHVDEEQZZJPCBPBJ9QSVFBXUJXTIFBMTQSLVUFYTH',
  secret: 'PEAR',
  initialSideKey: 'BANANA',
};

module.exports = config;
