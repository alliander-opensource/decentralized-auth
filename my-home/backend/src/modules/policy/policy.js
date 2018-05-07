/*
 * Converts a policy json structure to a message string representation
 * @function toMessage
 * @param {object} policy The Policy to convert
 * @returns {string} the resulting message string
 */
module.exports.toMessage = function toMessage(policy) {
  const message = `${policy.actorName.slice(0, 10)}... is allowed to \
  ${policy.action} ${policy.actee}, with as goal ${policy.goal}`;

  if (policy.conditions.length === 0) {
    return `${message}.`;
  }
  const conditionsPart = policy.conditions.reduce((result, condition, i) => {
    if (i === policy.conditions.length) {
      return `${result}, and when ${condition}`;
    }

    return `${result}, when ${condition}`;
  }, '');

  return `${message} ${conditionsPart}.`;
};
