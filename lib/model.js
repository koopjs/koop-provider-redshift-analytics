const Joi = require('joi')
const config = require('config')
const { buildEventQuery } = require('./queries')
const CodedError = require('./coded-error')
const { routeParamsSchema } = require('./schema')

class Model {
  async getData (req, callback) {
    const { error, value: routeParams } = routeParamsSchema.validate(req.params)

    if (error) {
      return callback(new CodedError(error.message, 400))
    }

    const query = buildQuery(routeParams, { where: req.query.where })
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
}

function translateToGeoJson (redshiftData) {
  const features = redshiftData.map(record => {
    return {
      type: 'Feature',
      properties: record,
      geometry: null
    }
  })
  return {
    type: 'FeatureCollection',
    features
  }
}

module.exports = Model
