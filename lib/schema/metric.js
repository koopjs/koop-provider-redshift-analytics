const joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS = [],
    metricLookup = {}
  } = {}
} = require('config')

const metric = {
  type: 'metric',
  base: joi.string(),
  coerce: {
    method (value) {
      if (!value) return

      if (!METRICS.includes(value)) {
        return {
          errors: [new Error(`"metric" must be one of: ${METRICS.join(', ')}`)]
        }
      }

      return {
        value: metricLookup[value] || value
      }
    }
  }
}

module.exports = metric
