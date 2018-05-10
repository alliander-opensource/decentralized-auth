const express = require('express');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const diva = require('diva-irma-js');
const simpleSession = require('./modules/simple-session');
const config = require('./config');
const ntru = require('./modules/ntru');

const initializeDatabase = require('./database/initialize-database');

initializeDatabase(); // Required for policy saving

diva.init({
  baseUrl: config.baseUrl,
  apiKey: config.apiKey,
  irmaApiServerUrl: config.irmaApiServerUrl,
  irmaApiServerPublicKey: config.irmaApiServerPublicKey,
  useRedis: config.useRedis,
});


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

// DIVA disclore endpoints
app.get('/api/start-disclosure-session', require('./actions/start-simple-disclosure-session'));
app.post('/api/start-disclosure-session', require('./actions/start-disclosure-session'));
app.post('/api/start-irma-session', require('./actions/start-irma-session'));
app.get('/api/disclosure-status', require('./actions/disclosure-status'));

// DIVA signature endpoints
app.get('/api/signature-status', require('./actions/signature-status'));

// Device endpoints
app.post('/api/device/new', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./modules/device/add-device'));
app.get('/api/device/all', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./modules/device/get-all-devices'));
app.delete('/api/device/:id', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./modules/device/delete-device'));

// Policy endpoints
app.post('/api/policy/new', require('./modules/policy/add-policy'));
app.get('/api/policy/all', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./modules/policy/get-all-policies'));
app.delete('/api/policy/:id', diva.requireAttributes(['pbdf.pbdf.idin.address', 'pbdf.pbdf.idin.city']), require('./modules/policy/revoke-policy'));
app.get('/api/policy/by-sp', require('./modules/policy/get-all-policies-by-sp'));
app.post('/api/policy/get-message-for-policy', require('./modules/policy/get-message-for-policy'));

const server = app.listen(config.port, () => {
  logger.info(`Diva Reference Third Party backend listening on port ${config.port} !`);
  logger.info(`Diva version ${diva.version()}`);
});

module.exports = { app, server };
