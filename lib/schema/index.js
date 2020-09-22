const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS,
    dimensions: DIMENSIONS
  }
} = require('config')
const time = require('./time')
const customJoi = Joi.extend(time)

const schema = customJoi.object({
  metric: Joi.string().valid(...METRICS).required(),
  dimension: Joi.string().valid(...DIMENSIONS).default(null),
  time: customJoi.time()
})

const paramsSchema = {
  validate: (value) => {
    const {
      id,
      time = 'null,null'
    } = value
    const [metric, dimension] = id.split(':')
    return schema.validate({ metric, dimension, time })
  }
}

module.exports = { paramsSchema }
