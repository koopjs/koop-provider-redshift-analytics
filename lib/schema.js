const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS,
    dimensions: DIMENSIONS
  }
} = require('config')
const metricDimensionSchema = Joi.object({
  metric: Joi.string().valid(...METRICS).required(),
  dimension: Joi.string().valid(...DIMENSIONS).default(null)
})

const routeParamsSchema = {
  validate: (value) => {
    const {
      id
    } = value
    const [metric, dimension] = id.split(':')
    return metricDimensionSchema.validate({ metric, dimension })
  }
}

module.exports = { routeParamsSchema }
