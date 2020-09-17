const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      host,
      user,
      password,
      database,
      port
    } = {}
  }
} = require('config')

const knex = require('knex')({
  client: 'pg',
  connection: {
    host,
    user,
    password,
    database,
    port
  }
});

module.exports = knex
