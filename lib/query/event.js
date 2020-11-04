const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        event: eventSource
      } = {}
    } = {},
    metricLookup = {}
  } = {}
} = require('config')
const db = require('../db')
const {
  schema,
  table,
  eventColumn,
  timestampColumn
} = eventSource || defaultSource

function buildEventQuery (params) {
  const {
    dimensions = [],
    timeDimension
  } = params

  if (timeDimension) {
    return buildTimeDimensionedEventCountQuery(params)
  }

  if (dimensions.length) {
    return buildDimensionedEventCountQuery(params)
  }

  return buildEventCountQuery(params)
}

function buildTimeDimensionedEventCountQuery (params) {
  const {
    metric,
    dimensions,
    timeDimension,
    nonTimeDimensions,
    where,
    startDate,
    endDate,
    transposeAndAggregate
  } = params
  const rawSelect = [`DATE_TRUNC('${timeDimension}', ${timestampColumn} ) AS timestamp`].concat(nonTimeDimensions).join(', ')
  const rawGroupBy = [`DATE_TRUNC('${timeDimension}', ${timestampColumn} )`].concat(nonTimeDimensions).join(', ')
  const metricAlias = getMetricAlias(metric)
  return db.select(db.raw(rawSelect))
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', metricLookup[metric])
    .andWhereRaw(where)
    .groupByRaw(rawGroupBy)
    .orderByRaw(`DATE_TRUNC('${timeDimension}', ${timestampColumn} )`)
    .queryContext({
      timeseries: {
        startDate,
        endDate,
        interval: timeDimension
      },
      metric,
      snakeCases: metric === metricAlias ? undefined : [metricAlias],
      transposeAndAggregate,
      dimensions,
      timeDimension
    })
}

function buildDimensionedEventCountQuery ({ metric, dimensions, where, transposeAndAggregate }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(...dimensions)
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', metricLookup[metric])
    .andWhereRaw(where)
    .groupBy(...dimensions)
    .queryContext({
      snakeCases: metric === metricAlias ? undefined : [metricAlias],
      transposeAndAggregate,
      dimensions,
      metric
    })
}

function buildEventCountQuery ({ metric, where }) {
  const metricAlias = getMetricAlias(metric)
  return db
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', metricLookup[metric])
    .andWhereRaw(where)
    .queryContext({
      snakeCases: metric === metricAlias ? undefined : [metricAlias]
    })
}

function getMetricAlias (metric) {
  const isCamelCased = /^[a-z][A-Za-z]*$/.test(metric)
  if (!isCamelCased) return metric

  return _.snakeCase(metric)
}

module.exports = buildEventQuery
