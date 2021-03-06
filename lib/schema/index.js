const _ = require('lodash')
const Joi = require('joi')
const {
  koopProviderRedshiftAnalytics: {
    timeDimensions: TIME_DIMENSIONS = []
  } = {}
} = require('config')
const timeSchema = require('./time')
const whereSchema = require('./where')
const metricSchema = require('./metric')
const dimensionsSchema = require('./dimensions')
const customJoi = Joi.extend(timeSchema).extend(whereSchema).extend(metricSchema).extend(dimensionsSchema)

const schema = customJoi.object({
  metric: customJoi.metric().required(),
  dimensions: customJoi.dimensions().optional(),
  transposeAndAggregate: Joi.boolean().valid(true).optional(),
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
    const { metric, dimensions, options } = parseIdParam(id)
    const result = schema.validate({ metric, dimensions, time, where, ...options })
    if (result.error) return result

    return postProcess(result)
  }
}

function postProcess ({ value }) {
  const { dimensions, time, ...rest } = value
  if (!dimensions) {
    return { value: { ...rest, ...time } }
  }
  const parsedDimensions = parseDimensions(value.dimensions)
  return { value: { ...rest, dimensions, ...parsedDimensions, ...time } }
}

function parseIdParam (id) {
  const idRegex = /^(?<metric>[^:]+)(:)?((?<delimitedDimensions>[^~]+)(~?)(?<delimitedOptions>.+)?)?$/
  const { groups: { metric, delimitedDimensions, delimitedOptions } } = idRegex.exec(id)
  const dimensions = delimitedDimensions ? delimitedDimensions.split(',') : undefined
  const options = delimitedOptions ? parseOptions(delimitedOptions) : undefined
  return { metric, dimensions, options }
}

function parseDimensions (dimensions) {
  const timeDimension = dimensions.find(dimension => TIME_DIMENSIONS.includes(dimension))
  const nonTimeDimensions = _.difference(dimensions, [timeDimension])
  return {
    timeDimension,
    nonTimeDimensions
  }
}

function parseOptions (delimitedOptions) {
  return _.chain(delimitedOptions)
    .split(',')
    .map(key => { return [key, true] })
    .fromPairs()
    .value()
}

module.exports = { paramsSchema }
