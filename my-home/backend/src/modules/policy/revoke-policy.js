const diva = require('diva-irma-js');
const logger = require('../../logger')(module);
const mamDataSender = require('./mam_data_sender');

const Policy = require('../../database/models/Policy');
const Device = require('../../database/models/Device');


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

    const attributes = await diva.getAttributes(req.sessionId);
    const owner = {
      street: attributes['pbdf.pbdf.idin.address'][0],
      city: attributes['pbdf.pbdf.idin.city'][0],
    };

    const policyToDelete = await Policy
      .query()
      .where('owner', '=', owner)
      .andWhere('id', '=', policyId)
      .first();

    const remainingPolicies = await Policy
      .query()
      .where('owner', '=', owner)
      .andWhere('id', '!=', policyId)
      .andWhere('deviceId', '=', policyToDelete.deviceId);

    const device = await Device
      .query()
      .where('id', '=', policyToDelete.deviceId)
      .first();

    const authorizedServiceProviders = remainingPolicies.map(p => p.serviceProvider);
    mamDataSender.informUpdateSideKey(
      device.iotaAddress,
      authorizedServiceProviders,
    );

    const numDeleted = await Policy
      .query()
      .delete()
      .where('owner', '=', owner)
      .andWhere('id', '=', policyId);

    return res.status(200)
      .send({
        success: true,
        message: 'Deleted',
        numDeleted,
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
