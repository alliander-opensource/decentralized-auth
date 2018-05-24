const express = require('express');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const serveStatic = require('serve-static');
const simpleSession = require('./modules/simple-session');
const config = require('./config');

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
app.post('/api/policy', require('./modules/policy/revoke-policy')); // TODO

// Events
app.get('/api/event/all', require('./modules/get-all-events'));

const server = app.listen(config.port, () => {
  logger.info(`My Home backend listening on port ${config.port} !`);
});

app.use(serveStatic('../frontend/build', { index: ['index.html'] }));

module.exports = { app, server };
