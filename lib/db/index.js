const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      host,
      user,
      password,
      database,
      port
    } = {}
  } = {}
} = require('config')
const postProcessResponse = require('./post-process-response')

const db = require('knex')({
  client: 'pg',
  connection: {
    host,
    user,
    password,
    database,
    port
  },
  postProcessResponse
})

module.exports = db
