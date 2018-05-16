const express = require('express');
const cors = require('cors');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const simpleSession = require('./modules/simple-session');
const config = require('./config');
const ntru = require('./modules/ntru');

config.ntruKeyPair = ntru.createKeyPair(config.iotaSeed);

const app = express();
app.use(cors({ origin: /.*wattt.nl$/, credentials: true }));
app.use(cookieParser(config.cookieSecret));
app.use(cookieEncrypter(config.cookieSecret));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(simpleSession);


// Reference implementation session management endpoints
app.get('/api/deauthenticate', require('./actions/deauthenticate'));

// NTRU endpoints
app.get('/api/init', require('./actions/init'));
app.get('/api/get-address', require('./actions/get-address'));
app.get('/api/get-public-key', require('./actions/get-public-key'));
app.get('/api/decrypt', require('./actions/decrypt'));


const server = app.listen(config.port, () => {
  logger.info(`Service Provider Party backend listening on port ${config.port} !`);
});

module.exports = { app, server };
