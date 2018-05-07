const { Model } = require('objection');

class Policy extends Model {
  static get tableName() {
    return 'policy';
  }
}

module.exports = Policy;
