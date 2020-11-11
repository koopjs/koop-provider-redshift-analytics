const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    metricLookup = {},
    dimensionLookup = {}
  } = {}
} = require('config')
const reverseMetricLookup = _.invert(metricLookup)
const reverseDimensionLookup = _.invert(dimensionLookup)

module.exports = function (data) {
  if (_.isEmpty(reverseMetricLookup) && _.isEmpty(reverseDimensionLookup)) {
    return data
  }

  return data.map(record => {
    return _.mapKeys(record, (value, key) => {
      return reverseMetricLookup[key] || reverseDimensionLookup[key] || key
    })
  })
}
