const { buildEventQuery, buildSessionQuery } = require('./queries')
const { koopProviderRedshiftAnalytics: { metrics: METRICS } }  = require('config')
const CodedError = require('./coded-error')
const { routeParamsSchema } = require('./schema')

class Model {
  async getData (req, callback) {
    const { error, value: routeParams } = routeParamsSchema.validate(req.params)

    if (error) {
      return callback(new CodedError(error.message, 400))
    }

    const query = buildQuery(routeParams, { where: req.query.where })
    console.log(query.toString())
    query.then(results => {
      const geojson = translateToGeoJson(results)
      geojson.filtersApplied = { where: true }
      callback(null, geojson)
    }).catch(err => {
      callback(new Error(err.message))
    })
  }
}

function buildQuery({ metric, dimension }, options) {
  if (metric === 'pageViews') return buildEventQuery({ metric, dimension, ...options })
  if (metric === 'sessions') return buildSessionQuery({ metric, dimension, ...options })
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
    if(METRICS.includes(key) && isNumeric(value)) target[key] = +value
    else target[key] = value
    return target
  }, {})
}

function isNumeric(num){
  return !isNaN(num)
}

module.exports = Model
