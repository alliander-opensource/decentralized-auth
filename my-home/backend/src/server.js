const express = require('express');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const simpleSession = require('./modules/simple-session');
const config = require('./config');
const mam = require('./modules/iota-mam');
const iota = require('./modules/iota');


// Our MAM channel for publishing information to for the device
// We also misuse it is a database for now (read the event stream and build the
// state)
mam.init(config.iotaSeed);

config.mamRoot = mam.getMamState().channel.next_root;
logger.info(`Set MAM root to ${config.mamRoot}`);

const setIotaAddress = async () => {
  const [address] = await iota.getAddress(config.iotaSeed, 1);
  logger.info(`Setting IOTA address to ${address}`);
  config.iotaAddress = address;
};

setIotaAddress();

const app = express();
app.use(cookieParser(config.cookieSecret));
app.use(cookieEncrypter(config.cookieSecret));
app.use(bodyParser.text()); // TODO: restrict to one endpoint
app.use(bodyParser.json()); // TODO: restrict to one endpoint
app.use(simpleSession);


// Reference implementation session management endpoints
app.get('/api/get-session', require('./actions/get-session'));
app.get('/api/deauthenticate', require('./actions/deauthenticate'));


// Device endpoints
app.post('/api/device/new', require('./modules/device/add-device'));
app.get('/api/device/all', require('./modules/device/get-all-devices'));
app.post('/api/device/delete', require('./modules/device/delete-device'));

// Policy endpoints
app.post('/api/policy/new', require('./modules/policy/add-policy'));
app.get('/api/policy/all', require('./modules/policy/get-all-policies'));
app.delete('/api/policy', require('./modules/policy/revoke-policy')); // TODO
app.post('/api/policy/get-message-for-policy', require('./modules/policy/get-message-for-policy'));

const server = app.listen(config.port, () => {
  logger.info(`My Home backend listening on port ${config.port} !`);
});

module.exports = { app, server };
