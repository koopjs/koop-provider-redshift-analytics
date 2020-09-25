const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS,
    dimensions: DIMENSIONS
  }
} = require('config')

const schema = Joi.object({
  metric: Joi.string().valid(...METRICS).required(),
  dimension: Joi.string().valid(...DIMENSIONS).default(null)
})

const paramsSchema = {
  validate: (value) => {
    const {
      id
    } = value
    const [metric, dimension] = id.split(':')
    return schema.validate({ metric, dimension })
  }
}

module.exports = { paramsSchema }
