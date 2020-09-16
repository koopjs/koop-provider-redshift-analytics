const Joi = require('joi')
const config = require('config')
const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      eventColumn,
      sessionColumn,
      eventTimestampColumn
    }
  }
} = config
const knex = require('./knex')
const CodedError = require('./coded-error')
const { pathParamsSchema } = require('./schema')

class Model {
  async getData (req, callback) {

    const { error, value: params } = pathParamsSchema.validate(req.params)
    if (error) {
      callback(new CodedError(error.message, 400))
    }

    knex.select(eventColumn).withSchema(schema).from(table).then(results => {
      const geojson = translateToGeoJson(results)
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
