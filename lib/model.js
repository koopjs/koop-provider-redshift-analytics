const buildQuery = require('./query')
const CodedError = require('./coded-error')
const { paramsSchema } = require('./schema')
const {
  koopProviderRedshiftAnalytics: {
    metrics: METRICS = []
  } = {}
} = require('config')

class Model {
  async getData (req, callback) {
    const { error, value: params } = paramsSchema.validate({ ...req.params, ...req.query })

    if (error) {
      return callback(new CodedError(error.message, 400))
    }

    const query = buildQuery(params)
    query.then(results => {
      const geojson = translateToGeoJson(results)
      geojson.filtersApplied = { where: true }
      callback(null, geojson)
    }).catch(err => {
      callback(new Error(err.message))
    })
  }
}

function translateToGeoJson (redshiftData) {
  const features = redshiftData.map(record => {
    return {
      type: 'Feature',
      properties: castMetricValuesToNumber(record),
      geometry: null
    }
  })
  return {
    type: 'FeatureCollection',
    features
  }
}

function castMetricValuesToNumber (record) {
  return Object.entries(record).reduce((target, [key, value]) => {
    if (METRICS.includes(key) && isNumeric(value)) target[key] = +value
    else target[key] = value
    return target
  }, {})
}

function isNumeric (num) {
  return !isNaN(num)
}

module.exports = Model
