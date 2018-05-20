const logger = require('../../logger')(module);
const mamDataSender = require('./mam_data_sender');

/**
 * Request handler for revoking a policy
 * - Remove the policy from the database
 * - Informs device that it needs to update its side key and communicate it to
     remaining authorized service providers
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  if (!req.params.id) {
    throw new Error('No policyId specified.');
  }

  try {
    const policyId = req.params.id;

    // TODO: do something smart with reading the stream

    return res.status(200)
      .send({
        success: true,
        message: 'Deleted',
        id: policyId,
      });
  } catch (err) {
    logger.error(`revoke-policy: ${err}`);
    return res
      .status(400)
      .send({
        success: false,
        message: 'Something went wrong',
      });
  }
};
