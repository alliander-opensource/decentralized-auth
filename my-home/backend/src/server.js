const express = require('express');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const simpleSession = require('./modules/simple-session');
const config = require('./config');
const ntru = require('./modules/ntru');

const initializeDatabase = require('./database/initialize-database');

initializeDatabase(); // Required for policy saving

// Create key pair here to avoid circular dependency with config
config.ntruKeyPair = ntru.createKeyPair(config.iotaSeed);

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
app.delete('/api/device/:id', require('./modules/device/delete-device'));

// Policy endpoints
app.post('/api/policy/new', require('./modules/policy/add-policy'));
app.get('/api/policy/all', require('./modules/policy/get-all-policies'));
app.delete('/api/policy/:id', require('./modules/policy/revoke-policy'));
app.get('/api/policy/by-sp', require('./modules/policy/get-all-policies-by-sp'));
app.post('/api/policy/get-message-for-policy', require('./modules/policy/get-message-for-policy'));

const server = app.listen(config.port, () => {
  logger.info(`My Home backend listening on port ${config.port} !`);
});

module.exports = { app, server };
