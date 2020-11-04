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
const camelCase = require('./camel-case')
const createCompleteTimeseries = require('./create-complete-timeseries')
const metricDimensionTransform = require('./metric-dimension-transform')
const transposeAndAggregateByDimensions = require('./transpose-and-aggregate-by-dimensions')

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
      timeDimension,
      dimensions,
      snakeCases,
      transposeAndAggregate
    } = queryContext
    let postProcessed

    if (snakeCases) {
      postProcessed = camelCase(data, snakeCases)
    }

    if (timeseries) {
      postProcessed = createCompleteTimeseries({ data: postProcessed || data, metric, ...timeseries })
    }

    if (transposeAndAggregate) {
      postProcessed = transposeAndAggregateByDimensions({ data: postProcessed || data, metric, timeDimension, dimensions })
    }

    return postProcessed || data
  }
})

module.exports = db
