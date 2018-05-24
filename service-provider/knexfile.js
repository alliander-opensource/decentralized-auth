const path = require('path');

const knexSettings = {
  client: 'pg',
  connection: process.env.MY_HOME_DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: path.resolve(__dirname, './src/database/migrations'),
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: path.resolve(__dirname, './src/database/seeds')
  }
};

module.exports = {
  development: knexSettings,
  production: knexSettings
};
