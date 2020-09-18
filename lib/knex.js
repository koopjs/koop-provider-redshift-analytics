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
const createCompleteTimeseries = require('./create-complete-timeseries')

const knex = require('knex')({
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
      startDate,
      endDate,
      interval
    } = queryContext
    if (timeseries) return createCompleteTimeseries({ data, startDate, endDate, interval })
    return data
  }
})

module.exports = knex
