const diva = require('diva-irma-js');
const mamDataSender = require('./mam_data_sender');
const logger = require('../../logger')(module);

const Policy = require('../../database/models/Policy');
const { toMessage } = require('./policy');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  // TODO: check if device belongs to owner

  const { sessionId } = req;
  const { transactionHash, device, serviceProvider, goal } = req.body;
  const policy = {
    actorName: serviceProvider.iotaAddress,
    action: 'read',
    actee: `${device.type} P1 energy data`,
    goal,
    conditions: [],
  };

  // TODO: do not send or retrieve this information to the front end (get device
  //       from database backend)
  const mamData = { root: device.mamRoot, sideKey: device.mamSideKey };

  diva
    .getAttributes(sessionId)
    .then(attributes => ({
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    }))
    .then(owner =>
      Policy.query().insert({
        id: transactionHash,
        deviceId: device.id,
        policy,
        message: toMessage(policy),
        serviceProvider,
        owner,
      })
        .then(dbResult => (
          res
            .status(201)
            .send({
              success: true,
              message: 'Created',
              id: dbResult.id,
              ...policy,
              serviceProvider,
            })
        ))
        .then(() => mamDataSender.sendMamData(serviceProvider.iotaAddress, mamData))
        .catch((err) => {
          logger.error(err);
          return res
            .status(500)
            .send({
              success: false,
              message: err,
            });
        }))
    .catch((err) => {
      logger.error(`get IRMA attributes: ${err}`);
      return res
        .status(500)
        .send({
          success: false,
          message: 'error_get_irma_attributes',
        });
    });
};
