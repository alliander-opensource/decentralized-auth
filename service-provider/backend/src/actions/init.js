/**
 * Request handler to ensure session is initialized
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = async function requestHandler(req, res) {
  const { sessionId } = req;
  return res
    .status(200)
    .send({
      success: true,
      message: `Seed and key pair available for sessionId ${sessionId}`,
    });
};
