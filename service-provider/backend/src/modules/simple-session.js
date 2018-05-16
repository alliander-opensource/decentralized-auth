const uuidv4 = require('uuid/v4');
const config = require('./../config');
const ntru = require('./../modules/ntru');

function deauthenticate(req, res) {
  req.sessionId = uuidv4();
  res.cookie(config.cookieName, req.sessionId, config.cookieSettings);
}

function simpleSessionCookieParser(req, res, next) {
  if (!req.signedCookies[config.cookieName]) {
    deauthenticate(req, res);
  } else {
    req.sessionId = req.signedCookies[config.cookieName];
  }
  next();
}

module.exports = simpleSessionCookieParser;
module.exports.deauthenticate = deauthenticate;
