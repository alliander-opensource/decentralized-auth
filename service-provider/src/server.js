const express = require('express');
const cors = require('cors');
const logger = require('./logger')(module);
const bodyParser = require('body-parser');
const config = require('./config');
const serveStatic = require('serve-static');

const app = express();
app.use(cors({ origin: /.*wattt.nl$/, credentials: true }));
app.use(bodyParser.text());
app.use(bodyParser.json());


// NTRU endpoints
app.get('/api/init/:sessionId', require('./actions/init'));
app.get('/api/get-address/:sessionId', require('./actions/get-address'));
app.get('/api/get-public-key/:sessionId', require('./actions/get-public-key'));
app.get('/api/decrypt/:sessionId', require('./actions/decrypt'));


const server = app.listen(config.port, () => {
  logger.info(`Service Provider Party backend listening on port ${config.port} !`);
});

app.use(serveStatic('./frontend/', { index: ['index.html', 'index.htm'] }));

module.exports = { app, server };
