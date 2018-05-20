const ntru = require('../ntru');
const mamDataSender = require('./mam_data_sender');
const logger = require('../../logger')(module);

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
  const { device, serviceProvider, goal } = req.body;
  const policy = {
    actorName: serviceProvider.iotaAddress,
    action: 'read',
    actee: `${device.type} P1 energy data`,
    goal,
    conditions: [],
  };

  // TODO: do not send or retrieve this information to the front end (get device
  //       from database backend)? or is it save since the frontend is in our
  //       house?
  const mamData = {
    root: ntru.encrypt(device.mamRoot),
    sideKey: ntru.encrypt(device.mamSideKey),
  };

  Promise.resolve() // TODO: policy stored in MAM
    .then(() => mamDataSender.sendMamData(
      serviceProvider.iotaAddress,
      mamData,
    ))
    .catch((err) => {
      logger.error(err);
      return res
        .status(500)
        .send({
          success: false,
          message: err,
        });
    });
};
