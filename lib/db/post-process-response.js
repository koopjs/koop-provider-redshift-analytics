const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    metricLookup = {},
    dimensionLookup = {}
  } = {}
} = require('config')
const reverseMetricLookup = _.invert(metricLookup)
const reverseDimensionLookup = _.invert(dimensionLookup)
const camelCase = require('./camel-case')
const createCompleteTimeseries = require('./create-complete-timeseries')
const metricDimensionTransform = require('./metric-dimension-transform')
const transposeAndAggregateByDimensions = require('./transpose-and-aggregate-by-dimensions')

function postProcessResponse (data, queryContext = {}) {
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

  postProcessed = metricDimensionTransform(data)

  if (timeseries) {
    postProcessed = createCompleteTimeseries({
      data: postProcessed || data,
      metric: reverseMetricLookup[metric],
      ...timeseries
    })
  }

  if (transposeAndAggregate) {
    postProcessed = transposeAndAggregateByDimensions({
      data: postProcessed || data,
      metric: reverseMetricLookup[metric],
      timeDimension,
      dimensions: dimensions.map(dimension => reverseDimensionLookup[dimension] || dimension)
    })
  }

  return postProcessed || data
}

module.exports = postProcessResponse
