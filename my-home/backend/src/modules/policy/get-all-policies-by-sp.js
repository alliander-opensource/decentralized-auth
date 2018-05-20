const basicAuth = require('basic-auth');
const logger = require('../../logger')(module);

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  Promise
    .resolve(basicAuth(req))
    .then((credentials) => { // TODO extract this to something like isAuthenticatedServiceProvider
      const validCredentials = {
        hhb: 'secret',
      };
      if (!credentials ||
          !(Object.prototype.hasOwnProperty.call(validCredentials, credentials.name) &&
              validCredentials[credentials.name] === credentials.pass)) {
        throw new Error('Unauthorized');
      }
      return credentials.name;
    })
    .then((serviceProvider) => {
      if (req.query.id) {
        return Policy.query().where('service_provider', '=', serviceProvider).andWhere('id', '=', req.query.id);
      }
      return Policy.query().where('service_provider', '=', serviceProvider);
    })
    .then(req.json)
    .catch((err) => {
      logger.error(err);
      return res.end(`Something went wrong: ${err.message}`);
    });
};
