const Joi = require('joi')
const SUPPORTED_METRICS = ['pageViews', 'sessions', 'sessionDuration']
const SUPPORTED_DIMENSIONS = ['day']
const metricDimensionSchema = Joi.object({
  metric: Joi.string().valid(...SUPPORTED_METRICS).required(),
  dimension: Joi.string().valid(...SUPPORTED_DIMENSIONS).default(null)
})

const pathParamsSchema = {
  validate: (value) => {
    const {
      id
    } = value
    const [ metric, dimension ] = id.split(':')
    return metricDimensionSchema.validate({ metric, dimension })
  }
}



module.exports ={ pathParamsSchema }