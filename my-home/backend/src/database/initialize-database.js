const { Model } = require('objection');
const Knex = require('knex');
const knexSettings = require('../../knexfile');

const initializeDatabase = () => {
  const knex = Knex(knexSettings.production);
  Model.knex(knex);
};

module.exports = initializeDatabase;
