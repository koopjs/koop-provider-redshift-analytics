const joi = require('joi')
const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    dimensions: DIMESNIONS = [],
    sessionMetrics: SESSION_METRICS = [],
    sessionDimensions: SESSION_DIMENSIONS = [],
    dimensionLookup = {}
  } = {}
} = require('config')

const dimensions = {
  type: 'dimensions',
  base: joi.array(),
  prepare: (value, helpers) => {
    const { state: { ancestors: [{ metric, transposeAndAggregate }] } } = helpers

    if (!value) return

    if (transposeAndAggregate && value.length !== 2) {
      return { errors: [new Error('transposeAndAgregate requires exactly two dimensions')] }
    }

    if (SESSION_METRICS.includes(metric)) {
      const errors = validateSessionDimensions(value)
      if (errors) return { errors }
    }

    const errors = validateDimensions(value)
    if (errors) return { errors }

    return {
      value: transformDimensionNames(value)
    }
  }
}

function validateSessionDimensions (value) {
  const unsupportedSessionDimensions = _.difference(value, SESSION_DIMENSIONS)
  if (unsupportedSessionDimensions.length > 0) {
    return [
      new Error(`Dimensions ["${unsupportedSessionDimensions.join('", "')}"] are not supported for session metrics`)
    ]
  }
}

function validateDimensions (value) {
  const unsupportedDimensions = _.difference(value, DIMESNIONS)
  if (unsupportedDimensions.length > 0) {
    return [
      new Error(`Dimensions ["${unsupportedDimensions.join('", "')}"] are not supported`)
    ]
  }
}

function transformDimensionNames (value) {
  return value.map(dimension => {
    return dimensionLookup[dimension] || dimension
  })
}

module.exports = dimensions
