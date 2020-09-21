const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS,
    dimensions: DIMENSIONS
  }
} = require('config')
const time = require('./time')
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

const customJoi = Joi.extend(time)

const queryParamsSchema = customJoi.object({
  time: customJoi.time().default(function () { return { startDate: 'null', endDate: 'null' } })
})

module.exports = { routeParamsSchema, queryParamsSchema }
