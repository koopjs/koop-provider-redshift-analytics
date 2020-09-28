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
const camelCase = require('./camel-case')
const createCompleteTimeseries = require('./create-complete-timeseries')

const db = require('knex')({
  client: 'pg',
  connection: {
    host,
    user,
    password,
    database,
    port
  },
  postProcessResponse: (data, queryContext = {}) => {
    const {
      timeseries,
      metric,
      startDate,
      endDate,
      interval,
      snakeCases
    } = queryContext
    let postProcessed

    if (snakeCases) {
      postProcessed = camelCase(data, snakeCases)
    }

    if (timeseries) {
      postProcessed = createCompleteTimeseries({ data: postProcessed || data, metric, startDate, endDate, interval })
    }

    return postProcessed || data
  }
})

module.exports = db
