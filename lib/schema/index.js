const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS,
    dimensions: DIMENSIONS
  }
} = require('config')
const time = require('./time')
const where = require('./where')
const customJoi = Joi.extend(time).extend(where)

const schema = customJoi.object({
  metric: Joi.string().valid(...METRICS).required(),
  dimension: Joi.string().valid(...DIMENSIONS).default(null),
  time: customJoi.time(),
  where: customJoi.where()
})

const paramsSchema = {
  validate: (value) => {
    const {
      id,
      time = 'null,null',
      where
    } = value
    const [metric, dimension] = id.split(':')
    return schema.validate({ metric, dimension, time, where })
  }
}

module.exports = { paramsSchema }
